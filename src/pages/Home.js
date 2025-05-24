import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { toast } from 'react-toastify';
import NFTCard from '../components/NFTCard';
import OpenSeaNFTCard from '../components/OpenSeaNFTCard';
import NFTDetailsModal from '../components/NFTDetailsModal';
import { nftaddress, nftmarketaddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';
import { fetchTrendingNFTs } from '../utils/opensea-api';
import './Home.css';

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [openSeaNfts, setOpenSeaNfts] = useState([]);
  const [selectedNft, setSelectedNft] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingState, setLoadingState] = useState('not-loaded');
  const [openSeaLoading, setOpenSeaLoading] = useState(true);

  useEffect(() => {
    loadNFTs();
    loadOpenSeaNFTs();
  }, []);

  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider);
    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId);
      console.log(`Token ${i.tokenId} URI:`, tokenUri);
      
      // Default placeholder metadata
      const defaultMeta = {
        name: `NFT #${i.tokenId}`,
        description: 'Demo NFT for marketplace',
        image: 'https://via.placeholder.com/400x400?text=NFT+' + i.tokenId
      };
      
      let meta = { data: defaultMeta };
      
      // Try to fetch metadata from different sources
      try {
        if (tokenUri.startsWith('https://ipfs.io/ipfs/') || tokenUri.startsWith('ipfs://')) {
          // IPFS URL - try multiple gateways
          let ipfsHash;
          if (tokenUri.startsWith('ipfs://')) {
            ipfsHash = tokenUri.replace('ipfs://', '');
          } else {
            ipfsHash = tokenUri.replace('https://ipfs.io/ipfs/', '');
          }
          
          // Try multiple IPFS gateways
          const gateways = [
            `https://ipfs.io/ipfs/${ipfsHash}`,
            `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
            `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`
          ];
          
          for (const gateway of gateways) {
            try {
              console.log(`Trying IPFS gateway: ${gateway}`);
              const response = await axios.get(gateway, { timeout: 5000 });
              meta.data = response.data;
              console.log(`Successfully loaded metadata from: ${gateway}`);
              break;
            } catch (gatewayError) {
              console.log(`Gateway failed: ${gateway}`, gatewayError.message);
              continue;
            }
          }
        } else if (tokenUri.startsWith('data:application/json;base64,')) {
          // Base64 encoded JSON data URL (Unicode-safe decoding)
          const base64Data = tokenUri.replace('data:application/json;base64,', '');
          const jsonString = decodeURIComponent(escape(atob(base64Data)));
          meta.data = JSON.parse(jsonString);
        } else if (tokenUri.startsWith('data:')) {
          // Other data URLs
          const response = await fetch(tokenUri);
          meta.data = await response.json();
        } else if (tokenUri.startsWith('http')) {
          // Regular HTTP URL
          const response = await axios.get(tokenUri);
          meta.data = response.data;
        }
        
        // Process the image URL to handle IPFS
        if (meta.data.image) {
          if (meta.data.image.startsWith('ipfs://')) {
            const ipfsHash = meta.data.image.replace('ipfs://', '');
            meta.data.image = `https://ipfs.io/ipfs/${ipfsHash}`;
            console.log(`Converted IPFS image URL: ${meta.data.image}`);
          }
        }
        
        console.log(`Token ${i.tokenId} metadata:`, meta.data);
      } catch (error) {
        console.log('Could not fetch metadata, using placeholder:', error);
        // Keep default placeholder metadata
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
      console.log(`Token ${i.tokenId} final item:`, item);
      return item;
    }));
    setNfts(items);
    setLoadingState('loaded');
  }

  async function loadOpenSeaNFTs() {
    try {
      setOpenSeaLoading(true);
      const trending = await fetchTrendingNFTs(10);
      setOpenSeaNfts(trending);
    } catch (error) {
      console.error('Error loading OpenSea NFTs:', error);
    } finally {
      setOpenSeaLoading(false);
    }
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

  const handleViewNft = (nft) => {
    setSelectedNft(nft);
    setModalOpen(true);
  };

  const handleBuyOnOpenSea = (nft) => {
    window.open(nft.permalink, '_blank');
    toast.info('Redirecting to OpenSea to complete purchase');
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedNft(null);
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Discover, Create, and Sell NFTs</h1>
      </div>
      
      {/* Local Marketplace NFTs */}
      <div className="marketplace-section">
        <h2>🏪 Local Marketplace</h2>
        {loadingState === 'loaded' && !nfts.length ? (
          <div className="empty-state">
            <h3>No items in local marketplace</h3>
            <p>Create your own NFT to get started!</p>
          </div>
        ) : (
          <div className="nft-grid">
            {nfts.map((nft, i) => (
              <NFTCard
                key={i}
                nft={nft}
                onBuy={() => buyNft(nft)}
                onView={handleViewNft}
                showBuyButton={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* OpenSea NFTs Section */}
      <div className="opensea-section">
        <h2>🌊 Trending on OpenSea</h2>
        <p className="section-subtitle">Discover popular NFTs from the world's largest marketplace</p>
        
        {openSeaLoading ? (
          <div className="loading-state">
            <p>Loading trending NFTs from OpenSea...</p>
            <div className="loading-grid">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="loading-card"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="opensea-grid">
            {openSeaNfts.map((nft, i) => (
              <OpenSeaNFTCard
                key={i}
                nft={nft}
                onView={handleViewNft}
                onBuyOnOpenSea={handleBuyOnOpenSea}
              />
            ))}
          </div>
        )}
      </div>

      {/* NFT Details Modal */}
      <NFTDetailsModal
        nft={selectedNft}
        isOpen={modalOpen}
        onClose={closeModal}
        onBuy={buyNft}
        onBuyOnOpenSea={handleBuyOnOpenSea}
      />
    </div>
  );
} 