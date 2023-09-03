import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Game from "./components/ui/Game";
import Wallet from "./components/ui/Wallet";
import { useWallet } from "@solana/wallet-adapter-react";

const Home=()=>{
    const {connected}=useWallet();
    return (
        <>
            <header className="App-header">
                {!connected && <WalletMultiButton />}
                {connected && <Wallet></Wallet>}
            </header>
            
            
            
            <Game ></Game>
            
        </>
    )
}

export default Home;