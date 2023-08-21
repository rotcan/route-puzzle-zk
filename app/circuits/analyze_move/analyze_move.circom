pragma circom 2.1.4;

include "../../node_modules/circomlib/circuits/comparators.circom";
//include "../../node_modules/circomlib/circuits/mimcsponge.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";

template PlayerMove () {
    signal input sk;
    signal input ex;
    signal input ey;
    signal input pub;
    signal input limit;
    
    signal input x1;
    signal input y1;

    signal input x2;
    signal input y2;

    //0 = exact
    //1 = near/far
    //2 = same
    signal output state[3];
    
    //Check if ex and ey are the ones which were used in init
    // component mimc = MiMCSponge(3, 220, 1);
    // mimc.ins[0]<==ex;
    // mimc.ins[1]<==ey;
    // mimc.ins[2]<==sk;
    // mimc.k<==0;
    component mimc = Poseidon(3);
    mimc.inputs[0]<==ex;
    mimc.inputs[1]<==ey;
    mimc.inputs[2]<==sk;

    component is_equal=IsEqual();
    is_equal.in[0] <== pub;
    is_equal.in[1] <== mimc.out;
    is_equal.out === 1; 
    

    //In range
    component lt3 = LessEqThan(4);
    lt3.in[0] <== x2;
    lt3.in[1] <== limit;
    lt3.out === 1; 
    
    component lt4 = LessEqThan(4);
    lt4.in[0] <== y2;
    lt4.in[1] <== limit;
    lt4.out === 1; 


    component gt1 = GreaterEqThan(4);
    gt1.in[0] <== x2;
    gt1.in[1] <== 0;
    gt1.out === 1; 

    component gt2 = GreaterEqThan(4);
    gt2.in[0] <== y2;
    gt2.in[1] <== 0;
    gt2.out === 1; 

    
    //Check if closer or farther
    signal old_diff_x;
    signal old_diff_y;
    signal old_diff_x_sq;
    signal old_diff_y_sq;
    signal old_total;
  
    old_diff_x<==ex-x1;
    old_diff_y<==ey-y1;
    old_diff_x_sq<==old_diff_x*old_diff_x;
    old_diff_y_sq<==old_diff_y*old_diff_y;
    old_total<==old_diff_x_sq + old_diff_y_sq;

    signal new_diff_x;
    signal new_diff_y;
    signal new_diff_x_sq;
    signal new_diff_y_sq;
    signal new_total;
   
    new_diff_x<==ex-x2;
    new_diff_y<==ey-y2;
    new_diff_x_sq<==new_diff_x*new_diff_x;
    new_diff_y_sq<==new_diff_y*new_diff_y;
    new_total<==new_diff_x_sq + new_diff_y_sq;

    state[0]<-- x2*x2==ex*ex && y2*y2==ey*ey ? 1 :0;
    state[1]<-- new_total>old_total ? 1:0;
    state[2]<-- new_diff_x_sq==old_diff_x_sq && new_diff_y_sq==old_diff_y_sq ? 1 : 0;

    state[0]*(state[0]-1)===0;
    state[1]*(state[1]-1)===0;
    state[2]*(state[2]-1)===0;

}

component main { public [ pub, x1,y1,x2,y2,limit] } = PlayerMove();