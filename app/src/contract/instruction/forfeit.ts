import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import { PROGRAM_ID } from '../instruction';



export type forfeitAccounts = {
    gameData: web3.PublicKey;
    currentGame: web3.PublicKey;
    signer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
};

export type forfeitInstructionArgs = {
   
  };


const forfeitDiscriminator=[177, 19, 148, 121, 144, 34, 8, 74];



export const playerMoveVerifyStruct = new beet.BeetArgsStruct<
forfeitInstructionArgs & {
    forfeitDiscriminator: number[] /* size: 8 */;
    }>(
    [['forfeitDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    
    ],
    'forfeitInstructionArgs',
);

export function createForfeitGameInstruction(
    accounts: forfeitAccounts,    programId = new web3.PublicKey(PROGRAM_ID),
  ) {
    const [data] = playerMoveVerifyStruct.serialize({
        forfeitDiscriminator: forfeitDiscriminator
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