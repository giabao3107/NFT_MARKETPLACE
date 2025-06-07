import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { toast } from 'react-toastify';

import NFTCard from '../components/NFTCard';
import NFTDetailsModal from '../components/NFTDetailsModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { nftaddress, nftmarketaddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';
import './CreatedNFTs.css';

export default function CreatedNFTs() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');
  const [account, setAccount] = useState('');
  const [selectedNft, setSelectedNft] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
      console.log('Starting to load Created NFTs...');
      
      // Add timeout for the entire operation
      const timeout = setTimeout(() => {
        console.log('Loading timeout reached');
        setLoadingState('loaded');
        setNfts([]);
        toast.error('Loading timed out. Please try again.');
      }, 15000); // 15 second timeout

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      console.log('Connected to wallet, fetching data...');

      const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
      
      console.log('Calling fetchItemsCreated...');
      const data = await marketContract.fetchItemsCreated();
      console.log('fetchItemsCreated returned:', data);
      
      clearTimeout(timeout); // Clear timeout if successful

      if (!data || data.length === 0) {
        console.log('No created NFTs found for this address');
        setNfts([]);
        setLoadingState('loaded');
        return;
      }

      console.log(`Processing ${data.length} created NFTs...`);
      const items = await Promise.all(data.map(async (i, index) => {
        console.log(`Processing created NFT ${index + 1}/${data.length}, tokenId: ${i.tokenId}`);
        
        try {
          const tokenUri = await tokenContract.tokenURI(i.tokenId);
          
          let meta = {
            name: `NFT #${i.tokenId}`,
            description: 'NFT created on marketplace',
            image: 'https://via.placeholder.com/400x400?text=NFT+' + i.tokenId
          };

          // Try to fetch metadata with timeout
          try {
            if (tokenUri.startsWith('data:application/json;base64,')) {
              const base64Data = tokenUri.replace('data:application/json;base64,', '');
              const jsonString = decodeURIComponent(escape(atob(base64Data)));
              meta = JSON.parse(jsonString);
            } else if (tokenUri.startsWith('http')) {
              const response = await axios.get(tokenUri, { timeout: 5000 });
              meta = response.data;
            }
            
            // Process IPFS images
            if (meta.image && meta.image.startsWith('ipfs://')) {
              const ipfsHash = meta.image.replace('ipfs://', '');
              meta.image = `https://ipfs.io/ipfs/${ipfsHash}`;
            }
          } catch (metaError) {
            console.log(`Could not fetch metadata for token ${i.tokenId}:`, metaError.message);
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
          
          console.log(`Processed created NFT ${index + 1}: ${item.name}`);
          return item;
        } catch (itemError) {
          console.error(`Error processing created NFT ${i.tokenId}:`, itemError);
          return null;
        }
      }));
      
      // Filter out failed items
      const validItems = items.filter(item => item !== null);
      console.log(`Successfully processed ${validItems.length} created NFTs`);
      
      setNfts(validItems);
      setLoadingState('loaded');
    } catch (error) {
      console.error('Error loading created NFTs:', error);
      setLoadingState('loaded');
      setNfts([]);
      
      if (error.message.includes('network')) {
        toast.error('Network error. Make sure you\'re connected to the correct network.');
      } else if (error.message.includes('rejected')) {
        toast.error('Transaction rejected by user.');
      } else {
        toast.error('Error loading created NFTs. Please try again.');
      }
    }
  }

  const handleViewNft = (nft) => {
    setSelectedNft(nft);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedNft(null);
  };

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
          <LoadingSpinner size="large" />
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
              onView={handleViewNft}
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
      {selectedNft && (
        <NFTDetailsModal
          isOpen={modalOpen}
          onClose={closeModal}
          nft={selectedNft}
        />
      )}
    </div>
  );
} 