use crate::state::{Point,GameState,Players,PlayerTurnResult,PREFIX,CURRENT_GAME_PREFIX};
use crate::util::{verify_init_proof,verify_player_move_proof,get_last_element,assert_true,get_unix_timestamp};
use crate::error::{GameError};

use anchor_lang::{prelude::*};

pub mod state;
pub mod error;
pub mod util;

declare_id!("A4RgxkoFpMWhsZn8DimLckU6c8s93cJRJg8sPKu3jRop");

#[program]
pub mod zkcontract2 {
    use super::*;

    pub fn setup(ctx: Context<ContractSetup>) -> Result<()> {
        let contract_data=&mut ctx.accounts.contract_data;
        contract_data.game_counter=0;
        msg!("contract_data counter= {:?}",contract_data.game_counter);
        Ok(())
    }

    pub fn initialize(ctx: Context<InitGame>,   total_moves: u8,move_time: u64, 
        signals:[[u8; 32];4],proof: [u8; 256]) -> Result<()> {
        
        ctx.accounts.current_game.game_counter=ctx.accounts.contract_data.game_counter;
        msg!("28");
        ctx.accounts.game_data.target_position_hash=signals[0];
        ctx.accounts.game_data.grid_size=get_last_element(&signals[1]);
        ctx.accounts.game_data.current_pos=Point::new(
            get_last_element(&signals[2]),
            get_last_element(&signals[3])
        );
        ctx.accounts.game_data.last_pos=Point::new(0,0);
        ctx.accounts.game_data.game_counter= ctx.accounts.contract_data.game_counter;
        ctx.accounts.contract_data.game_counter+=1;
        msg!("30");
        ctx.accounts.game_data.player_turn=Players::Player2;
        ctx.accounts.game_data.total_moves=total_moves;
        ctx.accounts.game_data.move_time=move_time;
        ctx.accounts.game_data.player1_account=ctx.accounts.signer.key();
        ctx.accounts.game_data.move_timestamp=get_unix_timestamp();
        // msg!("ctx.accounts.game_data.move_timestamp={:?}",ctx.accounts.game_data.move_timestamp);
        // msg!("proof= {:?}",proof);
        msg!("last pos= {:?}",ctx.accounts.game_data.last_pos);
        msg!("target_position_hash= {:?}",ctx.accounts.game_data.target_position_hash);
        msg!("grid_size= {:?}",ctx.accounts.game_data.grid_size);
        msg!("game_counter= {:?}", ctx.accounts.contract_data.game_counter);
        msg!("move_timestamp= {:?}", ctx.accounts.game_data.move_timestamp);
        msg!("total_moves= {:?}", ctx.accounts.game_data.total_moves);
       
        let proof_value=verify_init_proof(proof,signals).unwrap();
        assert_true(proof_value,ProgramError::from(GameError::VerifyError),
        "Verify error",)?;
        
        msg!("proof verify = {:?} ",proof_value);
        // panic!("Fail here");
        Ok(())
    }

    pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
        assert_true(  ctx.accounts.game_data.game_state == GameState::Setup,
            ProgramError::from(GameError::GameNotInit),
            "Game not in init state",)?;
        ctx.accounts.game_data.game_state=GameState::Start;
        ctx.accounts.game_data.player2_account=ctx.accounts.signer.key();
        ctx.accounts.game_data.player_turn=Players::Player2;
        ctx.accounts.game_data.move_timestamp=get_unix_timestamp();
        Ok(())
    }

    pub fn player_move(ctx: Context<PlayerMove>,x: u8, y:u8)->Result<()>{
        let new_pos=Point::new(x,y);
        assert_true(  !ctx.accounts.game_data.last_pos.matches(&new_pos) ,
            ProgramError::from(GameError::SamePositionError),
            "Move to invalid position",)?;
        assert_true(ctx.accounts.game_data.player_turn== Players::Player2,
            ProgramError::from(GameError::OtherPlayersTurn),
            "Other players turn"
        )?;
        // if ctx.accounts.game_data.move_counter>0 {
            ctx.accounts.game_data.last_pos=ctx.accounts.game_data.current_pos;
        // }

        //Check time
        let delta_time=get_unix_timestamp().checked_sub(ctx.accounts.game_data.move_timestamp).unwrap();
        assert_true(delta_time > ctx.accounts.game_data.move_time as i64,
            ProgramError::from(GameError::TimeoutError),
            "Other players turn"
        )?;

        ctx.accounts.game_data.current_pos=new_pos;
        ctx.accounts.game_data.move_counter+=1;
        ctx.accounts.game_data.player_turn=Players::Player1;
        ctx.accounts.game_data.move_timestamp=get_unix_timestamp();
        Ok(())
    }

    pub fn player_move_verify(ctx: Context<PlayerMoveVerify>,
        signals:[[u8; 32];9],proof: [u8; 256])->Result<()>{
            assert_true(ctx.accounts.game_data.player1_account==ctx.accounts.signer.key(),
            ProgramError::from(GameError::InvalidMovePlayer),
            "Only player who setup the game can verify move",
        )?;
        ctx.accounts.game_data.player_turn=Players::Player2;
        let exact=get_last_element(&signals[0]);
        let far=get_last_element(&signals[1]);
        let same=get_last_element(&signals[2]);
        let _hash=signals[3];
        assert_true(_hash== ctx.accounts.game_data.target_position_hash,
            ProgramError::from(GameError::WrongHashError),
            "Hash does not match",
        )?;
        //Check time
         //Check time
         let delta_time=get_unix_timestamp().checked_sub(ctx.accounts.game_data.move_timestamp).unwrap();
         assert_true(delta_time > ctx.accounts.game_data.move_time as i64,
             ProgramError::from(GameError::TimeoutError),
             "Other players turn"
         )?;
        let _x1=get_last_element(&signals[5]);
        let _y1=get_last_element(&signals[6]);
        let _x2=get_last_element(&signals[7]);
        let _y2=get_last_element(&signals[8]);
        if exact==1 {
            //game won by player 2
            ctx.accounts.game_data.winner=Players::Player2;
            ctx.accounts.game_data.player_turn_result=PlayerTurnResult::Exact;
            ctx.accounts.game_data.game_state=GameState::End;
            **ctx.accounts.signer.to_account_info().try_borrow_mut_lamports()? +=
                **ctx.accounts.current_game.to_account_info().try_borrow_lamports()?;
            **ctx.accounts.current_game.to_account_info().try_borrow_mut_lamports()? = 0;
        }else if same==1 {
            ctx.accounts.game_data.player_turn_result=PlayerTurnResult::Same;
        }else {
            if far == 0 {
                ctx.accounts.game_data.player_turn_result=PlayerTurnResult::Near;
            }else{
                ctx.accounts.game_data.player_turn_result=PlayerTurnResult::Far;
            }
        }
        if ctx.accounts.game_data.move_counter >= ctx.accounts.game_data.total_moves 
        && ctx.accounts.game_data.player_turn_result!= PlayerTurnResult::Exact{
            ctx.accounts.game_data.winner=Players::Player1;
            ctx.accounts.game_data.game_state=GameState::End;
            **ctx.accounts.signer.to_account_info().try_borrow_mut_lamports()? +=
            **ctx.accounts.current_game.to_account_info().try_borrow_lamports()?;
            **ctx.accounts.current_game.to_account_info().try_borrow_mut_lamports()? = 0;
        }
        ctx.accounts.game_data.move_timestamp=get_unix_timestamp();
        //verify proof
        // match verify_player_move_proof(proof,signals){
        //     Ok(s)=>Ok(s),
        //     Err(_)=>Err(GameError::VerifyError.into()),
        // }?;
        let proof_value=verify_player_move_proof(proof,signals).unwrap();
        assert_true(proof_value,ProgramError::from(GameError::VerifyError),
        "Verify error",)?;
        Ok(())
    }
    
    pub fn forfeit_game(ctx: Context<ForfeitGame>)->Result<()>{
        assert_true(ctx.accounts.game_data.player1_account==ctx.accounts.signer.key()
        || ctx.accounts.game_data.player2_account==ctx.accounts.signer.key(),
            ProgramError::from(GameError::InvalidMovePlayer),
            "Only one of the players can forfeit",
        )?;
        if ctx.accounts.game_data.player1_account==ctx.accounts.signer.key()
        {
            ctx.accounts.game_data.winner=Players::Player2;
        }
        if ctx.accounts.game_data.player2_account==ctx.accounts.signer.key() 
        {
            ctx.accounts.game_data.winner=Players::Player1;
        }   
        ctx.accounts.game_data.game_state=GameState::End;
        //Known issue. Only player can delete current game
        **ctx.accounts.signer.to_account_info().try_borrow_mut_lamports()? +=
        **ctx.accounts.current_game.to_account_info().try_borrow_lamports()?;
        **ctx.accounts.current_game.to_account_info().try_borrow_mut_lamports()? = 0;
        Ok(())
    }
}



