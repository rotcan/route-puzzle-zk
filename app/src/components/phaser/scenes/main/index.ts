import { GameObjects } from "phaser";
import { GameState, Players } from "../../../../contract/data";
import { GRID_SIZE } from "../../../../contract/helper";
import { GridColors ,ColorType} from "../../../../utils/common";


const roundPos=(x: number,y: number, startx: number, starty: number,
     width: number,height: number):{x: number,y: number,gx: number,gy: number}=>{
        const gx=Math.floor((x-startx)/width);
        const gy=Math.floor((y-starty)/height);
    const nx=x-(x-startx)%width+width/2;
    const ny=y-(y-starty)%width+height/2;
    return {x:nx,y:ny,gx: gy+1, gy: gx+1};
}

const createEmitter=()=>{
    let emitter!: Phaser.Events.EventEmitter
    if(!emitter){
        emitter=new Phaser.Events.EventEmitter()
    }
    return emitter;
}

interface RectData{
    data: ColorType;
    index: number;
}

export const EventBus=createEmitter();

const totalWidth=window.innerWidth;
const gridSize=GRID_SIZE;
const width=64;
const height=64;
const color=0xE6896B;
const sx=(totalWidth)/2;
const sy=5;
const borderSize=1;

const colors: Map<ColorType,number>=new Map<ColorType,number>();
colors.set(ColorType.Neutral,0xE6896B);
colors.set(ColorType.Correct,0x8EDD7C);
colors.set(ColorType.InCorrect,0xDD7D7C);
        
export enum GameEvents{
    Player1="create",
    Join="join",
    SetP2Pos="setP2Pos",
    UpdateGrid="updateGrid",
}

export class MainPGame extends Phaser.Scene
{
    
    p1: any | undefined;
    p2: any | undefined;
    pselect: any | undefined;
    target: any | undefined;
    p1GridPos: any | undefined;
    p2GridPos: any | undefined;
    selectedItem: any | undefined;

    phys: any | undefined;
    grid: GameObjects.Grid | undefined;
    cells: Map<number,GameObjects.Rectangle>=new Map();

    super(){
        
    }
    preload ()
    {
        //@ts-ignore
        const baseUrl=window.PUBLIC_URL;
        this.load.image('p1', `../..${baseUrl}/assets/p1.png`);
        this.load.image('p2', `../..${baseUrl}/assets/p2.png`);
        this.load.image('pselect', `../..${baseUrl}/assets/pselect.png`);
    }

