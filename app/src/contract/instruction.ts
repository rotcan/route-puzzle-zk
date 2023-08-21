
import { AccountMeta, Connection, GetVersionedTransactionConfig, PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { createSetupInstruction, setupContractAccounts } from './instruction/setup';

import BN from 'bn.js';
import * as buffer from "buffer";
import { createInitializeInstruction, initializeAccounts, initializeInstructionArgs } from "./instruction/initialize";
import { createJoinGameInstruction, joinGameAccounts } from "./instruction/joinGame";
import { createPlayerMoveInstruction, playerMoveAccounts, playerMoveInstructionArgs } from "./instruction/playerMove";
import { createPlayerMoveVerifyInstruction, playerMoveVerifyAccounts, playerMoveVerifyInstructionArgs } from "./instruction/playerMoveVerify";
import { createForfeitGameInstruction, forfeitAccounts } from "./instruction/forfeit";
window.Buffer = buffer.Buffer

export const PROGRAM_ID="A4RgxkoFpMWhsZn8DimLckU6c8s93cJRJg8sPKu3jRop";
export const ADMIN="7Eru7TCcRuMxaZEBu6tVKBz8U3cqYrf7wqzuhSogfEve";
export const PREFIX="ZKGame";
export const GAME_PREFIX="ZKGameCurrent";
//export const connection=new Connection("https://api.devnet.solana.com");
export const commitment = "finalized";
export const connection=new Connection("http://127.0.0.1:8899",{commitment});


export const contractDataAddress=():string=>{
  const contractDataAccount=PublicKey.findProgramAddressSync([
    Buffer.from(PREFIX,"utf8"),
    new PublicKey(ADMIN).toBuffer(),
   // new PublicKey(PROGRAM_ID).toBuffer()
  ],
  
  new PublicKey(PROGRAM_ID),);
  return contractDataAccount[0].toBase58();
}

export const getBNBuffer = (num: number | string): Buffer => {
    return new BN(num).toArrayLike(Buffer, "le", 8);
}

export const getGameDataAddress=({counter}:{counter:string}):string=>{
  // console.log("getBNBuffer(counter)",getBNBuffer(counter));
  const contractDataAccount=PublicKey.findProgramAddressSync([
    Buffer.from(PREFIX,"utf8"),
    //new Uint8Array([counter]),
    getBNBuffer(counter),
   // new PublicKey(PROGRAM_ID).toBuffer()
  ],
  
  new PublicKey(PROGRAM_ID),);
  return contractDataAccount[0].toBase58();
}


export const getCurrentGameAddress=({playerPubkey}:{playerPubkey:string}):string=>{
  const contractDataAccount=PublicKey.findProgramAddressSync([
    Buffer.from(GAME_PREFIX,"utf8"),
    //new Uint8Array([counter]),
   // getBNBuffer(playerPubkey),
   new PublicKey(playerPubkey).toBuffer(),
   // new PublicKey(PROGRAM_ID).toBuffer()
  ],
  
  new PublicKey(PROGRAM_ID),);
  return contractDataAccount[0].toBase58();
}


export const createSetupGameIx=async({player1}:{player1: PublicKey}):Promise<TransactionInstruction>=>{
 
  const address=contractDataAddress();
  console.log("contractDataAccount",address);
  const ix= createSetupInstruction({
    contractData:new PublicKey(address),
    signer: player1,
  } as setupContractAccounts);

  return ix;
}

export const createInitializeGameIx=async({player1,counter, moves,
proof, signals, timeout}:{player1: PublicKey,counter: string, 
  moves: number,
timeout: number, signals: number[], proof: number[],}):Promise<TransactionInstruction>=>{
 
  const contractAddress=contractDataAddress();
  const gameAddress=getGameDataAddress({counter});
  const currentGameAddress=getCurrentGameAddress({playerPubkey: player1.toBase58()});
  console.log("gameAddress",gameAddress,contractAddress)
  const ix= createInitializeInstruction({
    contractData:new PublicKey(contractAddress),
    signer: player1,
    gameData: new  PublicKey(gameAddress),
    currentGame: new  PublicKey(currentGameAddress),
  } as initializeAccounts,
  {
    moveTime: timeout,
    proof,
    signals,
    totalMoves: moves
  } as initializeInstructionArgs);

  return ix;
}


export const createJoinGameIx=async({player2,counter}:{player2: PublicKey,counter: string, 
    }):Promise<TransactionInstruction>=>{
   
    const gameAddress=getGameDataAddress({counter});
    const ix= createJoinGameInstruction({
      signer: player2,
      gameData: new  PublicKey(gameAddress),
    } as joinGameAccounts);
  
    return ix;
  }

  export const createPlayerMoveIx=async({player2,counter,x,y}:{player2: PublicKey,counter: string, 
    x: number, y: number
  }):Promise<TransactionInstruction>=>{
 
  const gameAddress=getGameDataAddress({counter});
  const ix= createPlayerMoveInstruction({
    signer: player2,
    gameData: new  PublicKey(gameAddress),
  } as playerMoveAccounts,
  {x, y} as playerMoveInstructionArgs);

  return ix;
}

export const createPlayerMoveVerifyIx=async({player1,counter,proof, signals}:{player1: PublicKey,counter: string, 
  signals: number[], proof: number[],
}):Promise<TransactionInstruction>=>{

const gameAddress=getGameDataAddress({counter});
const currentGameAddress=getCurrentGameAddress({playerPubkey: player1.toBase58()});
const ix= createPlayerMoveVerifyInstruction({
  signer: player1,
  gameData: new  PublicKey(gameAddress),
  currentGame: new PublicKey(currentGameAddress),
} as playerMoveVerifyAccounts,
{proof, signals} as playerMoveVerifyInstructionArgs);

return ix;
}


export const createForfeitGameIx=async({player,player1, counter}:{player: PublicKey,
  player1: string,counter: string, 
}):Promise<TransactionInstruction>=>{

const gameAddress=getGameDataAddress({counter});
const currentGameAddress=getCurrentGameAddress({playerPubkey: player1});
const ix= createForfeitGameInstruction({
  signer: player,
  currentGame: new PublicKey(currentGameAddress),
  gameData: new  PublicKey(gameAddress),
} as forfeitAccounts);

return ix;
}