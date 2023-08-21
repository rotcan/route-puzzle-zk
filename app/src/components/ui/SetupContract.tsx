import { Connection, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { createSetupGameTxn } from "../../contract/transaction";
import { connection } from "../../contract/instruction";
import { getProvider } from "../solana/util";
import { ContractData, getContractData } from "../../contract/data";


const SetupGame = () => {
   
    const setupGameClick=async ()=>{
        createSetupGameTxn(connection,getProvider()!)
        
    }

    return (<>
         <button onClick={()=>setupGameClick()} >SetupGame</button>

    </>)
}

export default SetupGame;