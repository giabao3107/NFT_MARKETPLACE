import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { toast } from 'react-toastify';

import NFTCard from '../components/NFTCard';
import { nftaddress, nftmarketaddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';
import './CreatedNFTs.css';

export default function CreatedNFTs() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');
  const [account, setAccount] = useState('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          loadNFTs();
        } else {
          setLoadingState('no-wallet');
        }
      } catch (error) {
        console.log('Error checking connection:', error);
        setLoadingState('error');
      }
    } else {
      setLoadingState('no-metamask');
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      loadNFTs();
    } catch (error) {
      console.log('Error connecting wallet:', error);
      toast.error('Error connecting wallet');
    }
  };

  async function loadNFTs() {
    if (!window.ethereum) {
      console.log('MetaMask not found');
      setLoadingState('no-metamask');
      return;
    }

    try {
      setLoadingState('loading');
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
      
      const data = await marketContract.fetchItemsCreated();

      const items = await Promise.all(data.map(async i => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        
        let meta = {
          name: `NFT #${i.tokenId}`,
          description: 'NFT created on marketplace',
          image: 'https://via.placeholder.com/400x400?text=NFT+' + i.tokenId
        };

        // Try to fetch metadata
        try {
          if (tokenUri.startsWith('data:application/json;base64,')) {
            const base64Data = tokenUri.replace('data:application/json;base64,', '');
            const jsonString = decodeURIComponent(escape(atob(base64Data)));
            meta = JSON.parse(jsonString);
          } else if (tokenUri.startsWith('http')) {
            const response = await axios.get(tokenUri);
            meta = response.data;
          }
        } catch (error) {
          console.log('Could not fetch metadata, using placeholder');
        }

        let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          image: meta.image,
          name: meta.name,
          description: meta.description,
        };
        return item;
      }));
      
      setNfts(items);
      setLoadingState('loaded');
    } catch (error) {
      console.error('Error loading created NFTs:', error);
      setLoadingState('loaded'); // Set to loaded even if empty
      setNfts([]); // Empty array for no NFTs
    }
  }

  if (loadingState === 'no-metamask') {
    return (
      <div className="created-nfts-container">
        <div className="empty-state">
          <h2>MetaMask Required</h2>
          <p>Please install MetaMask to view your created NFTs.</p>
        </div>
      </div>
    );
  }

  if (loadingState === 'no-wallet') {
    return (
      <div className="created-nfts-container">
        <div className="empty-state">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view your created NFTs.</p>
          <button onClick={connectWallet} className="connect-button">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loadingState === 'loading') {
    return (
      <div className="created-nfts-container">
        <div className="empty-state">
          <h2>Loading...</h2>
          <p>Fetching your created NFTs from the blockchain...</p>
        </div>
      </div>
    );
  }

  if (loadingState === 'loaded' && !nfts.length) {
    return (
      <div className="created-nfts-container">
        <div className="empty-state">
          <h2>No NFTs created</h2>
          <p>You haven't created any NFTs yet. Start creating your first NFT!</p>
          <div style={{ marginTop: '20px' }}>
            <button onClick={() => window.location.href = '/create-item'} className="create-button">
              Create Your First NFT
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="created-nfts-container">
      <h1>Created NFTs</h1>
      <p className="subtitle">NFTs you have created and listed for sale</p>
      <div className="nft-grid">
        {nfts.map((nft, i) => (
          <div key={i} className="created-nft-card">
            <NFTCard
              nft={nft}
              showBuyButton={false}
            />
            <div className="nft-status">
              {nft.sold ? (
                <span className="status-sold">✅ Sold</span>
              ) : (
                <span className="status-listed">🏷️ Listed for {nft.price} ETH</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 