#[account]
pub struct GameData {
    pub total_moves: u8,
    //zk circuit hash of position and sk
    pub target_position_hash: [u8; 32],
    //target pos
    pub target_pos: Point,
    //Current move count
    pub move_counter: u8,
    //state
    pub game_state: GameState,
    //game_counter
    pub game_counter: u64,
    //grid size
    pub grid_size: u8,
    //player start position
    pub last_pos: Point,
    //current position
    pub current_pos: Point,
    //player 1
    pub player1_account: Pubkey,
    //player 2
    pub player2_account: Pubkey,
    //turn
    pub player_turn: Players,
    //result
    pub player_turn_result: PlayerTurnResult,
    //winner
    pub winner: Players,
    //forfeit limit
    pub move_time: u64 ,
    //last timestamp
    pub move_timestamp: i64,
}

#[account]
pub struct ContractData {
    pub game_counter: u64,
}

#[account]
pub struct CurrentGame{
    pub game_counter: u64,
}

#[derive(Accounts)]
pub struct ContractSetup<'info>{
    #[account(
        init, 
        payer = signer, 
        space = 8 + 8, 
        seeds = [PREFIX.as_bytes(),signer.key().as_ref()],
        bump
    )] 
    pub contract_data: Account<'info, ContractData>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(total_moves: u8,move_time: u64, signals:[[u8; 32];4],proof: [u8; 256])]
pub struct InitGame<'info> {
    // Making a global account for storing votes
    #[account(
        init, 
        seeds = [PREFIX.as_bytes(),&contract_data.game_counter.to_le_bytes()],
        payer = signer, 
        //147
        space = 8 + 1 + 1*32 + 2 + 1+ 1 + 8 + 1 + 2 + 2+ 32 +32 + 1 + 1 + 1 + 8 + 16, 
        bump,
    )] 
    pub game_data: Account<'info, GameData>,

    #[account(
        init, 
        seeds = [CURRENT_GAME_PREFIX.as_bytes(),signer.key().as_ref()],
        payer = signer, 
        //147
        space = 8 + 8, 
        bump,
    )] 
    pub current_game: Account<'info, CurrentGame>,


    #[account(mut)] 
    pub contract_data: Account<'info, ContractData>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}



#[derive(Accounts)]
pub struct JoinGame<'info> {
    // Making a global account for storing votes
    #[account(mut)] 
    pub game_data: Account<'info, GameData>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(x: u8, y: u8)]
pub struct PlayerMove<'info> {
    // Making a global account for storing votes
    #[account(mut)] 
    pub game_data: Account<'info, GameData>,

    #[account(mut,address = game_data.player2_account)] // @ GameError::InvalidPlayer
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
#[instruction( signals:[[u8; 32];9],proof: [u8; 256])]
pub struct PlayerMoveVerify<'info>{
    #[account(mut)] 
    pub game_data: Account<'info, GameData>,

    #[account(mut)] 
    pub current_game: Account<'info, CurrentGame>,

    #[account(mut,address = game_data.player1_account)] // @ GameError::InvalidPlayer
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}



#[derive(Accounts)]
pub struct ForfeitGame<'info>{
    #[account(mut)] 
    pub game_data: Account<'info, GameData>,

    #[account(mut)] 
    pub current_game: Account<'info, CurrentGame>,

    #[account(mut)] // @ GameError::InvalidPlayer
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}
