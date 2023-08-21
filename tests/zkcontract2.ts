import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Zkcontract2 } from "../target/types/zkcontract2";

describe("zkcontract2", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Zkcontract2 as Program<Zkcontract2>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
