import verificationKey from "./zk/verification_key.json";
import moveVerificationKey from "./zk/verification_key_move.json";
//@ts-ignore
const snarkjs = window.snarkjs;

//const baseUrl="http://localhost:3000/";
//@ts-ignore
const baseUrl=window.PUBLIC_URL ?? ".";
//const baseUrl="../../";
// const wasmFile=baseUrl+"circuits/analyze_move/analyze_move_js/analyze_move.wasm";
const initWasmFile=baseUrl+"/zk/init.wasm";
const initzKeyFile=baseUrl+"/zk/init_0001.zkey";
const verifyWasmFile=baseUrl+"/zk/analyze_move.wasm";
const verifyzKeyFile=baseUrl+"/zk/analyze_move_0001.zkey";
//const zKey=baseUrl+"circuits/analyze_move/analyze_move_0001.zkey";
// import wasmFile from '../../circuits/init/init_js/input.wasm';

export const generateRandomKey=(length?: number):string=>{
    const crypto=window.crypto;
    const typedArray=new Uint8Array(length ?? 32);
    crypto.getRandomValues(typedArray);
    return snarkjs.utils.stringifyBigInts(typedArray);
}
export interface InitInput{
    ex:string,
    ey:string,
    sk:string,
    ux: string,
    uy:string,
    limit:string;
   
}


export interface MoveVerifyInput{
    ex:string,
    ey:string,
    sk:string,
    x1: string,
    y1: string,
    x2:string,
    y2:string,
    limit:string;
    pub?: string;

    // ex: "1",
    // ey:"1",
    // limit: "8",
    // sk2: "123123",
    // ux:"3",
    // uy:"4",
}

export interface rustProofOutput{
    proof: number[];
    signals:number[];
}

export interface initProofOutput extends rustProofOutput{
    pub: string;
}
 

export const makeInitProof=async(proofInput: InitInput ):Promise<initProofOutput>=>{
    const {proof,publicSignals}=await makeInitGrothProof(proofInput);
    return await generateGrothInitOutput(proof,publicSignals);
}

export const makePlayerMoveProof=async({proofInput,hash}:
    {proofInput: MoveVerifyInput,hash: Uint8Array}):Promise<rustProofOutput>=>{
    const pub=snarkjs.utils.stringifyBigInts(snarkjs.utils.leBuff2int(hash));
    const signals=proofInput.pub ? proofInput : {...proofInput,pub:pub};
    console.log("signals",signals);
    const {proof,publicSignals}=await makeMoveVerifyGrothProof(signals);
    return await generateGrothOutput(proof,publicSignals);
}


const generateGrothInitOutput=async(proof: any,publicSignals: any)=>{
    // console.log("proof",JSON.stringify(proof));
    // console.log("signals",JSON.stringify(publicSignals));
    const vKey = verificationKey;
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    console.log("verify",res);
    const pa=convertProofBNtoIntArray32(proof.pi_a);
    const pb=convertProofBNtoIntArray64(proof.pi_b);
    const pc=convertProofBNtoIntArray32(proof.pi_c);

    const signals:number[]=[];
    for(const s of publicSignals){
        let arr=[...convertBNtoIntArray32(s)];
        //arr[4]=34;
        signals.push(...arr);
    }
    
    // console.log("p s",proof,publicSignals);
    // console.log("pa",pa,pb,pc); 
    // console.log("signals",signals);
    //return {proof,publicSignals};
    return {proof: [...pa,...pb,...pc],signals,pub: publicSignals[0]};
}

const generateGrothOutput=async(proof: any,publicSignals: any)=>{
    // console.log("proof",JSON.stringify(proof));
    // console.log("signals",JSON.stringify(publicSignals));
    const vKey = verificationKey;
    // const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    // console.log("verify",res);
    const pa=convertProofBNtoIntArray32(proof.pi_a);
    const pb=convertProofBNtoIntArray64(proof.pi_b);
    const pc=convertProofBNtoIntArray32(proof.pi_c);

    const signals:number[]=[];
    for(const s of publicSignals){
        let arr=[...convertBNtoIntArray32(s)];
        //arr[4]=34;
        signals.push(...arr);
    }
    
    // console.log("p s",proof,publicSignals);
    // console.log("pa",pa,pb,pc); 
    // console.log("signals",signals);
    //return {proof,publicSignals};
    return {proof: [...pa,...pb,...pc],signals};
}


const convertBNtoIntArray32=(val: any):number[]=>{
    return [...Array.from(snarkjs.utils.leInt2Buff(snarkjs.utils.unstringifyBigInts(val), 32).reverse())] as number[];
}
const convertProofBNtoIntArray32=(val: any):number[]=>{
    return [...convertBNtoIntArray32(val[0]),...convertBNtoIntArray32(val[1])];
}

const convertProofBNtoIntArray64=(val: any):number[]=>{
    let tmp1 = Array.from(snarkjs.utils.leInt2Buff(snarkjs.utils.unstringifyBigInts(val[0][0]), 32)).concat(Array.from(snarkjs.utils.leInt2Buff(snarkjs.utils.unstringifyBigInts(val[0][1]), 32))).reverse()
    let tmp2 = Array.from(snarkjs.utils.leInt2Buff(snarkjs.utils.unstringifyBigInts(val[1][0]), 32)).concat(Array.from(snarkjs.utils.leInt2Buff(snarkjs.utils.unstringifyBigInts(val[1][1]), 32))).reverse()
    const pb=[...tmp1,...tmp2];
    return pb as number[];
}


const makeInitGrothProof = async (_proofInput: any) => {
    //await snarkjs.wtns.
    const { proof, publicSignals } = await snarkjs.groth16.fullProve( _proofInput,
     initWasmFile, initzKeyFile);
    return { proof, publicSignals };
};


const makeMoveVerifyGrothProof = async (_proofInput: any) => {
    //await snarkjs.wtns.
	const { proof, publicSignals } = await snarkjs.groth16.fullProve( _proofInput,
        verifyWasmFile, verifyzKeyFile);
	return { proof, publicSignals };
};

const loadFromUrl=async(url: string)=>{
    const response = await fetch( url, { mode: "no-cors" });
    return response.text();
}
  
