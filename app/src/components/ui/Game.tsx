import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { ContractData, GameData, Players, getContractData, getGameData } from "../../contract/data";
import { getLatestGames } from "../../contract/helper";
import {  getGameDataAddress } from "../../contract/instruction";
import '../phaser/index';
import { setAccountUpdateCallback } from "../solana/util";
import Choose from "./Choose";
import SetupGame from "./SetupContract";

const Game=()=>{
    const {connection}=useConnection();
    const {publicKey,connected}=useWallet();
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
        if(publicKey && connected){
            setPlayer(undefined);
        }
    },[publicKey,connected])

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
       
            contractData && publicKey &&
            (
                <>
                    {/* <InitGame contractData={contractData}></InitGame> */}
                    {player===undefined && 
                    <>
                    <button onClick={()=>{setPlayer(Players.Player1)}}>Player 1(Initiate Game)</button>
                    <button  onClick={()=>{setPlayer(Players.Player2)}}>Player 2(Join Game)</button>
                    </>
                    }
                    {player!==undefined && <Choose contractData={contractData} player={player} walletKey={publicKey}/>}
                    <div id="game">

                    </div>
                    
                </>
            )
    
        }
        
            
        
        
    </>);
}

export default Game;