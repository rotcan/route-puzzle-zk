import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { commitment } from "../../contract/instruction";
import { setAccountUpdateCallback } from "../solana/util";
import { useConnection } from "@solana/wallet-adapter-react";


const Airdrop = ({ publicKey }: {  publicKey: PublicKey }) => {

    const [balance, setBalance] = useState<number | null>(0);
    const {connection}=useConnection();

    const doAirdrop = async () => {
        var airdropSignature = await connection.requestAirdrop(
            publicKey,
            LAMPORTS_PER_SOL,
        );

        // Confirming that the airdrop went through
        await connection.confirmTransaction(airdropSignature);
        await getBalance();
    }

    const getBalance = async () => {
        const val = await connection.getBalance(publicKey, commitment);
        setBalance(val);
    }

    const accountChangeCallback = async () => {
        await getBalance();
    }

    useEffect(() => {
        getBalance();
        setAccountUpdateCallback(publicKey, accountChangeCallback, connection);
    }, [])

    return <>
        <div className="block ">
            <div className="airdrop-view right">
                <span className="padding10">Balance:
                    {balance! / LAMPORTS_PER_SOL} Sol</span>
                <button onClick={() => { doAirdrop(); }}>Airdrop</button>
            </div>
        </div>

    </>
}

export default Airdrop;