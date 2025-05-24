import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaWallet, FaChevronDown, FaCopy, FaSignOutAlt, FaEthereum } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Navbar.css';

const Navbar = () => {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [network, setNetwork] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    checkConnection();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      getBalance(accounts[0]);
    } else {
      setAccount('');
      setBalance('0');
    }
    setProfileDropdownOpen(false);
  };

  const handleChainChanged = (chainId) => {
    window.location.reload();
  };

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          getBalance(accounts[0]);
          getNetworkInfo();
        }
      } catch (error) {
        console.log('Error checking connection:', error);
      }
    }
  };

  const getBalance = async (address) => {
    if (window.ethereum) {
      try {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
        setBalance(balanceInEth.toFixed(4));
      } catch (error) {
        console.log('Error getting balance:', error);
      }
    }
  };

  const getNetworkInfo = async () => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const networkNames = {
          '0x1': 'Ethereum Mainnet',
          '0x3': 'Ropsten Testnet',
          '0x4': 'Rinkeby Testnet',
          '0x5': 'Goerli Testnet',
          '0xaa36a7': 'Sepolia Testnet',
          '0x539': 'Hardhat Local',
        };
        setNetwork(networkNames[chainId] || `Chain ID: ${parseInt(chainId, 16)}`);
      } catch (error) {
        console.log('Error getting network info:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
      return;
    }
        
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      getBalance(accounts[0]);
      getNetworkInfo();
    } catch (error) {
      console.log('Error connecting wallet:', error);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    toast.success('Address copied to clipboard!');
    setProfileDropdownOpen(false);
  };

  const disconnectWallet = () => {
    setAccount('');
    setBalance('0');
    setNetwork('');
    setProfileDropdownOpen(false);
    toast.info('Wallet disconnected');
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <h2>NFT Marketplace</h2>
        </Link>
        
        <div className="nav-menu">
          <Link to="/" className="nav-link">
            Explore
          </Link>
          <Link to="/create-item" className="nav-link">
            Create
          </Link>
          <Link to="/my-nfts" className="nav-link">
            My NFTs
          </Link>
          <Link to="/created-nfts" className="nav-link">
            Created
          </Link>
        </div>

        <div className="nav-actions">
          {account ? (
            <div className="wallet-info">
              <FaWallet className="wallet-icon" />
              <span>{formatAddress(account)}</span>
            </div>
          ) : (
            <button className="connect-wallet-btn" onClick={connectWallet}>
              <FaWallet className="wallet-icon" />
              Connect Wallet
            </button>
          )}
          
          <div className="profile-section">
            <div 
              className={`profile-icon ${profileDropdownOpen ? 'active' : ''}`}
              onClick={toggleProfileDropdown}
            >
              <FaUser />
              <FaChevronDown className="dropdown-arrow" />
            </div>
            
            {profileDropdownOpen && account && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <div className="profile-avatar">
                    <FaUser />
                  </div>
                  <div className="profile-info">
                    <p className="profile-address">{formatAddress(account)}</p>
                    <p className="profile-network">{network}</p>
                  </div>
                </div>
                
                <div className="profile-balance">
                  <FaEthereum className="eth-icon" />
                  <span>{balance} ETH</span>
                </div>
                
                <div className="profile-actions">
                  <button onClick={copyAddress} className="profile-action">
                    <FaCopy />
                    Copy Address
                  </button>
                  <button onClick={disconnectWallet} className="profile-action disconnect">
                    <FaSignOutAlt />
                    Disconnect
                  </button>
                </div>
                
                <div className="profile-details">
                  <div className="detail-row">
                    <span>Full Address:</span>
                    <span className="mono">{account}</span>
                  </div>
                </div>
              </div>
            )}
            
            {profileDropdownOpen && !account && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <p>Please connect your wallet to view profile information</p>
                </div>
                <button onClick={connectWallet} className="connect-wallet-btn">
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {profileDropdownOpen && (
        <div 
          className="dropdown-overlay" 
          onClick={() => setProfileDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar; 