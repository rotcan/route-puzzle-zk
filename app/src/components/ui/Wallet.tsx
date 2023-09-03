import { useWallet } from "@solana/wallet-adapter-react";
import Airdrop from "./Airdrop";

const Wallet = () => {
    const {publicKey, disconnect}=useWallet();
    return (
        <>
            <div className="right">{
                publicKey &&
                (
                    <>
                    <div>
                    <span className="address padding10">{publicKey.toBase58()}</span>
                    <button onClick={() => { disconnect() }}>Disconnect</button>
                    </div>
                    <Airdrop publicKey={publicKey} ></Airdrop>
                    
                    </>

                )
            }
             
            </div>

        </>
    )

}


export default Wallet;