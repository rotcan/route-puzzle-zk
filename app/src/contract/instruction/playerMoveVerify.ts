import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import { PROGRAM_ID } from '../instruction';



export type playerMoveVerifyAccounts = {
    gameData: web3.PublicKey;
    currentGame: web3.PublicKey;
    signer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
};

export type playerMoveVerifyInstructionArgs = {
    signals: number[] /* 32 * 4*/;
    proof: number[] /*256 */;
  };


const playerMoveVerifyDiscriminator=[248, 9, 74, 70, 39, 151, 246, 125];



export const playerMoveVerifyStruct = new beet.BeetArgsStruct<
playerMoveVerifyInstructionArgs & {
    playerMoveVerifyDiscriminator: number[] /* size: 8 */;
    }>(
    [['playerMoveVerifyDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['signals', beet.uniformFixedSizeArray(beet.u8, 288)],
    ['proof', beet.uniformFixedSizeArray(beet.u8, 256)],
    ],
    'playerMoveVerifyInstructionArgs',
);

export function createPlayerMoveVerifyInstruction(
    accounts: playerMoveVerifyAccounts,
    args: playerMoveVerifyInstructionArgs,
    programId = new web3.PublicKey(PROGRAM_ID),
  ) {
    const [data] = playerMoveVerifyStruct.serialize({
        playerMoveVerifyDiscriminator: playerMoveVerifyDiscriminator,
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