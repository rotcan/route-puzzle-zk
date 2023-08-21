pragma circom 2.1.4;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";
// include "https://github.com/0xPARC/circom-secp256k1/blob/master/circuits/bigint.circom";

template Init () {
    signal input sk;
    signal input ex;
    signal input ey;
    signal input limit;
    signal input ux;
    signal input uy;
    signal output pub;
    
    component lt1 = LessEqThan(4);
    lt1.in[0] <== ex;
    lt1.in[1] <== limit;
    lt1.out === 1; 

    component lt2 = LessEqThan(4);
    lt2.in[0] <== ey;
    lt2.in[1] <== limit;
    lt2.out === 1; 

    component lt3 = LessEqThan(4);
    lt3.in[0] <== ux;
    lt3.in[1] <== limit;
    lt3.out === 1; 
    
    component lt4 = LessEqThan(4);
    lt4.in[0] <== uy;
    lt4.in[1] <== limit;
    lt4.out === 1; 


    component gt1 = GreaterEqThan(4);
    gt1.in[0] <== uy;
    gt1.in[1] <== 0;
    gt1.out === 1; 

    component gt2 = GreaterEqThan(4);
    gt2.in[0] <== ux;
    gt2.in[1] <== 0;
    gt2.out === 1; 

    component gt3 = GreaterEqThan(4);
    gt3.in[0] <== ex;
    gt3.in[1] <== 0;
    gt3.out === 1; 

    component gt4 = GreaterEqThan(4);
    gt4.in[0] <== ey;
    gt4.in[1] <== 0;
    gt4.out === 1; 


    // component mimc = MiMCSponge(3, 220, 1);
    // mimc.ins[0]<==ex;
    // mimc.ins[1]<==ey;
    // mimc.ins[2]<==sk;
    // mimc.k<==0;

    // pub<==mimc.outs[0];
    component mimc = Poseidon(3);
    mimc.inputs[0]<==ex;
    mimc.inputs[1]<==ey;
    mimc.inputs[2]<==sk;


    pub<==mimc.out;

    log("pub", pub);
}

component main { public [ ux,uy,limit ] } = Init();

/* INPUT = {
    "ex":1,
    "ey":1,
    "sk":"123131231231223"
    "ux": "4",
    "uy": "5",
    "limit":8
} */