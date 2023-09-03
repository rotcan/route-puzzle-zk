import { ComputeBudgetProgram, Connection, SignatureResult, Transaction, TransactionInstruction } from "@solana/web3.js";
import { createForfeitGameIx, createInitializeGameIx, createJoinGameIx, createPlayerMoveIx, createPlayerMoveVerifyIx, createSetupGameIx } from "./instruction";
import { WalletSigner } from "../components/solana/util";

export const createSetupGameTxn = async (connection: Connection, from: WalletSigner) => {
    
    const ix = await createSetupGameIx({player1: from!.publicKey!});
    return await sendAndConfirmTransaction({connection, from, ix});
}

export const createInitializeGameTxn = async ({connection, counter, from,moves,
proof, signals, timeout}:{
    connection: Connection, from: WalletSigner,counter: string, 
        moves: number,
      timeout: number, signals: number[], proof: number[]}) => {
    
    const ix = await createInitializeGameIx({player1: from!.publicKey!,
    counter, moves, proof, signals, timeout});
    console.log("ix",ix);
    return await sendAndConfirmTransaction({connection, from, ix});
}

export const createJoinGameTxn=async({connection, counter,from}:
    {  connection: Connection, from: WalletSigner,counter: string, })=>{
    const ix=await createJoinGameIx({counter,player2: from!.publicKey!});
    return await sendAndConfirmTransaction({connection, from, ix});
}

export const playerMoveTxn=async({connection, counter,from,x,y}:
    {  connection: Connection, from: WalletSigner,counter: string,x: number,y: number })=>{
    const ix=await createPlayerMoveIx({counter,player2: from!.publicKey!,x,y});
    return await sendAndConfirmTransaction({connection, from, ix});
}


export const playerMoveVerifyTxn=async({connection, counter,from,signals,proof}:
    {  connection: Connection, from: WalletSigner,counter: string, signals: number[], proof: number[]})=>{
    const ix=await createPlayerMoveVerifyIx({counter,player1: from!.publicKey!,proof, signals});
    return await sendAndConfirmTransaction({connection, from, ix});
}


export const createForfeitGameTxn=async({connection, from,player1,counter}:
    {  connection: Connection, from: WalletSigner,counter: string, player1: string})=>{
    const ix=await createForfeitGameIx({counter,player: from!.publicKey!,player1: player1});
    return await sendAndConfirmTransaction({connection, from, ix});
}

const sendAndConfirmTransaction=async({connection, from, ix,cu = 0 }:
    {ix: TransactionInstruction, connection: Connection, from: WalletSigner, cu? : number}):Promise<SignatureResult|undefined>=>{
    
  
          
    let tx = new Transaction();
    if(cu){
        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({ 
            units: cu 
            });
                
            const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ 
            microLamports: 1 
            });
        
        tx.add(modifyComputeUnits)
        .add(addPriorityFee)
    }

    tx.add(ix);
    tx.feePayer =  from!.publicKey!;
    let blockhashObj = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhashObj.blockhash;

    // Transaction constructor initialized successfully
    if (tx) {
        console.log("Txn created successfully",tx,tx.feePayer.toBase58());
    }
    // try{
        // Request creator to sign the transaction (allow the transaction)
        let signed = await from.signTransaction!(tx);
        console.log("signed tx",signed);
        // The signature is generated
        let signature = await connection.sendRawTransaction(signed.serialize());
        // Confirm whether the transaction went through or not
        console.log("signature",signature);
        const response = await connection.confirmTransaction({ blockhash: blockhashObj.blockhash,
            lastValidBlockHeight: blockhashObj.lastValidBlockHeight,signature},"finalized");
        console.log(signature,response.value);
        return response.value
    // }catch(e: any){
    //     console.log("e",e);
    //     return undefined;
    // }
}