import { PublicKey } from "@solana/web3.js";
import { ContractData, Players } from "../../contract/data";
import InitGame from "./InitGame";
import JoinGame from "./JoinGame";


const Choose=({player, contractData,walletKey}:
    {player: Players,contractData: ContractData,walletKey: PublicKey | null | undefined})=>{
    return (
        <>
            {player===Players.Player1 && (
                <InitGame contractData={contractData} walletKey={walletKey}/>
            )}
            {player===Players.Player2 && (
                <JoinGame contractData={contractData} walletKey={walletKey} />
            )}
        </>
    )
}

export default Choose;