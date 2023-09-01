import { useEffect, useMemo, useState } from "react";
import { ContractData, CurrentGame, GameData, GameState, Players, getContractData, getCurrentGame, getGameData } from "../../contract/data";
import { InitInput, MoveVerifyInput, generateRandomKey, makeInitProof, makePlayerMoveProof } from "../../contract/groth";
import { connection, getGameDataAddress } from "../../contract/instruction";
import { createForfeitGameTxn, createInitializeGameTxn, playerMoveVerifyTxn } from "../../contract/transaction";
import { getProvider, setAccountUpdateCallback } from "../solana/util";
import { GRID_SIZE, getCurrentTurn } from "../../contract/helper";
import { PublicKey } from "@solana/web3.js";
import { EventBus, GameEvents } from "../phaser/scenes/main";
import './style.css';


const InitGame = ({contractData,walletKey}:{contractData: ContractData | undefined,walletKey: PublicKey | null | undefined}) => {
    
    const [secretKey,setSecretKey]=useState<string | undefined>(undefined);
    // const [rSecretKey,setRSecretKey]=useState<string | undefined>(undefined);
    const [moveCount,setMoveCount]=useState<string | undefined>(undefined);
    const [currentGame, setCurrentGame]=useState<CurrentGame | undefined>(undefined);
    const [gameData,setGameData]=useState<GameData | undefined>(undefined);
    const [hash,setHash]=useState<string | undefined>(undefined);

    const loadCurrentGame=async()=>{
        const d=await getCurrentGame({connection,playerKey: walletKey!.toBase58()});
        console.log("loadCurrentGame ",d);
        if(d){
            setCurrentGame(d);
            const gd=await getGameData({connection, counter: d.game_counter.toString()});
            setGameData(gd);
            initCallback();
        }else{
            //Init locations
            window.p1GridPos={x:1,y:1};
            window.p2GridPos={x:2,y:1};
            EventBus.emit(GameEvents.Player1,window.p1GridPos.x,
                window.p1GridPos.y, 
                window.p2GridPos.x, 
                window.p2GridPos.y,
                GameState.Setup);
        }
    }
    useEffect(()=>{
        loadCurrentGame();
    },[]);

    const accountChangeCallback = async () => {
        if(gameData){
            const gd=await getGameData({connection, counter: gameData.game_counter.toString()});
            console.log("gd",gd);
            setGameData(gd);
        }
        // await processState();
    }

    const initCallback = async (counter?: string) => {
        const c=counter ?? currentGame?.game_counter.toString();
        if(c){
            const address=getGameDataAddress({counter:c});
            setAccountUpdateCallback(new PublicKey( address), accountChangeCallback, connection);
        }
    }

    const processState=async()=>{
        if(gameData){
            console.log("window.p1GridPos",window.p1GridPos,gameData.game_state);
            window.p1GridPos = window.p1GridPos ?? {x: 1,y:1};
            const pos=window.p1GridPos;
            EventBus.emit(GameEvents.Player1,pos.x,
                pos.y, 
                gameData.current_pos[0], 
                gameData.current_pos[1],
                gameData.game_state);
            if(gameData.game_state===GameState.Start){
                if(gameData.player_turn===Players.Player1){
                    //verify move
                    
                }
            }
        }
    };
        
    useMemo(()=>{
        processState();
    },[gameData]);

    const playerMoveVerify=async ()=>{
        if(gameData)
        {
            const p1pos=window.p1GridPos;

            const {proof,signals}=await makePlayerMoveProof(
                { 
                   proofInput: {
                ex: ""+p1pos.x,
                ey: ""+p1pos.y,
                limit: ""+GRID_SIZE,
                sk:secretKey ,
                x2:"" + gameData.current_pos[0],
                y2:"" + gameData.current_pos[1],
                x1: "" + gameData.last_pos[0],
                y1: "" + gameData.last_pos[1],
                pub: hash
            } as MoveVerifyInput,hash : gameData.target_position_hash});
            
            await playerMoveVerifyTxn({connection,counter: gameData.game_counter.toString(),
            from: getProvider()!, proof, signals})
        }
    }
    const generateKey=()=>{
        console.log("secretKey",secretKey);
        if(secretKey){
            var r=window.confirm("Key already present. Do you wish to generate a new one?")
            if(r===true){
                const key=generateRandomKey(16);
                setSecretKey(key.toString());
            }
        }else{
            const key=generateRandomKey(16);
            console.log("key",key);
            setSecretKey(key.toString());
        }
        
    }


    const forfeitGame=async()=>{
        if(gameData){
            await createForfeitGameTxn({
                connection, counter: "0",
                from: getProvider()!,
                player1: gameData.player1_account.toBase58(),
            })
        }
        
    }

    const InitGameClick=async ()=>{
        if(!secretKey || secretKey.length===0){
            alert("Please generate secret key");
            return;
        }
        if(!window.p1GridPos){
            alert("Please set target position");
            return;
        }
        if(!window.p2GridPos){
            alert("Please set other player's start position");
            return;
        }
        if(!contractData){
            alert("Please init the contract first as admin");
            return;
        }
        if(secretKey){
            console.log("key",secretKey);
            const p1pos=window.p1GridPos;
            const p2pos=window.p2GridPos;
            const proof=await makeInitProof({
                ex: ""+p1pos.x,
                ey: ""+p1pos.y,
                limit: ""+GRID_SIZE,
                sk:secretKey ,
                ux:""+p2pos.x,
                uy:"" + p2pos.y,
            } as InitInput);
            
            //const contractData= await getContractData({connection});

            console.log("proof",JSON.stringify(proof),contractData);
            
            console.log("gridPos",window.p1GridPos);
            setHash(proof.pub);
            createInitializeGameTxn({connection,counter: contractData.game_counter.toString(),
            from: getProvider()!,moves:4,proof: proof.proof,signals: proof.signals,timeout:600});
            //Set callback
            initCallback(contractData.game_counter.toString());
        }
    }

    return (<>
    {!currentGame &&
        <>
        <p>1) Set your location and other players starting position.<br/>2) Blue is your position, green will be other players starting position.<br/>3) Please remember secret key and position hash for future txns</p>
        <div className="player">
        <div>
        <label>Secret Key</label><input value={secretKey || ''} style={{width:"400px"}}  placeholder="Secret Key" onChange={(e)=>{
                setSecretKey(e.target.value)
            }}></input>
            <button onClick={()=>generateKey()}>Generate Key</button>
            {/* <span>{rSecretKey}</span> */}
        </div>
       
        <div>
        <label>Position Hash:</label><input value={hash || ''} style={{width:"600px"}}  placeholder="Position Hash" onChange={(e)=>{
                setHash(e.target.value)
            }}></input>
        </div>
        <div>
        <label>Move Count</label><input type="number" value={moveCount} placeholder="Move Count"  onChange={e=>{setMoveCount(e.target.value)}}></input>
            <button className="InitGame" onClick={()=>InitGameClick()} >Init Game</button>
        </div>
        </div>
       
    </>
    }
    {currentGame && gameData && 
    getCurrentTurn({gameData, playerKey: walletKey!.toBase58()})===Players.Player1
     && (
        <>
            <label>Secret Key</label><input value={secretKey || ''} style={{width:"400px"}}  placeholder="Secret Key" onChange={(e)=>{
                setSecretKey(e.target.value)
            }}></input>
            <label>Position Hash</label><input value={hash || ''} style={{width:"400px"}}  placeholder="Position Hash" onChange={(e)=>{
                setHash(e.target.value)
            }}></input>
            
            <button onClick={()=>{playerMoveVerify()}}>Verify Move</button>
        </>
     )
    }
    {currentGame && gameData && 
    getCurrentTurn({gameData, playerKey: walletKey!.toBase58()})!==Players.Player1
     && (
        <>
            <label>Secret Key</label><input value={secretKey || ''} style={{width:"400px"}}  placeholder="Secret Key" onChange={(e)=>{
                setSecretKey(e.target.value)
            }}></input>
            <label>Position Hash</label><input value={hash || ''} style={{width:"400px"}}  placeholder="Position Hash" onChange={(e)=>{
                setHash(e.target.value)
            }}></input>
            
            <label>Waiting for Other player's move</label>
        </>
     )
    }
    {
        gameData && <button onClick={()=>{accountChangeCallback()}}>Refresh State</button>
    }
    {gameData && gameData.game_state===GameState.Start && (
                        <>
                            <button onClick={()=>{forfeitGame();}}>Forfeit Game</button>
                        </>
                    )}
    </>)
}

export default InitGame;

 