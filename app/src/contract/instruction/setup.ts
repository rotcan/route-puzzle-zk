

import * as web3 from '@solana/web3.js';
import { PROGRAM_ID } from '../instruction';
import * as beet from '@metaplex-foundation/beet';


export type setupContractAccounts = {
    contractData: web3.PublicKey;
    signer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
};

export const setupContractDiscriminator = [137, 0, 196, 175, 166, 131, 77, 178];


export const setupContractStruct = new beet.BeetArgsStruct<{
    instructionDiscriminator: number[] /* size: 8 */;
  }>(
    [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
    'setupContractStructArgs',
  );

export function createSetupInstruction(
    accounts: setupContractAccounts,
    programId = new web3.PublicKey(PROGRAM_ID),
  ) {
    const [data] = setupContractStruct.serialize({
        instructionDiscriminator: setupContractDiscriminator,
      });
    const keys: web3.AccountMeta[] = [
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