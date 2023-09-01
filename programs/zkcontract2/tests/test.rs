use anchor_lang::{AccountDeserialize,AnchorSerialize,context::Context,error::Error,account,prelude::AccountMeta};
use solana_program::{instruction::Instruction,system_program};
use solana_program_test::{processor, tokio, BanksClientError, ProgramTest, ProgramTestContext};
use solana_sdk::{
  account::AccountSharedData, pubkey::Pubkey, signature::Keypair, signer::Signer,
  transaction::Transaction,
};
use borsh::{BorshDeserialize,BorshSerialize};

const join_discriminator: [u8;8]=[107, 112, 18, 38, 56, 173, 60, 128];
const player_move_discriminator: [u8;8]=[42, 103, 48, 170, 54, 223, 66, 223];
const player_move_verify_discriminator: [u8;8]=[248, 9, 74, 70, 39, 151, 246, 125];

struct TestFixture {
  program_context: ProgramTestContext,
  admin: Keypair,
  player1: Keypair,
  player2: Keypair,
}

//sk 1234
//hash 10879556744702142407740287960147890559770314072634951580975962698448276191072
//4,7 - p1
//2,1 - p2
#[derive(BorshDeserialize,BorshSerialize)]
pub struct InitZKData{
  discriminator: [u8;8],
  total_moves: u8,
  move_time: u64,
  signals: [u8;128],
  proof: [u8;256]
}

