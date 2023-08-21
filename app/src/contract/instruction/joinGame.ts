import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import { PROGRAM_ID } from '../instruction';


const joinGameDiscriminator=[107, 112, 18, 38, 56, 173, 60, 128];


export type joinGameAccounts = {
    gameData: web3.PublicKey;
    signer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
};

export type joinGameInstructionArgs = {
   
  };



export const joinGameStruct = new beet.BeetArgsStruct<
    {
    joinGameDiscriminator: number[] /* size: 8 */;
    }>(
    [['joinGameDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
   
    ],
    'joinGameInstructionArgs',
);

export function createJoinGameInstruction(
    accounts: joinGameAccounts,
    programId = new web3.PublicKey(PROGRAM_ID),
  ) {
    const [data] = joinGameStruct.serialize({
        joinGameDiscriminator: joinGameDiscriminator,
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