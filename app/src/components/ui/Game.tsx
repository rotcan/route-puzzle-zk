import { useEffect, useMemo, useState } from "react";
import SetupGame from "./SetupContract";
import { ContractData, GameData, GameState, Players, getContractData, getGameData } from "../../contract/data";
import { connection, getGameDataAddress } from "../../contract/instruction";
import InitGame from "./InitGame";
import '../phaser/index';
import { PublicKey } from "@solana/web3.js";
import { getLatestGames } from "../../contract/helper";
import Choose from "./Choose";
import { createForfeitGameTxn } from "../../contract/transaction";
import { getProvider, setAccountUpdateCallback } from "../solana/util";

const Game=({walletKey}:{walletKey: PublicKey | null | undefined})=>{
    const [contractData,setContractData]=useState<ContractData|undefined>(undefined);
    const [player,setPlayer]=useState<Players | undefined> ();
    const [gameData,setGameData]=useState<GameData| undefined>();

    const currentGame=async({counter}:{counter: string})=>{
        const gameData=await getLatestGames({connection,counter,size:1});
        if(gameData && gameData.length>0){
            console.log("gameData",gameData[0].game_counter.toString());
            setGameData(gameData[0]);
        }
    }
    useEffect(()=>{
        loadContract();
    },[]);

    useMemo(()=>{
        if(walletKey){
            setPlayer(undefined);
        }
    },[walletKey])

    useMemo(()=>{
        
    },[gameData])

    
    const loadContract=async()=>{
        const d=await getContractData({connection});
        setContractData(d);
        if(d){
            await currentGame({counter: d?.game_counter.toString()});
        }
    }


    const processState=async()=>{
        
    }

    const accountChangeCallback = async () => {
        if(gameData){
            const newData=await getGameData({connection,counter:gameData.game_counter.toString()});
            setGameData(newData);
        }
    }

    const initCallback = async () => {
        if(gameData){
            const address=getGameDataAddress({counter:gameData.game_counter.toString()});
            setAccountUpdateCallback(new PublicKey( address), accountChangeCallback, connection);
        }
    }

    return (<>
        {
        !contractData && <SetupGame></SetupGame>}
        
        
        {
       
            contractData && walletKey &&
            (
                <>
                    {/* <InitGame contractData={contractData}></InitGame> */}
                    {player===undefined && 
                    <>
                    <button onClick={()=>{setPlayer(Players.Player1)}}>Player 1(Initiate Game)</button>
                    <button  onClick={()=>{setPlayer(Players.Player2)}}>Player 2(Join Game)</button>
                    </>
                    }
                    {player!==undefined && <Choose contractData={contractData} player={player} walletKey={walletKey}/>}
                    <div id="game">

                    </div>
                    
                </>
            )
    
        }
        
            
        
        
    </>);
}

export default Game;