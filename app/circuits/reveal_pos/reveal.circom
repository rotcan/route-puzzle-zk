pragma circom 2.1.4;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";
// include "https://github.com/0xPARC/circom-secp256k1/blob/master/circuits/bigint.circom";

template Reveal () {
    signal input sk;
    signal input ex;
    signal input ey;
    signal output pub;
    
    component mimc = Poseidon(3);
    mimc.inputs[0]<==ex;
    mimc.inputs[1]<==ey;
    mimc.inputs[2]<==sk;


    pub<==mimc.out;

    log("pub", pub);
}

component main { public [ sk,ex,ey ] } = Reveal();
