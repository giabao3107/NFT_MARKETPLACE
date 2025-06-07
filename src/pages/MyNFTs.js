import React, { useState, useEffect, useContext, useRef } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { toast } from 'react-toastify';

import NFTCard from '../components/NFTCard';
import NFTDetailsModal from '../components/NFTDetailsModal';
import LoadingSpinner from '../components/LoadingSpinner';
import TransactionHistory from '../components/TransactionHistory';
import { nftaddress, nftmarketaddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';
import { WalletContext } from '../App';
import { UI_TEXT } from '../utils/constants';
import './MyNFTs.css';

export default function MyNFTs() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');
  const [selectedNft, setSelectedNft] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'owned', 'listed'
  const { account, connectWallet } = useContext(WalletContext);
  const reloadTimeoutRef = useRef(null);
  const marketContractRef = useRef(null);

  useEffect(() => {
    if (account) {
      loadNFTs();
    } else {
      setLoadingState('no-wallet');
    }
    
    // Cleanup on unmount
    return () => {
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
      }
      if (marketContractRef.current) {
        marketContractRef.current.removeAllListeners();
      }
    };
  }, [account]); // Reload when account changes

  const debounceReload = () => {
    // Clear any existing timeout
    if (reloadTimeoutRef.current) {
      clearTimeout(reloadTimeoutRef.current);
    }
    
    // Set new timeout
    reloadTimeoutRef.current = setTimeout(() => {
      console.log('🔄 MyNFTs debounced reload triggered');
      loadNFTs();
    }, 3000); // Wait 3 seconds before reloading
  };

  const loadNFTs = async () => {
    try {
      setLoadingState('loading');
      
      if (!window.ethereum) {
        setLoadingState('no-metamask');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Check network
      const network = await provider.getNetwork();
      if (network.chainId !== 1337) {
        setLoadingState('wrong-network');
        return;
      }

      const signer = provider.getSigner();
      const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
      
      // Remove previous listeners from stored reference
      if (marketContractRef.current) {
        marketContractRef.current.removeAllListeners();
      }
      
      // Store reference for cleanup
      marketContractRef.current = marketContract;
      
      // TEMPORARILY DISABLE EVENT LISTENERS FOR DEBUGGING
      // TODO: Re-enable after fixing the reload issue
      /*
      // Setup event listeners with debouncing
      let eventCount = 0;
      const maxEvents = 2; // Limit number of events before ignoring
      
      marketContract.on("MarketItemCreated", (itemId, nftContract, tokenId, seller, owner, price, sold) => {
        if (owner.toLowerCase() === account.toLowerCase()) {
          eventCount++;
          if (eventCount <= maxEvents) {
            console.log(`📦 MyNFTs: MarketItemCreated event detected (${eventCount}/${maxEvents})`);
            debounceReload();
          } else {
            console.log('⚠️ MyNFTs: Too many MarketItemCreated events, ignoring...');
          }
        }
      });

      // Listen for MarketItemSold event to update when user buys NFT
      marketContract.on("MarketItemSold", (itemId, nftContract, tokenId, seller, owner, price) => {
        if (owner.toLowerCase() === account.toLowerCase()) {
          eventCount++;
          if (eventCount <= maxEvents) {
            console.log(`💰 MyNFTs: MarketItemSold event detected (${eventCount}/${maxEvents})`);
            debounceReload();
          } else {
            console.log('⚠️ MyNFTs: Too many MarketItemSold events, ignoring...');
          }
        }
      });

      // Reset event count after some time
      setTimeout(() => {
        eventCount = 0;
        console.log('🔄 MyNFTs: Event count reset');
      }, 10000);
      */

      console.log('⚠️ MyNFTs: Event listeners disabled for debugging');

      // Fetch both owned NFTs and items created (listed) by user
      const [ownedData, createdData] = await Promise.all([
        marketContract.fetchMyNFTs(),
        marketContract.fetchItemsCreated()
      ]);
      
      // Combine and deduplicate (in case an item appears in both lists)
      const combinedData = [...ownedData];
      
      // Add created items that are not sold (still for sale)
      createdData.forEach(createdItem => {
        const isAlreadyIncluded = combinedData.some(ownedItem => 
          ownedItem.itemId.toNumber() === createdItem.itemId.toNumber()
        );
        
        // Only add if not already in owned list and not sold
        if (!isAlreadyIncluded && !createdItem.sold) {
          combinedData.push(createdItem);
        }
      });
      
      if (combinedData.length === 0) {
        setNfts([]);
        setLoadingState('loaded');
        return;
      }
      
      const data = combinedData;
      
      const items = await Promise.all(data.map(async i => {
        try {
          const tokenUri = await tokenContract.tokenURI(i.tokenId);
          
          let meta = {
            name: `NFT #${i.tokenId}`,
            description: 'Demo NFT for marketplace',
            image: `https://picsum.photos/400/400?random=${i.tokenId}`
          };
          
          try {
            if (tokenUri.startsWith('data:application/json;base64,')) {
              const base64Data = tokenUri.replace('data:application/json;base64,', '');
              const jsonString = decodeURIComponent(escape(atob(base64Data)));
              meta = JSON.parse(jsonString);
            } else if (tokenUri.startsWith('http')) {
              const response = await axios.get(tokenUri);
              meta = response.data;
            }
            
            if (meta.image && meta.image.startsWith('ipfs://')) {
              const ipfsHash = meta.image.replace('ipfs://', '');
              meta.image = `https://ipfs.io/ipfs/${ipfsHash}`;
            }
          } catch (metaError) {
            console.log('Could not fetch metadata, using placeholder:', metaError);
          }

          let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
          
          // Determine item status
          const isOwned = i.owner.toLowerCase() === account.toLowerCase();
          const isListed = i.seller.toLowerCase() === account.toLowerCase() && !i.sold && i.owner === '0x0000000000000000000000000000000000000000';
          
          let item = {
            price,
            itemId: i.itemId.toNumber(),
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
            category: meta.category || UI_TEXT.CATEGORY_ART,
            sold: i.sold,
            isOwned,
            isListed,
            status: isOwned ? 'owned' : isListed ? 'listed' : 'unknown'
          };
          return item;
        } catch (itemError) {
          console.error(`❌ Error processing item ${i.itemId}:`, itemError);
          return null; // Return null for failed items
        }
      }));
      
      // Filter out null items (failed to process)
      const validItems = items.filter(item => item !== null);
      setNfts(validItems);
      setLoadingState('loaded');
    } catch (error) {
      console.error('Error loading NFTs:', error);
      
      // More specific error handling
      if (error.message.includes('network')) {
        setLoadingState('network-error');
      } else if (error.message.includes('contract') || error.message.includes('call revert')) {
        setLoadingState('contract-error');
      } else if (error.message.includes('MetaMask')) {
        setLoadingState('no-metamask');
      } else {
        setLoadingState('error');
      }
    }
  };

  const handleViewNft = (nft) => {
    setSelectedNft(nft);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedNft(null);
  };

  if (!window.ethereum) {
    return (
      <div className="my-nfts-container">
        <div className="my-nfts-header">
          <h1 className="my-nfts-title">MetaMask Required</h1>
          <p className="my-nfts-subtitle">Please install MetaMask to view your NFTs.</p>
        </div>
      </div>
    );
  }

  if (loadingState === 'no-wallet' || !account) {
    return (
      <div className="my-nfts-container">
        <div className="my-nfts-header">
          <h1 className="my-nfts-title">Connect Your Wallet</h1>
          <p className="my-nfts-subtitle">Connect your wallet to view your NFT collection.</p>
          <button onClick={connectWallet} className="connect-button">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loadingState === 'wrong-network') {
    return (
      <div className="my-nfts-container">
        <div className="my-nfts-header">
          <h1 className="my-nfts-title">Wrong Network</h1>
          <p className="my-nfts-subtitle">
            Please switch to Hardhat Local Network (Chain ID: 1337)
          </p>
          <p className="my-nfts-subtitle">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
          <button onClick={loadNFTs} className="connect-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loadingState === 'network-error' || loadingState === 'contract-error' || loadingState === 'error') {
    return (
      <div className="my-nfts-container">
        <div className="my-nfts-header">
          <h1 className="my-nfts-title">Connection Error</h1>
          <p className="my-nfts-subtitle">
            {loadingState === 'network-error' ? 'Network connection failed' :
             loadingState === 'contract-error' ? 'Contract connection failed' :
             'Unable to load your NFTs'}
          </p>
          <p className="my-nfts-subtitle">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
          <p className="my-nfts-subtitle">
            Make sure Hardhat node is running and contracts are deployed
          </p>
          <button onClick={loadNFTs} className="connect-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loadingState === 'loading') {
    return (
      <div className="my-nfts-container">
        <div className="my-nfts-header">
          <h1 className="my-nfts-title">{UI_TEXT.MY_NFTS_TITLE}</h1>
          <p className="my-nfts-subtitle">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        </div>
        <div className="nft-grid-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your NFTs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadingState === 'loaded' && !nfts.length) {
    return (
      <div className="my-nfts-container">
        <div className="my-nfts-header">
          <h1 className="my-nfts-title">{UI_TEXT.MY_NFTS_TITLE}</h1>
          <p className="my-nfts-subtitle">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        </div>
        <div className="nft-grid-container">
          <div className="empty-state-modern">
            {/* Animated SVG Illustration */}
            <div className="empty-illustration">
              <div className="floating-elements">
                <div className="float-cube float-1"></div>
                <div className="float-cube float-2"></div>
                <div className="float-cube float-3"></div>
              </div>
              
              <div className="center-artwork">
                <div className="main-frame">
                  <div className="frame-shine"></div>
                  <div className="frame-content">
                    <div className="wallet-icon">
                      <span>👤</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="particles">
                <div className="particle particle-1"></div>
                <div className="particle particle-2"></div>
                <div className="particle particle-3"></div>
                <div className="particle particle-4"></div>
                <div className="particle particle-5"></div>
              </div>
            </div>

            {/* Content */}
            <div className="empty-content">
              <h2 className="empty-title">
                🎨 {UI_TEXT.MY_NFTS_EMPTY_TITLE}
              </h2>
              <p className="empty-description">
                {UI_TEXT.MY_NFTS_EMPTY_SUBTITLE}
              </p>
              
              {/* Feature highlights for My NFTs */}
              <div className="empty-features">
                <div className="feature-item">
                  <span className="feature-icon">🎭</span>
                  <span className="feature-text">Tạo tác phẩm độc đáo</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🏪</span>
                  <span className="feature-text">Bán trên marketplace</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📈</span>
                  <span className="feature-text">Theo dõi danh mục</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="empty-actions">
                <button 
                  onClick={() => window.location.href = '/create-item'} 
                  className="cta-primary"
                >
                  <span className="cta-icon">✨</span>
                  Tạo NFT đầu tiên
                  <span className="cta-arrow">→</span>
              </button>
                

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter NFTs based on status
  const filteredNfts = statusFilter === 'all' 
    ? nfts 
    : nfts.filter(nft => {
        if (statusFilter === 'owned') return nft.isOwned;
        if (statusFilter === 'listed') return nft.isListed;
        return true;
      });

  const ownedCount = nfts.filter(nft => nft.isOwned).length;
  const listedCount = nfts.filter(nft => nft.isListed).length;

  return (
    <div className="my-nfts-container">
      <div className="my-nfts-content">
      <div className="my-nfts-header">
          <h1 className="my-nfts-title">{UI_TEXT.MY_NFTS_TITLE}</h1>
        <p className="my-nfts-subtitle">
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </p>
        
        <div className="my-nfts-stats">
          <div className="stat-card">
            <div className="stat-value">{nfts.length}</div>
              <div className="stat-label">Tổng NFT</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{ownedCount}</div>
              <div className="stat-label">Đã sở hữu</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{listedCount}</div>
              <div className="stat-label">Đang bán</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {nfts.reduce((sum, nft) => sum + parseFloat(nft.price), 0).toFixed(2)}
            </div>
              <div className="stat-label">Tổng giá trị (ETH)</div>
            </div>
          </div>
        </div>
        
        {/* Status Filters */}
        <div className="nft-filters">
          <button
            onClick={() => setStatusFilter('all')}
            className={`filter-button ${statusFilter === 'all' ? 'active' : ''}`}
          >
            Tất cả ({nfts.length})
          </button>
          <button
            onClick={() => setStatusFilter('owned')}
            className={`filter-button ${statusFilter === 'owned' ? 'active' : ''}`}
          >
            Đã sở hữu ({ownedCount})
          </button>
          <button
            onClick={() => setStatusFilter('listed')}
            className={`filter-button ${statusFilter === 'listed' ? 'active' : ''}`}
          >
            Đang bán ({listedCount})
          </button>
      </div>
      
      <div className="nft-grid-container">
        <div className="nft-grid">
            {filteredNfts.map((nft, i) => (
            <NFTCard
              key={`${nft.itemId}-${nft.tokenId}-${account}`}
                nft={{
                  ...nft,
                  // Add status badge info
                  statusBadge: nft.isListed ? 'Đang bán' : 'Đã sở hữu'
                }}
              onView={() => handleViewNft(nft)}
              showBuyButton={false}
            />
          ))}
          </div>
          
          {filteredNfts.length === 0 && (
            <div className="empty-filter-state">
              <div className="empty-filter-icon">
                {statusFilter === 'owned' ? '💎' : 
                 statusFilter === 'listed' ? '🏪' : '📭'}
              </div>
              <h2>Không có NFT nào</h2>
              <p>
                {statusFilter === 'owned' ? 'Bạn chưa sở hữu NFT nào.' :
                 statusFilter === 'listed' ? 'Bạn chưa liệt kê NFT nào để bán.' :
                 'Bạn chưa có NFT nào.'}
              </p>
              <div className="filter-actions">
                <button 
                  onClick={() => setStatusFilter('all')}
                  className="filter-reset-btn"
                >
                  Xem tất cả
                </button>
                <button 
                  onClick={() => window.location.href = '/create-item'} 
                  className="create-nft-btn"
                >
                  Tạo NFT mới
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* NFT Details Modal */}
      <NFTDetailsModal
        nft={selectedNft}
        isOpen={modalOpen}
        onClose={closeModal}
      />
      
      {/* Transaction History Section */}
      <TransactionHistory />
    </div>
  );
} 