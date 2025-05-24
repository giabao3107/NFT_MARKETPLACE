import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { toast } from 'react-toastify';

import NFTCard from '../components/NFTCard';
import { nftaddress, nftmarketaddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';
import './Home.css';

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider();
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider);
    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId);
      // For demo purposes, we'll use placeholder metadata since IPFS is not available
      const meta = {
        data: {
          name: `NFT #${i.tokenId}`,
          description: 'Demo NFT for marketplace',
          image: 'https://via.placeholder.com/400x400?text=NFT+' + i.tokenId
        }
      };
      
      // If tokenUri is a valid URL, try to fetch metadata
      try {
        if (tokenUri.startsWith('http')) {
          const response = await axios.get(tokenUri);
          meta.data = response.data;
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
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      };
      return item;
    }));
    setNfts(items);
    setLoadingState('loaded');
  }

  async function buyNft(nft) {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

      const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
      
      const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
        value: price
      });
      await transaction.wait();
      toast.success('NFT purchased successfully!');
      loadNFTs();
    } catch (error) {
      toast.error('Error purchasing NFT');
      console.error(error);
    }
  }

  if (loadingState === 'loaded' && !nfts.length) {
    return (
      <div className="home-container">
        <div className="empty-state">
          <h2>No items in marketplace</h2>
          <p>Check back later or create your own NFT!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Discover, Create, and Sell NFTs</h1>
        <p>The largest NFT marketplace. Buy, sell, and discover exclusive digital items.</p>
      </div>
      
      <div className="nft-grid">
        {nfts.map((nft, i) => (
          <NFTCard
            key={i}
            nft={nft}
            onBuy={() => buyNft(nft)}
            showBuyButton={true}
          />
        ))}
      </div>
    </div>
  );
} 