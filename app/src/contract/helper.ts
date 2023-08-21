import { Connection } from "@solana/web3.js"
import { GameData, GameState, PlayerTurnResult, Players, getGameData } from "./data"
import BN from 'bn.js';

export const GRID_SIZE=8;
//get last n games
export const getLatestGames=async({connection, counter,size=2}:{connection: Connection
    , counter: string,size?: number}):Promise<GameData[]>=>{
    const num=new BN(counter);
    const games: GameData[]=[];
    for(var i=0;i<size;i++){
        const val=num.sub(new BN(i+1));
        if(val.gte(new BN(0))){
            const data=await getGameData({connection,counter: val.toString()});
            if(data)
                games.push(data);
        }
    }
    return games;
}

export const getCurrentTurn=({gameData,playerKey}:{gameData: GameData,playerKey: string}):Players=>{
    if(gameData.player_turn===Players.Player1 
    && gameData.game_state===GameState.Start){
        return Players.Player1
    }
    if(gameData.game_state===GameState.Setup)
        return Players.Player2
    if(gameData.game_state===GameState.Start &&
    gameData.player_turn===Players.Player2
    )
        return Players.Player2;
    return Players.Player1;
}

const getPointString=({point}:{point: Uint8Array}):string=>{
    return "(x:"+point[0]+",y:"+point[1]+")";
}

export const getStateMsg=({gameData}:{gameData: GameData}):string | undefined=>{
    const result=gameData.player_turn_result;
    if(gameData.player_turn===Players.Player1)
    return "Waiting for Player1's verification"
    switch(result){

        case PlayerTurnResult.Same:
            return " Distance from target position is same for old position "+getPointString({point:gameData.last_pos})+" and new position "+getPointString({point:gameData.current_pos});
        case PlayerTurnResult.Far:
            return " New position "+getPointString({point:gameData.current_pos})+" is farther from target compared to old position "+getPointString({point:gameData.last_pos});
        case PlayerTurnResult.Near:
            return " New position "+getPointString({point:gameData.current_pos})+" is closer to target from old position "+getPointString({point:gameData.last_pos});
        case PlayerTurnResult.Exact:
            return " Congrats!. This is the correct position: "+getPointString({point:gameData.current_pos});
    }
    return undefined;
}

export const getPlayerStr=(player: Players)=>{
    if(player===Players.Player1){
        return "Player1";
    }
    return "Player2";
}


export const getWinnerMsg=({gameData,playerKey}:{gameData: GameData,playerKey: string}):string=>{
    if(gameData && gameData.game_state===GameState.End){
        if(playerKey === gameData.player1_account.toBase58() 
        || playerKey === gameData.player2_account.toBase58() ){
            if(gameData.winner===Players.Player1){
                if(playerKey === gameData.player1_account.toBase58() )
                return "Congrats! You won the match";
            else
            return "You lost the match";
            }else{
                if(playerKey === gameData.player2_account.toBase58() )
                return "Congrats! You won the match";
            else
            return "You lost the match";
            }
        }
        return getPlayerStr(gameData.winner)+" won the match";
    }
    else{
        return "Game in progress";
    }
}