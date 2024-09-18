import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles.css';

import Intro from './Intro';
import LandingPage from './LandingPage';
import USDCBridgetests from './USDCBridgetests';
import USDCSend from './USDCSend';
import UserCreate from './UserCreate';



import { ethers, BrowserProvider } from 'ethers';
import {
  createWeb3Modal,
  defaultConfig,
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider
} from '@web3modal/ethers/react';

const projectId = import.meta.env.VITE_PROJECT_ID;
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set');
}

const chains = [


  { chainId: 43113, name: 'Avalanche Fuji Testnet', currency: 'AVAX', explorerUrl: 'https://testnet.snowtrace.io', rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc' },
  { chainId: 11155111, name: 'Sepolia Testnet', currency: 'ETH', explorerUrl: 'https://sepolia.etherscan.io', rpcUrl: 'https://1rpc.io/sepolia' },
  { chainId: 84532, name: 'Base Sepolia', currency: 'ETH', explorerUrl: 'https://sepolia.basescan.org', rpcUrl: 'https://sepolia.base.org' },
  { chainId: 421614, name: 'Arbitrum Sepolia', currency: 'ETH', explorerUrl: 'https://sepolia-explorer.arbitrum.io', rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc' }
];

const ethersConfig = defaultConfig({
  metadata: {
    name: 'Chainwave usdc bridge test',
    description: '',
    url: '',
    icons: ['images/favicon.png']
  },
  defaultChainId: 84532,
  rpcUrl: 'https://sepolia.base.org',
  auth: {
    email: false,
    showWallets: true,
    walletFeatures: true
  }
});

const modal = createWeb3Modal({
  ethersConfig,
  chains,
  projectId,
  enableAnalytics: true,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': 'grey',
    '--w3m-accent': '#313131', // Set your desired background color
    '--w3m-color-mix-strength': 22
  },
  chainImages: {
    43113: 'https://thatdamndawg.com/images/networklogos/avax.png',
    421614: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
    11155111: '/images/sepolia.png',
    84532: '/images/base.png',



      56: 'https://thatdamndawg.com/images/networklogos/bsc.png',
      137: 'https://thatdamndawg.com/images/networklogos/polygon.png',
      42161: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
      10: 'https://assets.coingecko.com/coins/images/25244/large/OP.jpeg?1651026279',
      7777777: 'https://media.licdn.com/dms/image/C4E0BAQE2QFmWjvYbLw/company-logo_200_200/0/1679507991235/ourzora_logo?e=2147483647&v=beta&t=fm_w5of8cLl7CsiMbZG_ouXOirfFqTE2PBHfprsktWc',
      666666666: 'https://dd.dexscreener.com/ds-data/tokens/base/0x4ed4e862860bed51a9570b96d89af5e1b0efefed.png?size=lg&key=e17c44',
      25: 'https://thatdamndawg.com/images/networklogos/cronos.png',
      43114: 'https://thatdamndawg.com/images/networklogos/avax.png',
      59144: 'https://lineascan.build/assets/linea/images/svg/logos/chain-light.svg?v=24.5.5.0',
      369: 'https://tokens.app.pulsex.com/images/tokens/0xA1077a294dDE1B09bB078844df40758a5D0f9a27.png',
      97: 'https://thatdamndawg.com/images/networklogos/tbsc.png',
      80002: 'https://thatdamndawg.com/images/networklogos/amoyPolygon.png',
    },
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'
  ]
});


  const App = () => {
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [connected, setConnected] = useState(false);

    const { open, close } = useWeb3Modal();
    const { address, chainId, isConnected } = useWeb3ModalAccount();
    const { walletProvider } = useWeb3ModalProvider();

    useEffect(() => {
      const connectWalletOnPageLoad = async () => {
        if (localStorage.getItem("isWalletConnected") === "true") {
          await connectWallet();
        }
      };
      connectWalletOnPageLoad();
    }, []);

    const connectWallet = async () => {
      try {
        await open();
        if (walletProvider) {
          const provider = new BrowserProvider(walletProvider);
          setProvider(provider);
          setConnected(true);
          localStorage.setItem("isWalletConnected", "true");
        } else {
          console.error("walletProvider is undefined");
        }
      } catch (error) {
        console.error("Could not get a wallet connection", error);
      }
    };


    const disconnectWallet = async () => {
      await close();
      setProvider(null);
      setConnected(false);
      localStorage.removeItem("isWalletConnected");
    };


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Intro />} />
          <Route path="/landing" element={<LandingPage />} />
            <Route path="/usdctestbridge" element={<USDCBridgetests />} />
              <Route path="/usdcsend" element={<USDCSend />} />

                <Route path="/create" element={<UserCreate />} />
      </Routes>
    </Router>
  );
};

export default App;

// {
//   chainId: 8453,
//   name: 'Base',
//   currency: 'ETH',
//   explorerUrl: 'https://basescan.org',
//   rpcUrl: 'https://mainnet.base.org'
// },
// {
//   chainId: 56,
//   name: 'BSC',
//   currency: 'BNB',
//   explorerUrl: 'https://bscscan.com',
//   rpcUrl: 'https://bsc-dataseed.binance.org'
// },
// { chainId: 97, name: 'BSC Testnet', currency: 'tBNB', explorerUrl: 'https://testnet.bscscan.com', rpcUrl: 'https://data-seed-prebsc-1-s3.binance.org:8545' },
