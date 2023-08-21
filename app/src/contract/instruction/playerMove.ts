import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import { PROGRAM_ID } from '../instruction';

const playerMoveDiscriminator=[42, 103, 48, 170, 54, 223, 66, 223];


export type playerMoveAccounts = {
    gameData: web3.PublicKey;
    signer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
};

export type playerMoveInstructionArgs = {
    x: number,
    y: number,
  };



export const playerMoveStruct = new beet.BeetArgsStruct<
playerMoveInstructionArgs & {
        playerMoveDiscriminator: number[] /* size: 8 */;
    }>(
    [['playerMoveDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['x',beet.u8],
    ['y',beet.u8],  
    ],
    'playerMoveInstructionArgs',
);

export function createPlayerMoveInstruction(
    accounts: playerMoveAccounts,
    args: playerMoveInstructionArgs,
    programId = new web3.PublicKey(PROGRAM_ID),
  ) {
    const [data] = playerMoveStruct.serialize({
        playerMoveDiscriminator: playerMoveDiscriminator,
        ...args
      });
    const keys: web3.AccountMeta[] = [
      {
        pubkey: accounts.gameData,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: accounts.signer,
        isWritable: true,
        isSigner: false,
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