pub const init_zk_data: InitZKData = InitZKData{
  discriminator:[175, 175, 109, 31, 13, 152, 155, 237],
//move count
total_moves:4,
//seconds
move_time:9,
signals: [24,13,156,99,241,40,58,27,205,222,238,18,49,18,179,56,56,179,166,206,192,49,110,220,244,192,5,7,234,174,119,96,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
proof:[37,81,134,125,4,186,47,156,224,143,26,107,210,70,132,212,124,36,59,68,162,209,116,131,176,42,168,184,230,238,56,171,0,193,122,72,212,121,150,143,64,4,4,158,196,192,63,235,236,146,179,73,62,93,184,126,216,29,54,25,132,151,110,134,31,77,71,79,34,11,102,3,89,25,66,82,112,240,31,164,146,64,8,103,114,247,64,132,169,103,240,63,117,36,34,35,12,118,173,8,236,29,254,252,199,34,164,168,228,165,3,195,133,157,213,185,7,125,93,59,44,133,141,143,56,131,76,118,13,78,183,245,78,136,202,39,130,64,65,2,96,224,219,50,40,138,88,60,140,49,40,31,170,144,250,225,223,40,219,213,20,100,195,45,198,76,15,11,208,51,20,212,211,124,115,187,10,144,95,44,98,44,92,13,221,155,42,81,90,206,64,41,1,176,203,5,74,188,176,24,184,62,221,87,57,206,177,242,78,182,120,190,112,228,69,97,243,54,112,38,120,101,20,47,27,79,97,56,134,162,98,191,98,204,77,10,69,84,84,213,234,29,132,197,224,98,108,172,216,21,157,0,9,31,244,190]
};

#[derive(BorshDeserialize,BorshSerialize)]
pub struct PlayerMoveInstruction{
  discriminator: [u8;8],
  x: u8,
  y: u8
}

impl TestFixture{
  pub async fn new()->Self{
    let mut validator=ProgramTest::default();
    validator.add_program("zkcontract2", zkcontract2::ID, processor!(zkcontract2::entry));
    let admin=Keypair::new();
    let player1=Keypair::new();
    let player2=Keypair::new();

    fund_account(&admin,&mut validator);
    fund_account(&player1,&mut validator);
    fund_account(&player2, &mut validator);

    TestFixture{
      admin:admin,
      player1:player1,
      player2:player2,
      program_context: validator.start_with_context().await
    }
  }

  
  pub fn get_context(&mut self)->&mut ProgramTestContext{
    &mut self.program_context
  }

  pub fn admin(&self)->Keypair{
    clone_keypair(&self.admin)
  }
  pub fn player1(&self)->Keypair{
    clone_keypair(&self.player1)
  }
  pub fn player2(&self)->Keypair{
    clone_keypair(&self.player2)
  }
}

#[tokio::test]
async fn test_initialize() {
  
  let mut fixture=TestFixture::new().await;
  let admin=fixture.admin();
  let player1=fixture.player1();
  let player2=fixture.player2();

  let context = fixture.get_context();
  

  let setup_pda=get_setup_pda(&admin.pubkey());

  let setup_ix=Instruction::new_with_bytes(
    zkcontract2::ID,
    &[137, 0, 196, 175, 166, 131, 77, 178],
    vec![
      AccountMeta::new(setup_pda,false),
      AccountMeta::new(admin.pubkey(),true),
      AccountMeta::new(solana_program::system_program::ID, false),
    ]
  );  
 
 //Setup game
  execute(context, &admin, &[setup_ix], vec![&admin]).await.unwrap();
  
  let setup_account=context
  .banks_client
  .get_account(setup_pda)
  .await
  .unwrap()
  .unwrap();

  let setup_account_data = zkcontract2::ContractData::try_deserialize(&mut setup_account.data.as_ref()).unwrap();
  let game_counter=setup_account_data.game_counter;

  let game_data_pda=get_game_data_pda(game_counter);
  let current_game_pda=get_current_game_pda(&player1.pubkey());

  assert!(context
    .banks_client
    .get_account(game_data_pda)
    .await
    .unwrap()
    .is_none());

    let mut buffer: Vec<u8>=Vec::new();
    init_zk_data.serialize(&mut buffer);

    let init_ix=Instruction::new_with_bytes(
      zkcontract2::ID,
      &buffer,
      vec![
        AccountMeta::new(game_data_pda,false),
        AccountMeta::new(current_game_pda,false),
        AccountMeta::new(setup_pda,false),
        AccountMeta::new(player1.pubkey(),true),
        AccountMeta::new(solana_program::system_program::ID, false),
      ]
    );  
   
   //Init game
    execute(context, &player1, &[init_ix], vec![&player1]).await.unwrap();

    
    assert_eq!(get_account_data::<zkcontract2::GameData>(context,game_data_pda).await.total_moves,4);


  //Join game by player 2
  let join_ix=Instruction::new_with_bytes(
    zkcontract2::ID,
    &join_discriminator,
    vec![
      AccountMeta::new(game_data_pda,false),
      AccountMeta::new(player2.pubkey(),true),
      AccountMeta::new(solana_program::system_program::ID, false),
    ]
  );  

  execute(context, &player2, &[join_ix], vec![&player2]).await.unwrap();
  assert_eq!(get_account_data::<zkcontract2::GameData>(context,game_data_pda).await.player2_account,player2.pubkey());
  assert_eq!(get_account_data::<zkcontract2::GameData>(context,game_data_pda).await.current_pos.matches(&zkcontract2::state::Point::new(2,1)),true);
  // let mut game_data=get_account_data::<zkcontract2::GameData>(context,game_data_pda).await;
  // game_data.move_timestamp-=10;
  
  //player 2 move
  let move1_data=PlayerMoveInstruction{
    discriminator: player_move_discriminator,
    x:3,
    y:4,
  };

  let p2_move_ix=Instruction::new_with_bytes(
    zkcontract2::ID,
    &get_serialized_data::<PlayerMoveInstruction>(move1_data),
    vec![
      AccountMeta::new(game_data_pda,false),
      AccountMeta::new(player2.pubkey(),true),
      AccountMeta::new(solana_program::system_program::ID, false),
    ]
  );  
  
  execute(context, &player2, &[p2_move_ix], vec![&player2]).await.unwrap();
  
  assert_eq!(get_account_data::<zkcontract2::GameData>(context,game_data_pda).await.current_pos.matches(&zkcontract2::state::Point::new(3,4)),true);

  //Player move verify

}

async fn get_account_data<T>(context: &mut ProgramTestContext,key: Pubkey)->T
where T : AccountDeserialize{
  let data_account=context
    .banks_client
    .get_account(key)
    .await
    .unwrap()
    .unwrap();
    
    let account_data =T::try_deserialize(&mut data_account.data.as_ref()).unwrap();
    account_data

}

fn get_serialized_data<T>(x: T)->Vec<u8> where T: BorshSerialize{
  let mut buffer: Vec<u8>=Vec::new();
  x.serialize(&mut buffer);
  buffer
}

fn add_account(validator: &mut ProgramTest) -> Keypair {
    let keypair = Keypair::new();
    let account = AccountSharedData::new(1_000_000_000, 0, &solana_sdk::system_program::id());
    validator.add_account(keypair.pubkey(), account.into());
    keypair
  }

fn fund_account(keypair: &Keypair, validator: &mut ProgramTest){
  let account = AccountSharedData::new(1_000_000_000, 0, &solana_sdk::system_program::id());
  validator.add_account(keypair.pubkey(), account.into());
    
}

fn get_setup_pda(admin: &Pubkey)->Pubkey{
  Pubkey::find_program_address(
    &[zkcontract2::state::PREFIX.as_ref(),admin.as_ref()],
    &zkcontract2::id()
  ).0
}

fn get_game_data_pda(counter: u64)->Pubkey{
  Pubkey::find_program_address(
    &[zkcontract2::state::PREFIX.as_ref(),&counter.to_le_bytes()],
    &zkcontract2::id()
  ).0
}

fn get_current_game_pda(signer: &Pubkey)->Pubkey{
  Pubkey::find_program_address(
    &[zkcontract2::state::CURRENT_GAME_PREFIX.as_bytes(),&signer.as_ref()],
    &zkcontract2::id()
  ).0
}

async fn execute(
  context: &mut ProgramTestContext,
  payer: &Keypair,
  instructions: &[Instruction],
  signers: Vec<&Keypair>,
) -> Result<(), BanksClientError> {
  let transaction = Transaction::new_signed_with_payer(
      instructions,
      Some(&payer.pubkey()),
      &signers,
      context.banks_client.get_latest_blockhash().await?,
  );
  context.banks_client.process_transaction(transaction).await
}

fn clone_keypair(k: &Keypair)->Keypair{
  Keypair::from_bytes(k.to_bytes().as_slice()).unwrap()
}

