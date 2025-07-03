import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ethers } from 'ethers';
import { StagewiseToolbar } from '@stagewise/toolbar-react';
import { ReactPlugin } from '@stagewise-plugins/react';

import Header from './components/Header';
import Home from './pages/Home';
import CreateItem from './pages/CreateItem';
import MyNFTs from './pages/MyNFTs';
import CreatedNFTs from './pages/CreatedNFTs';
import Wallet from './pages/Wallet';
import PurchaseHistory from './components/PurchaseHistory';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

// Enhanced Wallet Context with balance tracking
export const WalletContext = React.createContext();

function App() {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeWallet();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('connect', handleConnect);
      window.ethereum.on('disconnect', handleDisconnect);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('connect', handleConnect);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  const initializeWallet = async () => {
    try {
      setIsLoading(true);
      await checkIfWalletIsConnected();
    } finally {
      setIsLoading(false);
    }
  };

  const updateBalance = async (address = account) => {
    if (!window.ethereum || !address) {
      setBalance('0');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.utils.formatEther(balance);
      setBalance(balanceInEth);
      console.log('💰 Balance updated:', balanceInEth, 'ETH');
    } catch (error) {
      console.error('Error updating balance:', error);
      setBalance('0');
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) {
        console.log('MetaMask not detected');
        return;
      }
      
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await updateBalance(accounts[0]);
        console.log('✅ Wallet connected:', accounts[0]);
      } else {
        console.log('No accounts connected');
        setAccount('');
        setBalance('0');
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setAccount('');
      setBalance('0');
    }
  };

  const handleAccountsChanged = async (accounts) => {
    console.log('🔄 Account changed event:', accounts);
    
    if (accounts.length > 0) {
      const newAccount = accounts[0];
      console.log('✅ Switching to account:', newAccount);
      setAccount(newAccount);
      await updateBalance(newAccount);
      toast.info(`Switched to: ${newAccount.slice(0, 6)}...${newAccount.slice(-4)}`);
      
      // Force refresh after a short delay to ensure state is updated
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      console.log('❌ No accounts connected');
      setAccount('');
      setBalance('0');
      toast.warning('Wallet disconnected');
    }
  };

  const handleChainChanged = (chainId) => {
    console.log('🔗 Chain changed to:', chainId);
    toast.info('Network changed, reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleConnect = (connectInfo) => {
    console.log('🔗 Wallet connected:', connectInfo);
    checkIfWalletIsConnected();
  };

  const handleDisconnect = (error) => {
    console.log('❌ Wallet disconnected:', error);
    setAccount('');
    setBalance('0');
    toast.warning('Wallet disconnected');
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      return;
    }

    try {
      setIsConnecting(true);
      console.log('🔌 Requesting wallet connection...');
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await updateBalance(accounts[0]);
        toast.success('Wallet connected successfully!');
        console.log('✅ Connected to:', accounts[0]);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        toast.error('Connection rejected by user');
      } else {
        toast.error('Error connecting wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const refreshBalance = () => {
    if (account) {
      updateBalance(account);
    }
  };

  const walletContextValue = {
    account,
    balance,
    connectWallet,
    isConnecting,
    isLoading,
    refreshBalance,
    updateBalance
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen={true} size="large" />;
  }

  return (
    <WalletContext.Provider value={walletContextValue}>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create-item" element={<CreateItem />} />
              <Route path="/my-nfts" element={<MyNFTs />} />
              <Route path="/created" element={<CreatedNFTs />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/purchase-history" element={<PurchaseHistory />} />
            </Routes>
          </main>
          {/* Stagewise Toolbar: Only appears in development */}
          <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
          <ToastContainer 
            position="top-right" 
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
          
          <footer className="app-footer">
            <p>Created By Group 6 - Class 243BFF400602</p>
          </footer>
        </div>
      </Router>
    </WalletContext.Provider>
  );
}

export default App; 