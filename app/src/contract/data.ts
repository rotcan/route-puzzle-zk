
import { publicKey, u64, bool,u128 } from '@solana/buffer-layout-utils';
import { u32, u8, struct, blob } from '@solana/buffer-layout';
import * as beet from '@metaplex-foundation/beet';
import { Connection, PublicKey } from '@solana/web3.js';
import * as borsh from 'borsh';
import { contractDataAddress, getCurrentGameAddress, getGameDataAddress } from './instruction';

export interface ContractData{
    discriminator: Uint8Array,
    game_counter: bigint;
  };
  
  export const ContractSetupLayout = struct<ContractData>([
    blob(8,'discriminator'),
    u64('game_counter'),
  ]);
  
export enum Players{
  Player1,
  Player2
}

export enum GameState {
  Setup,
  Start,
  End,
}

export enum PlayerTurnResult {
  Same,
  Near,
  Far,
  Exact
}


export interface CurrentGame{
  discriminator: Uint8Array,
  game_counter: bigint;
};

export const CurrentGameLayout = struct<CurrentGame>([
  blob(8,'discriminator'),
  u64('game_counter'),
]);
 
  export interface GameData{
    discriminator: Uint8Array,
    total_moves: number;
    target_position_hash: Uint8Array;
    target_pos: number;
    move_counter: number;
    game_state: GameState;
    game_counter: bigint;
      //grid size
    grid_size: number;
      //player start position
    last_pos: Uint8Array;
      //current position
    current_pos: Uint8Array;
      //player 1
    player1_account: PublicKey;
      //player 2
    player2_account: PublicKey;
      //turn
    player_turn: Players;
      //result
    player_turn_result: PlayerTurnResult;
      //winner
    winner: Players;
      //forfeit limit
    move_time: bigint ;
      //last timestamp
    move_timestamp: bigint;
  };
  
  export const GameDataLayout = struct<GameData>([
    blob(8,'discriminator'),
    u8('total_moves'),
    blob(32,'target_position_hash'),
    blob(2,'target_pos'),
    u8('move_counter'),
    u8('game_state'),
    u64('game_counter'),
    u8('grid_size'),
    blob(2,'last_pos'),
    blob(2,'current_pos'),
    publicKey('player1_account'),
    publicKey('player2_account'),
    u8('player_turn'),
    u8('player_turn_result'),
    u8('winner'),
    u64('move_time'),
    u128('move_timestamp'),
  ]);
  
  

  export const getContractData=async({connection}:{connection: Connection}):Promise<ContractData | undefined>=>{
    const address=contractDataAddress();
    const data= await connection.getAccountInfo(new PublicKey(address));
    if(data){
      console.log("address",address);
      const object=ContractSetupLayout.decode(data!.data);
      // console.log("object",address,object);
      return object;
    }
    // console.log("object",address,object);
    return undefined;
  } 

  export const getGameData=async({connection,counter}:{connection: Connection,counter:string}):Promise<GameData|undefined>=>{
    const address=getGameDataAddress({counter});
    const data= await connection.getAccountInfo(new PublicKey(address));
    if(data){
      const object=GameDataLayout.decode(data!.data);
      // console.log("object",address,object);
      return object;
    }
    return undefined
  } 

  export const getCurrentGame=async({connection,playerKey}:{connection: Connection,playerKey:string}):Promise<CurrentGame|undefined>=>{
    const address=getCurrentGameAddress({playerPubkey: playerKey});
    const data= await connection.getAccountInfo(new PublicKey(address));
    if(data){
    const object=CurrentGameLayout.decode(data!.data);
    // console.log("object",address,object);
    return object;
    }
    return undefined;
  } 