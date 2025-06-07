import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { toast } from 'react-toastify';

import NFTCard from '../components/NFTCard';
import NFTDetailsModal from '../components/NFTDetailsModal';
import { nftaddress, nftmarketaddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';
import { WalletContext } from '../App';
import './Marketplace.css';

export default function Marketplace() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');
  const [selectedNft, setSelectedNft] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { account, connectWallet } = useContext(WalletContext);

  useEffect(() => {
    if (account) {
      loadNFTs();
    } else {
      setLoadingState('no-wallet');
    }
  }, [account]);

  useEffect(() => {
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      setNfts([]);
      setLoadingState('no-wallet');
    }
    // Account update is handled by WalletContext
  };

  const checkConnection = async () => {
    if (!window.ethereum) {
      setLoadingState('no-metamask');
      return;
    }
    
    if (!account) {
      setLoadingState('no-wallet');
    } else {
      loadNFTs();
    }
  };

  const loadNFTs = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
      const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider);

      // Listen for MarketItem events
      marketContract.on("MarketItemCreated", () => {
        loadNFTs(); // Reload NFTs when a new item is listed
      });

      marketContract.on("MarketItemSold", () => {
        loadNFTs(); // Reload NFTs when an item is sold
      });

      const data = await marketContract.fetchMarketItems();
      
      const items = await Promise.all(data.map(async i => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
        let item = {
          price,
          itemId: i.itemId.toNumber(),
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      }));
      
      setNfts(items);
      setLoadingState('loaded');
    } catch (error) {
      console.error('Error loading NFTs:', error);
      toast.error('Error loading NFTs');
      setLoadingState('error');
    }
  };

  const buyNft = async (nft) => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      return;
    }

    if (!account) {
      toast.error('Please connect your wallet first!');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

      const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
      
      console.log('🛒 Buying NFT:', nft.name, 'for', nft.price, 'ETH');

      // Use buyNFT instead of createMarketSale for better tracking
      const transaction = await contract.buyNFT(nftaddress, nft.itemId, {
        value: price,
        gasLimit: 500000
      });

      console.log('📤 Transaction sent:', transaction.hash);

      const receipt = await transaction.wait();
      console.log('✅ Purchase confirmed:', receipt);

      if (receipt.status === 1) {
        // Add buy NFT activity to localStorage for tracking
        const buyActivity = {
          type: 'BUY_NFT',
          txHash: receipt.transactionHash,
          timestamp: Date.now(),
          tokenId: nft.tokenId,
          itemId: nft.itemId,
          name: nft.name,
          price: nft.price,
          seller: nft.seller,
          buyer: account,
          status: 'success'
        };
        
        // Save to localStorage for activity tracking
        const existingActivity = JSON.parse(localStorage.getItem('nft_activity') || '[]');
        existingActivity.unshift(buyActivity);
        localStorage.setItem('nft_activity', JSON.stringify(existingActivity.slice(0, 50)));
        
        console.log('📝 Buy NFT activity saved:', buyActivity);
        
        // Trigger custom event for activity updates
        window.dispatchEvent(new CustomEvent('nftActivityUpdated', { 
          detail: { activity: buyActivity } 
        }));

        toast.success('🎉 Đã mua thành công!');
        loadNFTs();
      }
    } catch (error) {
      console.error('Error buying NFT:', error);
      if (error.code === 4001) {
        toast.error('Transaction rejected');
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient funds');
      } else {
        toast.error('Error buying NFT: ' + (error.reason || error.message || 'Unknown error'));
      }
    }
  };

  const handleViewNft = (nft) => {
    setSelectedNft(nft);
    setModalOpen(true);
  };

  if (loadingState === 'no-metamask') {
    return <div className="no-metamask">Please install MetaMask to use this marketplace</div>;
  }

  if (loadingState === 'no-wallet') {
    return (
      <div className="no-wallet">
        <p>Please connect your wallet to view the marketplace</p>
        <button onClick={connectWallet}>Connect Wallet</button>
      </div>
    );
  }

  if (loadingState === 'loaded' && !nfts.length) {
    return <div className="no-items">No items in marketplace</div>;
  }

  return (
    <div className="marketplace-container">
      <h1>NFT Marketplace</h1>
      <div className="nft-grid">
        {nfts.map((nft, i) => (
          <NFTCard
            key={i}
            nft={nft}
            onBuy={() => buyNft(nft)}
            onView={() => handleViewNft(nft)}
            showBuyButton={nft.seller.toLowerCase() !== account.toLowerCase()}
          />
        ))}
      </div>
      {modalOpen && selectedNft && (
        <NFTDetailsModal
          nft={selectedNft}
          onClose={() => setModalOpen(false)}
          onBuy={() => {
            buyNft(selectedNft);
            setModalOpen(false);
          }}
          showBuyButton={selectedNft.seller.toLowerCase() !== account.toLowerCase()}
        />
      )}
    </div>
  );
} 