import { PublicKey, AccountChangeCallback, Connection } from "@solana/web3.js";
import { PhantomProvider } from "./phantom";

export function setAccountUpdateCallback(publicKey: PublicKey,
    callback: AccountChangeCallback,
    connection: Connection): void {
    connection.onAccountChange(publicKey, callback);
}

export const getProvider = (): PhantomProvider | undefined => {
    if ("solana" in window) {
        // @ts-ignore
        const provider = window.solana as any;
        if (provider.isPhantom) return provider as PhantomProvider;
    }
};