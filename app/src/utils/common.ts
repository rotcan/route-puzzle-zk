import { PlayerTurnResult } from "../contract/data";

export enum ColorType{
    Neutral, Correct , InCorrect
}

export interface Point{
    x: number;
    y: number;
}
export interface GridColors{
    correct: number[];
    inCorrect: number[];
    reset:boolean,
}


export const testCalculateGridSquares=({gridHeight,gridWidth,newPoint,oldPoint,oldGrid,correctPoint}:
    {gridWidth:number,gridHeight: number,oldPoint: Point,newPoint: Point,
correctPoint: Point,oldGrid?: GridColors})=>{
    const d1=getPointDistance({p1:correctPoint,p2: newPoint});
    const d2=getPointDistance({p1:correctPoint,p2: oldPoint});
    const result=d1===0 ? PlayerTurnResult.Exact :
     d1===d2? PlayerTurnResult.Same : d1>d2 ? PlayerTurnResult.Far : PlayerTurnResult.Near
     console.log("newPoint ",newPoint,d1,"oldPoint",oldPoint,d2,"result",result);
     return calculateGridSquares({gridHeight,gridWidth,newPoint,oldPoint,result,oldGrid,reset:true});
}
export const calculateGridSquares=({gridHeight,gridWidth,newPoint,oldPoint,result,oldGrid,reset}:
    {gridWidth:number,gridHeight: number,oldPoint: Point,newPoint: Point,
result: PlayerTurnResult,oldGrid?: GridColors,reset:boolean})=>{
    const gridColors: GridColors={correct: [],inCorrect:[],reset:reset} as GridColors;
    for(var i=0;i<gridHeight;i++){
        for(var j=0;j<gridWidth;j++){
            const index=i*gridWidth+j;
            const gridPoint={x:(i+1),y:(j+1)} as Point;
            const newDistance=getPointDistance({p1:gridPoint,p2:newPoint});
            const oldDistance=getPointDistance({p1:gridPoint,p2:oldPoint});
            const isCorrect=(!oldGrid || oldGrid.correct.indexOf(index)) && isCorrectGrid({newDistance,oldDistance,result});
            isCorrect ? gridColors.correct.push(index) : gridColors.inCorrect.push(index)

        }
    }
    return gridColors;
}

const getPointDistance=({p1,p2}:{p1: Point,p2:Point})=>{
    return (p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y);
}

const isCorrectGrid=({newDistance,oldDistance,result}:{newDistance: number,oldDistance: number, result: PlayerTurnResult}):
boolean=>{
    switch(result){
        case PlayerTurnResult.Exact:
            if(newDistance===0) return true;
            break;
        case PlayerTurnResult.Same:
            if(newDistance===oldDistance) return true;
            break;
        case PlayerTurnResult.Far:
            if(newDistance>oldDistance) return true;
            break;
        case PlayerTurnResult.Near:
            if(newDistance<oldDistance) return true;
            break;
    }
    return false;
}