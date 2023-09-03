import { WalletContextState } from "@solana/wallet-adapter-react";
import { AccountChangeCallback, Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

export function setAccountUpdateCallback(publicKey: PublicKey,
    callback: AccountChangeCallback,
    connection: Connection): void {
    connection.onAccountChange(publicKey, callback);
}


export interface WalletSigner{
    publicKey: PublicKey | null;
    signTransaction:  (<T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>) | undefined;
}

export const getWalletSigner=(wallet: WalletContextState)=>{
    return {publicKey: wallet.publicKey,signTransaction: wallet.signTransaction} as WalletSigner;
}