
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import { PROGRAM_ID } from '../instruction';

export type initializeAccounts = {
    gameData: web3.PublicKey;
    currentGame: web3.PublicKey;
    contractData: web3.PublicKey;
    signer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
};

export type initializeInstructionArgs = {
    totalMoves: number;
    moveTime: beet.bignum;
    signals: number[] /* 32 * 4*/;
    proof: number[] /*256 */;
  };

const initializeDiscriminator=[175, 175, 109, 31, 13, 152, 155, 237];


export const initializeGameStruct = new beet.BeetArgsStruct<
    initializeInstructionArgs & {
        initializeDiscriminator: number[] /* size: 8 */;
    }>(
    [['initializeDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['totalMoves',beet.u8],
    ['moveTime', beet.u64],
    ['signals', beet.uniformFixedSizeArray(beet.u8, 128)],
    ['proof', beet.uniformFixedSizeArray(beet.u8, 256)],
    ],
    'initializeInstructionArgs',
);

export function createInitializeInstruction(
    accounts: initializeAccounts,
    args: initializeInstructionArgs,
    programId = new web3.PublicKey(PROGRAM_ID),
  ) {
    const [data] = initializeGameStruct.serialize({
        initializeDiscriminator: initializeDiscriminator,
        ...args
      });
    const keys: web3.AccountMeta[] = [
      {
        pubkey: accounts.gameData,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: accounts.currentGame,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: accounts.contractData,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: accounts.signer,
        isWritable: true,
        isSigner: true,
      },
      {
        pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
        isWritable: false,
        isSigner: false,
      },
    ];
  
  
    const ix = new web3.TransactionInstruction({
      programId,
      keys,
      data,
    });
    return ix;
  }