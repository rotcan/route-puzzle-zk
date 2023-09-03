import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createSetupGameTxn } from "../../contract/transaction";
import { getWalletSigner } from "../solana/util";


const SetupGame = () => {
    const walletContext=useWallet();
    const walletSignerObject=getWalletSigner(walletContext);
    const {connection}=useConnection();
    const setupGameClick=async ()=>{
        createSetupGameTxn(connection,walletSignerObject)
        
    }

    return (<>
    {
    walletContext.connected && 
         <button onClick={()=>setupGameClick()} >SetupGame</button>
    }
    </>)
}

export default SetupGame;