import { useMemo, useState } from "react";
import { ContractData, GameData, GameState, Players, getGameData } from "../../contract/data";
import { connection, createPlayerMoveIx, getGameDataAddress } from "../../contract/instruction";
import { createForfeitGameTxn, createJoinGameTxn, playerMoveTxn } from "../../contract/transaction";
import { getProvider, setAccountUpdateCallback } from "../solana/util";
import { EventBus, GameEvents, MainPGame } from "../phaser/scenes/main";
import { PublicKey } from "@solana/web3.js";
import { getCurrentTurn, getStateMsg, getWinnerMsg } from "../../contract/helper";

const JoinGame=({contractData,walletKey}:{contractData: ContractData,walletKey: PublicKey | null | undefined })=>{
    const [gameCounter,setGameCounter]=useState<string| undefined>(undefined);
    const [showMove,setShowMove]=useState<boolean>(false);
    const [gameData,setGameData]=useState<GameData | undefined>(undefined);
    const [currentPos,setCurrentPos]=useState<{x:number,y:number} | undefined>(undefined);

    const accountChangeCallback = async () => {
        if(gameCounter){
            const newData=await getGameData({connection, counter: gameCounter}); 
            console.log("newData",newData?.last_pos,newData?.current_pos);
            setGameData(newData);
        }
    }

    const initCallback = async () => {
        if(gameCounter){
            const address=getGameDataAddress({counter:gameCounter});
            setAccountUpdateCallback(new PublicKey( address), accountChangeCallback, connection);
        }
    }
    
    const loadGameClick=async()=>{
        if(!gameCounter){
            alert("Select game to join");
            return;
        }
        await currentGame({counter: gameCounter});
    }

    const joinGameClick=async()=>{
        if(!gameCounter)
        {
            alert("Game not loaded");
            return;
        }
        await createJoinGameTxn({connection,counter:gameCounter!,
            from: getProvider()!});
    }
    const movePlayer=async()=>{
        console.log("p2GridPos",window.p2GridPos);
        await playerMoveTxn({from: getProvider()!,connection, counter:gameCounter!,
            x:window.p2GridPos.x, y:window.p2GridPos.y,
        })
    }

    const resetPosition=()=>{
        if(gameData){
            if(gameData.current_pos[0]===0)
                EventBus.emit(GameEvents.SetP2Pos,gameData.last_pos[0],gameData.last_pos[1]);
            else
                EventBus.emit(GameEvents.SetP2Pos,gameData.current_pos[0],gameData.current_pos[1]);
        }
    }
    const processState=async()=>{
        if(gameData){
            console.log("gameData",gameData.game_counter.toString());
            if(gameData.game_state===GameState.Setup){
                if( gameData.player1_account.toBase58()
                ===walletKey!.toBase58()){
                    alert("Same player cannot start and join the same game");
                    return;
                }
                console.log("gameData.game_counter",gameData.game_counter);
                //join
                // gameData.game_counter.toString()
                
                // const g=((MainPGame) );
                // console.log("p1 ",gameData.player1_account.toBase58());
                // console.log("p2 ",gameData.player2_account.toBase58());
                EventBus.emit(GameEvents.Join,{x:1});
                resetPosition();
            }else if(gameData.game_state===GameState.Start){
                // if( gameData.player2_account.toBase58()
                // !==walletKey!.toBase58()){
                //     alert("Wrong player joined to make the move!");
                //     return;
                // }
                EventBus.emit(GameEvents.Join,{x:1});
                resetPosition();
                //already started
                //alert("Already started")
            }else{
                //ended
                //alert("Game finished")
                
            }
        }
        
    }

    useMemo(()=>{
        processState();
    },[gameData]);

    const forfeitGame=async()=>{
        if(gameData){
            await createForfeitGameTxn({
                connection, counter: "0",
                from: getProvider()!,
                player1: gameData.player1_account.toBase58(),
            })
        }
        
    }

    useMemo(()=>{
        setCurrentPos(window.p2GridPos);
    },[window.p2GridPos]);

    const currentGame=async({counter}:{counter: string})=>{
        const gameData=await getGameData({connection, counter: counter});
        console.log("gameData currentGame",gameData);
        setGameData(gameData);
        if(gameData ){
            initCallback();
        }else{
            alert("No game found with this id");
        }
    }
    return (
        <>
        <div>
            <input value={gameCounter} onChange={(e)=>{setGameCounter(e.target.value)}} 
            type="number"
            placeholder="Game To Join"/>
             {(!gameData) 
            &&  (<button onClick={()=>{loadGameClick();}}>Load Game</button>)}
            {(gameData && gameData.game_state===GameState.Setup) 
            &&  (<button onClick={()=>{joinGameClick();}}>Join Game</button>)}
            {gameData && gameData.game_state===GameState.Start
            &&  (
                <>
                <div>
                    <label>Current State: {getStateMsg({gameData})}</label>
                    <div>
                        <label>Moves: {gameData.move_counter}</label>
                    </div>
                    <div>
                        <label>Last Pos: {gameData.last_pos[0]},{gameData.last_pos[1]}</label>
                        {gameData.current_pos[0]!==0 &&
                        <label>Current Pos: {gameData.current_pos[0]},{gameData.current_pos[1]}</label>}
                    </div>
                    <div>
                        <label>Last Move Result: {gameData.player_turn_result}</label>
                    </div>
                </div>
                {
                getCurrentTurn({gameData,playerKey: walletKey!.toBase58()})===Players.Player2 &&
                ( 
                <>
                <button onClick={()=>{resetPosition()}}>Reset position</button>
                    <button onClick={()=>{movePlayer();}}>Submit Move</button>
                </>)
                }
                {
                    getCurrentTurn({gameData,playerKey: walletKey!.toBase58()})!==Players.Player2 &&
                    <label>Waiting for Other Player's Verification</label>
                }
                {
                    gameData && <button onClick={()=>{accountChangeCallback()}}>Refresh State</button>
                }
                </>
            
            )}
             {gameData && gameData.game_state===GameState.End
            &&
            <>
                <label>{getWinnerMsg({gameData,playerKey: walletKey!.toBase58()})}</label>
            </> 
             }
              {gameData && gameData.game_state===GameState.Start && (
                        <>
                            <button onClick={()=>{forfeitGame();}}>Forfeit Game</button>
                        </>
                    )}
        </div>
        </>
    )
}

export default JoinGame;