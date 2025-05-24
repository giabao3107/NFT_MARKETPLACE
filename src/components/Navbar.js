import React, { useState, useEffect } from 'react';import { Link } from 'react-router-dom';import { FaUser, FaWallet } from 'react-icons/fa';import './Navbar.css';

const Navbar = () => {  const [account, setAccount] = useState('');  useEffect(() => {    checkConnection();  }, []);  const checkConnection = async () => {    if (window.ethereum) {      try {        const accounts = await window.ethereum.request({ method: 'eth_accounts' });        if (accounts.length > 0) {          setAccount(accounts[0]);        }      } catch (error) {        console.log('Error checking connection:', error);      }    }  };  const connectWallet = async () => {    if (!window.ethereum) {      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');      return;    }        try {      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });      setAccount(accounts[0]);    } catch (error) {      console.log('Error connecting wallet:', error);    }  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
          
          <div className="profile-icon">
            <FaUser />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 