    create ()
    {
        //this.add.image(400, 300, 'bg');
        //this.source=new Phaser.Math.Vector2(x-width*gridSize/2+width/2, y+height/2);
        // this.grid= this.add.grid(sx, sy+height*gridSize/2, width*gridSize, height*gridSize, width, height, 
        //     color);
        this.createGrid({x:sx,y:sy+height*gridSize/2+height/2},width,height,gridSize,gridSize,borderSize,ColorType.Neutral);
        //const r1 = this.add.circle(source.x, source.y, width/2-5, 0x6666ff);
       
        
        this.pselect=this.physics.add.image(sx-width*gridSize/2+width/2+width, sy+height/2,'pselect').setName("select");
        this.pselect.setAlpha(0);
        
            
        this.target = new Phaser.Math.Vector2();
        this.phys=this.physics;
        EventBus.on(GameEvents.Player1.toString(),this.createGame,this);
        EventBus.on(GameEvents.Join.toString(),this.joinGame,this);
        EventBus.on(GameEvents.SetP2Pos.toString(),this.setP2Pos,this)
        EventBus.on(GameEvents.UpdateGrid.toString(),this.updateGrid,this);

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, objectsClicked: Phaser.GameObjects.GameObject[]) =>
        {
            const {x:nx,y:ny,gx, gy}=roundPos(pointer.x,pointer.y,sx-width*gridSize/2,sy,width,height);
            if(gx>gridSize || gx<1 || gy>gridSize || gy<1)
                return;
            this.target.x = nx;
            this.target.y = ny;
            console.log("x,y",gx,gy)
            objectsClicked.map(m=>{console.log("m",m.name)});
            // window.gridPos.x=gx;
            // window.gridPos.y=gy;
            if(objectsClicked.length>0){
                const o=objectsClicked[0];
                if(o.name==="p1" || o.name==="p2"){
                    console.log("o.body?.position",o.body?.position);
                    this.pselect.body.reset(this.target.x,this.target.y);
                    this.pselect.setAlpha(1);
                    console.log("this.pselect.",this.pselect);
                    this.selectedItem=o;
                }
                
            }else{
                
                if(this.selectedItem){
                    this.pselect.setAlpha(0);
                    if(this.selectedItem.name==="p1"){
                        this.p1GridPos=new Phaser.Math.Vector2(gx,gy);
                        window.p1GridPos={x: this.p1GridPos.x,y:this.p1GridPos.y};
                    }else if(this.selectedItem.name==="p2"){
                        this.p2GridPos=new Phaser.Math.Vector2(gx,gy);
                        window.p2GridPos={x: this.p2GridPos.x,y:this.p2GridPos.y};
                    }
                    this.selectedItem.body.reset(this.target.x,this.target.y)
                }  
            }
            
            
            // Move at 200 px/s:
            // this.physics.moveToObject(this.p1, this.target, 200);

        });
    }
    
    createGame(p1gx: number, p1gy: number, p2gx: number, p2gy: number,gameState:GameState){
        window.p2GridPos={x:p2gx,y:p2gy};
        if(!this.p1)
            this.p1=this.physics.add.image(sx-width*gridSize/2+width/2, sy+height/2,'p1').setInteractive().setName("p1");
        this.target=new Phaser.Math.Vector2(sx-width*gridSize/2+(p1gy-1)*width+width/2,
        sy+(p1gx-1)*height+height/2);
        this.p1.body.reset(this.target.x,this.target.y);
        this.p1.inputEnabled=true;

        if(!this.p2)
        {
            this.p2=this.physics.add.image(sx-width*gridSize/2+width/2+width, sy+height/2,'p2').setName("p2");
        }
        this.target=new Phaser.Math.Vector2(sx-width*gridSize/2+(p2gy-1)*width+width/2,
        sy+(p2gx-1)*height+height/2);
        this.p2.body.reset(this.target.x,this.target.y);
        if(gameState===GameState.Setup){
            this.p2.inputEnabled=true;
            this.p2.setInteractive();
        }else{
            this.p2.inputEnabled=false;
        }
    }

    joinGame(data: any){
        console.log("data",data);
        if(!this.p2)
            this.p2=this.physics.add.image(sx-width*gridSize/2+width/2+width, sy+height/2,'p2') .setInteractive().setName("p2");
        this.p2.inputEnabled=true;
        this.selectedItem=this.p2;
    }

    setP2Pos(gx: number,gy: number){
        window.p2GridPos={x:gx,y:gy};
        this.target=new Phaser.Math.Vector2(sx-width*gridSize/2+(gy-1)*width+width/2,
        sy+(gx-1)*height+height/2);
        this.p2.body.reset(this.target.x,this.target.y);
        console.log("gx,gy",gx,gy,this.target, this.p2.body.position);
        
    }
 
    createGrid(center:{x: number,y:number},cellWidth: number,cellHeight: number,rowCount: number,colCount: number,borderSize: number,data: ColorType){
        this.cells.clear();
        for(var i=0;i<rowCount;i++){
            for(var j=0;j<colCount;j++){
                //top left 
                const borderCellWidth=(cellWidth); //+borderSize+borderSize
                const borderCellHeight=(cellHeight); //+borderSize+borderSize
                const normalCellWidth=(cellWidth-borderSize-borderSize);
                const normalCellHeight=(cellHeight-borderSize-borderSize);
                const cx=center.x-borderCellWidth*(colCount/2)-borderCellWidth/2 + (j+1)*borderCellWidth;
                const cy=center.y-borderCellHeight*(rowCount/2)+ (i) * borderCellHeight;
                const rect=this.add.rectangle(cx,cy,normalCellWidth,normalCellHeight,colors.get(data));
                const index=((i)*colCount+(j));
                rect.setData('type',{data: data, index:index} as RectData);
                this.cells.set(index, rect);
            }
        }
        // console.log("cells",this.cells);
    }
    updateGrid(data: GridColors){
        console.log("data",data,this.cells);
        if(this.cells.size>0){
            for(const index of data.inCorrect){
                const r=this.cells.get(index);
                if(r){
                    const d=r.getData('type') as RectData
                    r.setData({...d, data:ColorType.InCorrect})
                    r.setFillStyle(colors.get(ColorType.InCorrect),1);
                }
            }
            for(const index of data.correct){
                const r=this.cells.get(index);
                if(r){
                    const d=r.getData('type') as RectData
                    if(data.reset===true || d.data==ColorType.Correct || d.data===ColorType.Neutral){
                        r.setData({...d, data:ColorType.Correct});
                        r.setFillStyle(colors.get(ColorType.Correct),1);
                    }
                }
            }
        }
    }
}

