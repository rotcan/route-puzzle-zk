import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import logo from './logo.svg';
import './App.css';
import Wallet from './components/ui/Wallet';
import Game from './components/ui/Game';

function App() {
  const [walletKey, setWalletKey] = useState<PublicKey | null>();
  return (
    <div className="App">
      <header className="App-header">
        <Wallet setWalletKey={setWalletKey} walletKey={walletKey}></Wallet>
      </header>
      <Game walletKey={walletKey}></Game>
      {/* <div>
        {walletKey && <Airdrop connection={connection} publicKey={walletKey} />}
      </div>
      <div className='text-left padding10'>
        {walletKey && <Vote connection={connection} programId={programId} />}

      </div> */}
    </div>
  );
}

export default App;
