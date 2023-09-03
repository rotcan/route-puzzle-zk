import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import './App.css';
import Home from './Home';
require("@solana/wallet-adapter-react-ui/styles.css");

function App() {
  const endpoint=process.env.REACT_APP_URL;
  const wallet = new PhantomWalletAdapter()
  return (
    <div className="App">
    {endpoint && 
      <ConnectionProvider endpoint={endpoint}>
              <WalletProvider wallets={[wallet]}>
              <WalletModalProvider>
              
              <Home />
              </WalletModalProvider>
        </WalletProvider>
        </ConnectionProvider>
  }
      </div>
  );
}

export default App;
