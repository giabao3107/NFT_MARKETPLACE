import React, { useState, useEffect, useContext, useRef } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEthereum, FaFire, FaTrophy } from 'react-icons/fa';
import NFTCard from '../components/NFTCard';
import NFTDetailsModal from '../components/NFTDetailsModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { nftaddress, nftmarketaddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';
import { WalletContext } from '../App';
import { UI_TEXT, NFT_CATEGORIES, CURRENCY_RATES } from '../utils/constants';
import './Home.css';

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingState, setLoadingState] = useState('not-loaded');
  const { account, updateBalance } = useContext(WalletContext);
  const reloadTimeoutRef = useRef(null);
  const marketContractRef = useRef(null);

  const [categories, setCategories] = useState([
    UI_TEXT.CATEGORY_ALL, 
    ...NFT_CATEGORIES
  ]);
  const [selectedCategory, setSelectedCategory] = useState(UI_TEXT.CATEGORY_ALL);

  useEffect(() => {
    loadNFTs();
    
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

  // Force reload when page becomes visible (handles redirect from CreateItem)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && loadingState === 'loaded') {
        console.log('📄 Page became visible, reloading NFTs...');
        setTimeout(loadNFTs, 1000); // Small delay to ensure transactions are confirmed
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadingState]);

  const debounceReload = () => {
    // Clear any existing timeout
    if (reloadTimeoutRef.current) {
      clearTimeout(reloadTimeoutRef.current);
    }
    
    // Set new timeout
    reloadTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Debounced reload triggered');
      loadNFTs();
    }, 3000); // Wait 3 seconds before reloading
  };

  async function loadNFTs() {
    try {
      setLoadingState('loading');
      
      // Debug: Log contract addresses
      console.log('🏠 NFT Contract Address:', nftaddress);
      console.log('🏪 Marketplace Contract Address:', nftmarketaddress);
      
      // Check if we can connect to the provider
      if (!window.ethereum) {
        setLoadingState('no-metamask');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log('✅ Provider connected');
      
      // Check if we're connected to the right network
      const network = await provider.getNetwork();
      console.log('🌐 Network info:', {
        chainId: network.chainId,
        name: network.name
      });
      
      if (network.chainId !== 1337) {
        console.log('❌ Wrong network, expected 1337, got:', network.chainId);
        setLoadingState('wrong-network');
        return;
      }

      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
      const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider);

      console.log('📄 NFT Contract initialized:', tokenContract.address);
      console.log('🏪 Marketplace Contract initialized:', marketContract.address);

      // Test basic contract call first
      try {
        console.log('🧪 Testing getListingPrice...');
        const listingPrice = await marketContract.getListingPrice();
        console.log('💰 Listing Price:', ethers.utils.formatEther(listingPrice), 'ETH');
      } catch (listingError) {
        console.error('❌ getListingPrice failed:', listingError);
        throw new Error('Cannot connect to marketplace contract');
      }

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
      
      marketContract.on("MarketItemCreated", () => {
        eventCount++;
        if (eventCount <= maxEvents) {
          console.log(`📦 MarketItemCreated event detected (${eventCount}/${maxEvents})`);
          debounceReload();
        } else {
          console.log('⚠️ Too many MarketItemCreated events, ignoring...');
        }
      });

      marketContract.on("MarketItemSold", () => {
        eventCount++;
        if (eventCount <= maxEvents) {
          console.log(`💰 MarketItemSold event detected (${eventCount}/${maxEvents})`);
          debounceReload();
        } else {
          console.log('⚠️ Too many MarketItemSold events, ignoring...');
        }
      });

      // Reset event count after some time
      setTimeout(() => {
        eventCount = 0;
        console.log('🔄 Event count reset');
      }, 10000);
      */

      console.log('⚠️ Event listeners disabled for debugging');

      // Try to get market items
      console.log('🔍 Fetching market items...');
      const data = await marketContract.fetchMarketItems();
      console.log('📦 Raw market data:', data);
      
      if (data.length === 0) {
        console.log('ℹ️ No market items found');
        setNfts([]);
        setLoadingState('no-nfts');
        return;
      }
      
      console.log(`📊 Processing ${data.length} market items...`);
      const items = await Promise.all(data.map(async (i, index) => {
        try {
          console.log(`🔍 Processing item ${index + 1}/${data.length}:`, {
            itemId: i.itemId.toString(),
            tokenId: i.tokenId.toString(),
            seller: i.seller,
            owner: i.owner,
            price: ethers.utils.formatEther(i.price),
            sold: i.sold
          });
          
          const tokenUri = await tokenContract.tokenURI(i.tokenId);
          console.log(`Token ${i.tokenId} URI:`, tokenUri);
          
          let meta = {
            name: `NFT #${i.tokenId}`,
            description: 'Demo NFT for marketplace',
            image: null, // ❌ Remove default random image
            category: UI_TEXT.CATEGORY_ART // Default category, will be overridden by metadata
          };
          
          try {
            if (tokenUri.startsWith('data:application/json;base64,')) {
              console.log(`🔍 Decoding base64 metadata for token ${i.tokenId}...`);
              const base64Data = tokenUri.replace('data:application/json;base64,', '');
              console.log(`📋 Base64 data length: ${base64Data.length}`);
              
              const jsonString = decodeURIComponent(escape(atob(base64Data)));
              console.log(`📋 Decoded JSON length: ${jsonString.length}`);
              
              const parsedMeta = JSON.parse(jsonString);
              console.log(`📋 Successfully parsed metadata for token ${i.tokenId}:`, {
                name: parsedMeta.name,
                description: parsedMeta.description?.substring(0, 50) + '...',
                hasImage: !!parsedMeta.image,
                imageType: parsedMeta.image?.startsWith('data:') ? 'Data URL' : 'URL',
                imageLength: parsedMeta.image?.length || 0,
                category: parsedMeta.category
              });
              
              // Merge metadata - this should override default values including image
              meta = { ...meta, ...parsedMeta };
              console.log(`✅ Metadata merged for token ${i.tokenId}. Image available: ${!!meta.image}`);
              
            } else if (tokenUri.startsWith('http')) {
              console.log(`🌐 Fetching HTTP metadata for token ${i.tokenId}:`, tokenUri);
              const response = await axios.get(tokenUri);
              console.log(`📋 HTTP metadata for token ${i.tokenId}:`, response.data);
              meta = { ...meta, ...response.data };
            } else {
              console.warn(`⚠️ Unknown tokenURI format for token ${i.tokenId}:`, tokenUri.substring(0, 100));
            }
            
            // Handle different image URL formats
            if (meta.image) {
              if (meta.image.startsWith('ipfs://')) {
              const ipfsHash = meta.image.replace('ipfs://', '');
              meta.image = `https://ipfs.io/ipfs/${ipfsHash}`;
            }
              // Data URLs are already valid and don't need processing
              else if (meta.image.startsWith('data:')) {
                // Keep data URL as is - this is the actual uploaded image
                console.log(`🖼️ Using data URL for token ${i.tokenId} (size: ${meta.image.length} chars)`);
              }
            }
            
                      // Ensure we have an image - add fallback if missing
          if (!meta.image) {
            meta.image = `https://via.placeholder.com/400x400/333333/ffffff?text=NFT+%23${i.tokenId}`;
            console.log('🔄 No image found, using placeholder for token', i.tokenId);
          }
          
          // Log final image URL for debugging
          console.log(`🖼️ Final image URL for token ${i.tokenId}:`, 
            meta.image?.startsWith('data:') ? `Data URL (${meta.image.length} chars)` : meta.image);
            
          } catch (metaError) {
            console.error('❌ Could not fetch metadata for token', i.tokenId, ':', metaError);
            // Only use fallback image if we couldn't get metadata AND there's no image
            if (!meta.image) {
              meta.image = `https://via.placeholder.com/400x400/333333/ffffff?text=NFT+%23${i.tokenId}`;
              console.log('🔄 Using placeholder image for token', i.tokenId);
            }
          }

          let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
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
          };
          console.log(`✅ Item ${index + 1} processed:`, item);
          return item;
        } catch (itemError) {
          console.error(`❌ Error processing item ${i.itemId}:`, itemError);
          return null; // Return null for failed items
        }
      }));
      
      // Filter out null items (failed to process)
      const validItems = items.filter(item => item !== null);
      console.log(`📋 Valid items after processing: ${validItems.length}/${items.length}`);
      setNfts(validItems);
      
              // No longer need heroNft since we're using featured grid
        // Remove heroNft related code
      
      setLoadingState('loaded');
    } catch (error) {
      console.error('❌ Error loading NFTs:', error);
      
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
  }

  async function buyNft(nft) {
    if (!window.ethereum) {
      toast.error('Vui lòng cài đặt MetaMask!');
      return;
    }

    if (!account) {
      toast.error('Vui lòng kết nối ví trước!');
      return;
    }

    // Validate NFT data
    if (!nft || !nft.itemId || !nft.price || !nft.seller) {
      toast.error('Dữ liệu NFT không hợp lệ');
      console.error('Invalid NFT data:', nft);
      return;
    }

    console.log('🛒 Starting NFT purchase process...');
    console.log('💰 NFT Details:', {
      itemId: nft.itemId,
      tokenId: nft.tokenId,
      name: nft.name,
      price: nft.price,
      seller: nft.seller,
      buyer: account
    });

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Check network first
      const network = await provider.getNetwork();
      console.log('🌐 Current network for purchase:', {
        chainId: network.chainId,
        name: network.name
      });
      
      if (network.chainId !== 1337) {
        toast.error('Vui lòng chuyển về mạng Hardhat Local (Chain ID: 1337)');
        return;
      }
      
      const signer = provider.getSigner();
      
      // Check signer address
      const signerAddress = await signer.getAddress();
      console.log('👛 Signer address:', signerAddress);
      console.log('👛 Account from context:', account);
      
      if (signerAddress.toLowerCase() !== account.toLowerCase()) {
        throw new Error('Signer address mismatch with connected account');
      }
      
      // Check balance
      const balance = await signer.getBalance();
      console.log('💰 Buyer balance:', ethers.utils.formatEther(balance), 'ETH');
      
      const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
      
      console.log('📋 Contract setup:', {
        contractAddress: nftmarketaddress,
        nftAddress: nftaddress,
        itemId: nft.itemId,
        priceWei: price.toString(),
        signerAddress: await signer.getAddress()
      });
      
      console.log('💰 Purchase details:');
      console.log('  - NFT Price:', nft.price, 'ETH');
      console.log('  - Price in Wei:', price.toString());
      console.log('  - Marketplace fee will be deducted from seller payment');
      
      // Check if buyer has enough funds
      if (balance.lt(price)) {
        throw new Error(`Insufficient funds. Need ${nft.price} ETH, have ${ethers.utils.formatEther(balance)} ETH`);
      }
      
      // Get listing price
      console.log('🧪 Getting listing price...');
      const listingPrice = await contract.getListingPrice();
      const listingPriceEth = ethers.utils.formatEther(listingPrice);
      console.log('📋 Marketplace fee:', listingPriceEth, 'ETH');
      console.log('💵 Seller will receive:', (parseFloat(nft.price) - parseFloat(listingPriceEth)).toFixed(4), 'ETH');
      
      // Check if price is sufficient
      if (parseFloat(nft.price) < parseFloat(listingPriceEth)) {
        throw new Error(`NFT price too low. Price: ${nft.price} ETH, Required minimum: ${listingPriceEth} ETH`);
      }
      
      // Check if it's the seller trying to buy their own NFT
      if (account.toLowerCase() === nft.seller.toLowerCase()) {
        throw new Error('You cannot buy your own NFT');
      }
      
      console.log('📤 Sending transaction...');
      toast.info(`Mua NFT: ${nft.name} với giá ${nft.price} ETH...`);
      
      // Get seller balance before purchase
      const sellerBalanceBefore = await provider.getBalance(nft.seller);
      console.log('💰 Seller balance before purchase:', ethers.utils.formatEther(sellerBalanceBefore), 'ETH');
      
      // Execute the purchase with higher gas limit using the new buyNFT function
      const transaction = await contract.buyNFT(nftaddress, nft.itemId, {
        value: price,
        gasLimit: 500000 // Increased gas limit for marketplace sale
      });
      
      // Log transaction details for debugging
      console.log('📤 Transaction details:', {
        to: transaction.to,
        value: ethers.utils.formatEther(transaction.value || '0'),
        gasLimit: transaction.gasLimit?.toString(),
        gasPrice: transaction.gasPrice?.toString()
      });
      
      console.log('✅ Transaction sent:', transaction.hash);
      toast.info('Giao dịch đã gửi! Đang chờ xác nhận...');
      
      // Show immediate notification to seller about incoming payment
      if (window.ethereum && nft.seller.toLowerCase() !== account.toLowerCase()) {
        // This could be enhanced to show notification to seller if they're online
        console.log(`💰 Payment will be sent to seller: ${nft.seller}`);
      }
      
      // Wait for confirmation
      const receipt = await transaction.wait();
      console.log('✅ Transaction confirmed:', receipt);
      
      // Check seller balance after purchase
      const sellerBalanceAfter = await provider.getBalance(nft.seller);
      console.log('💰 Seller balance after purchase:', ethers.utils.formatEther(sellerBalanceAfter), 'ETH');
      
        // Calculate actual seller payment (NFT price - marketplace fee)
        const finalListingPrice = await contract.getListingPrice();
        const finalListingPriceEth = ethers.utils.formatEther(finalListingPrice);
        const nftPriceFloat = parseFloat(nft.price);
        const finalListingPriceFloat = parseFloat(finalListingPriceEth);
        const actualSellerPayment = nftPriceFloat - finalListingPriceFloat;
        
        console.log('🔍 DEBUG PAYMENT CALCULATION:');
        console.log('💵 NFT Price (string):', nft.price);
        console.log('💵 NFT Price (float):', nftPriceFloat);
        console.log('🏪 Marketplace Fee (wei):', finalListingPrice.toString());
        console.log('🏪 Marketplace Fee (ETH string):', finalListingPriceEth);
        console.log('🏪 Marketplace Fee (float):', finalListingPriceFloat);
        console.log('🧮 Calculation:', nftPriceFloat, '-', finalListingPriceFloat, '=', actualSellerPayment);
        console.log('💵 Seller payment received:', actualSellerPayment.toFixed(4), 'ETH');
      
      // Check transaction status
      if (receipt.status === 1) {
        console.log('🎉 Purchase successful!');
        
        // Add buy NFT activity to localStorage for MetaMask tracking
        const uniqueTimestamp = Date.now();
        const buyActivity = {
          type: 'BUY_NFT',
          txHash: receipt.transactionHash,
          timestamp: uniqueTimestamp,
          tokenId: nft.tokenId,
          itemId: nft.itemId,
          name: nft.name,
          price: nft.price,
          seller: nft.seller,
          buyer: account,
          status: 'success',
          id: `buy-${receipt.transactionHash}-${uniqueTimestamp}` // Unique ID
        };
        
        // Save to localStorage for activity tracking
        const existingActivity = JSON.parse(localStorage.getItem('nft_activity') || '[]');
        
        // Check for duplicates before adding
        const isDuplicate = existingActivity.some(activity => 
          activity.txHash === buyActivity.txHash && 
          activity.type === 'BUY_NFT' && 
          activity.buyer === buyActivity.buyer
        );
        
        if (!isDuplicate) {
          existingActivity.unshift(buyActivity);
          localStorage.setItem('nft_activity', JSON.stringify(existingActivity.slice(0, 50)));
          console.log('📝 Buy NFT activity saved:', buyActivity);
          
          // Trigger custom event to notify other components
          window.dispatchEvent(new CustomEvent('nftActivityUpdated', { 
            detail: { activity: buyActivity } 
          }));
          
          // Trigger custom event to notify other components
          window.dispatchEvent(new CustomEvent('nftActivityUpdated', { 
            detail: { activity: buyActivity } 
          }));
        } else {
          console.log('⚠️ Duplicate buy activity detected, skipping save');
        }
        
        // Check if seller received payment
        if (actualSellerPayment > 0) {
          console.log('✅ Seller payment successful!');
          toast.success(
            `🎉 Mua NFT thành công!\n💵 Giá NFT: ${nft.price} ETH\n🏪 Phí sàn: ${finalListingPriceEth} ETH\n💰 Người bán nhận: ${actualSellerPayment.toFixed(4)} ETH`,
            { autoClose: 6000 }
          );
        } else if (actualSellerPayment === 0) {
          console.log('⚠️ Seller receives 0 ETH (price equals listing fee)');
          toast.warning(
            `🎉 Mua NFT thành công!\n💵 Giá NFT: ${nft.price} ETH\n🏪 Phí sàn: ${finalListingPriceEth} ETH\n⚠️ Người bán nhận: 0 ETH (giá bằng phí sàn)`,
            { autoClose: 6000 }
          );
        } else {
          console.log('⚠️ Seller payment calculation error - negative amount:', actualSellerPayment);
          toast.error(
            `❌ Lỗi: Giá NFT (${nft.price} ETH) thấp hơn phí sàn (${finalListingPriceEth} ETH)!\nKhông thể hoàn thành giao dịch.`
          );
        }
        
        // Update balance in context
        await updateBalance();
        
        // Close modal if open
        if (showModal) {
          closeModal();
        }
        
        // Manual reload instead of using events
        console.log('🔄 Manually reloading NFTs...');
        setTimeout(() => {
          loadNFTs();
        }, 3000);
        
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('❌ Error buying NFT:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        data: error.data,
        reason: error.reason
      });
      
      if (error.code === 4001) {
        toast.error('Giao dịch bị từ chối bởi người dùng');
      } else if (error.code === -32603) {
        toast.error('Lỗi RPC nội bộ - vui lòng thử lại');
        console.error('MetaMask RPC Error:', error);
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Không đủ ETH để mua NFT này');
      } else if (error.message.includes('You cannot buy your own NFT')) {
        toast.error('Bạn không thể mua NFT của chính mình');
      } else if (error.message.includes('execution reverted')) {
        toast.error('Giao dịch thất bại - lỗi contract');
        console.error('Contract error:', error.data || error.message);
      } else if (error.message.includes('nonce too high') || error.message.includes('nonce')) {
        toast.error('Lỗi nonce - vui lòng reset MetaMask account');
      } else if (error.message.includes('gas')) {
        toast.error('Lỗi gas - vui lòng thử lại với gas cao hơn');
      } else {
        toast.error('Lỗi: ' + (error.message || 'Lỗi không xác định'));
      }
    }
  }

  const handleViewNft = (nft) => {
    setSelectedNFT(nft);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNFT(null);
  };

  const handleRefresh = () => {
    setLoadingState('loading');
    loadNFTs();
  };

  const formatCurrency = (ethAmount) => {
    const usdValue = (parseFloat(ethAmount) * CURRENCY_RATES.USD_PER_ETH).toLocaleString();
    const vndValue = (parseFloat(ethAmount) * CURRENCY_RATES.VND_PER_ETH).toLocaleString();
    return { usd: usdValue, vnd: vndValue };
  };

  // Loading state
  if (loadingState === 'loading') {
    return (
      <div className="home-container">
        <div className="hero-section-loading">
          <div className="loading-hero-content">
            <div className="loading-badge">
              <span className="badge-icon">🎨</span>
              <span className="badge-text">NFT Marketplace Platform</span>
            </div>
            
            <h1 className="loading-title">
              Đang tải NFT Marketplace
              <span className="loading-dots">...</span>
            </h1>
            
            <p className="loading-subtitle">
              Vui lòng chờ trong khi chúng tôi tải dữ liệu từ blockchain
            </p>
            
            {account && (
              <div className="connected-info">
                <span className="connected-icon">✅</span>
                Đã kết nối: {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            )}
          </div>
        </div>
        
        <div className="marketplace-section-loading">
          <div className="loading-content">
            <LoadingSpinner size="large" />
            <div className="loading-features">
              <div className="loading-feature">
                <span className="feature-icon">🔍</span>
                <span>Quét smart contract</span>
              </div>
              <div className="loading-feature">
                <span className="feature-icon">📦</span>
                <span>Tải metadata NFT</span>
              </div>
              <div className="loading-feature">
                <span className="feature-icon">💰</span>
                <span>Lấy thông tin giá</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No MetaMask
  if (loadingState === 'no-metamask') {
    return (
      <div className="home-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">NFT Marketplace</h1>
            <p className="hero-subtitle">
              Create, collect, and trade unique digital assets
            </p>
          </div>
        </div>
        
        <div className="marketplace-section">
          <div className="error-state">
            <h2>MetaMask Required</h2>
            <p>Please install MetaMask to use this marketplace</p>
          </div>
        </div>
      </div>
    );
  }

  // Wrong network
  if (loadingState === 'wrong-network') {
    return (
      <div className="home-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">NFT Marketplace</h1>
            <p className="hero-subtitle">
              Create, collect, and trade unique digital assets
            </p>
            {account && (
              <div style={{ marginTop: '1rem', opacity: 0.8 }}>
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            )}
          </div>
        </div>
        
        <div className="marketplace-section">
          <div className="error-state">
            <h2>Wrong Network</h2>
            <p>Please switch to Hardhat Local Network (Chain ID: 1337)</p>
            <button onClick={loadNFTs}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  // Network/Contract errors
  if (loadingState === 'network-error' || loadingState === 'contract-error' || loadingState === 'error') {
    return (
      <div className="home-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">NFT Marketplace</h1>
            <p className="hero-subtitle">
              Create, collect, and trade unique digital assets
            </p>
            {account && (
              <div style={{ marginTop: '1rem', opacity: 0.8 }}>
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            )}
          </div>
        </div>
        
        <div className="marketplace-section">
          <div className="error-state">
            <h2>Connection Error</h2>
            <p>
              {loadingState === 'network-error' ? 'Network connection failed' :
               loadingState === 'contract-error' ? 'Contract connection failed' :
               'Unable to load marketplace data'}
            </p>
            <p>Make sure Hardhat node is running and contracts are deployed</p>
            <button onClick={loadNFTs}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  // No NFTs available
  if (loadingState === 'no-nfts') {
    return (
      <div className="home-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">NFT Marketplace</h1>
            <p className="hero-subtitle">
              Create, collect, and trade unique digital assets
            </p>
            {account && (
              <div style={{ marginTop: '1rem', opacity: 0.8 }}>
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            )}
          </div>
        </div>
        
        <div className="marketplace-section">
          <div className="section-header">
            <h2 className="section-title">NFT Marketplace</h2>
            <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
              0 items available
            </div>
          </div>
          
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
                    <div className="plus-icon">
                      <span>+</span>
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
                🎨 {UI_TEXT.HOME_EMPTY_TITLE}
              </h2>
              <p className="empty-description">
                {UI_TEXT.HOME_EMPTY_SUBTITLE}
              </p>
              
              {/* Feature highlights */}
              <div className="empty-features">
                <div className="feature-item">
                  <span className="feature-icon">🚀</span>
                  <span className="feature-text">Tạo NFT miễn phí</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💎</span>
                  <span className="feature-text">Bán với giá tùy ý</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🌟</span>
                  <span className="feature-text">Được hiển thị ngay</span>
                </div>
              </div>

              {/* Action buttons */}
              {account ? (
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
              ) : (
                <div className="empty-actions">
                  <div className="wallet-prompt">
                    <p>Kết nối ví để bắt đầu tạo NFT</p>
                    <div className="wallet-features">
                      <span>🔐 An toàn</span>
                      <span>⚡ Nhanh chóng</span>
                      <span>💝 Miễn phí</span>
                    </div>
                  </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalNFTs = nfts.length;
  const avgPrice = nfts.length > 0 ? (nfts.reduce((sum, nft) => sum + parseFloat(nft.price), 0) / nfts.length).toFixed(3) : '0.000';
  const lowestPrice = nfts.length > 0 ? Math.min(...nfts.map(nft => parseFloat(nft.price))).toFixed(3) : '0.000';
  const highestPrice = nfts.length > 0 ? Math.max(...nfts.map(nft => parseFloat(nft.price))).toFixed(3) : '0.000';
  
  // Calculate unique sellers
  const uniqueSellers = nfts.length > 0 ? new Set(nfts.map(nft => nft.seller)).size : 0;

  // Filter NFTs by selected category
  const filteredNfts = selectedCategory === UI_TEXT.CATEGORY_ALL 
    ? nfts 
    : nfts.filter(nft => nft.category === selectedCategory);

  // Success state with NFTs
  return (
    <div className="home-container">
      {/* Modern Hero Section */}
      <div className="hero-section-new">
        <div className="hero-background-gradient">
          <div className="floating-elements">
            <div className="floating-nft floating-nft-1">🎨</div>
            <div className="floating-nft floating-nft-2">🖼️</div>
            <div className="floating-nft floating-nft-3">💎</div>
            <div className="floating-nft floating-nft-4">🎭</div>
            <div className="floating-nft floating-nft-5">🚀</div>
            <div className="floating-nft floating-nft-6">⭐</div>
          </div>
        </div>
        
        <div className="hero-content-new">
          <div className="hero-left">
            <div className="hero-badge-new">
              <span className="badge-icon">🎨</span>
              <span className="badge-text">NFT Marketplace Platform</span>
              <span className="badge-status">✨ Mới</span>
            </div>
            
            <h1 className="hero-title-new">
              Khám phá, sưu tầm và 
              <span className="title-highlight"> giao dịch NFT</span> 
              độc đáo
            </h1>
            
            <p className="hero-description-new">
              Tham gia thế giới nghệ thuật số với hàng nghìn tác phẩm NFT đặc biệt. 
              Tạo, mua bán và sở hữu những tài sản kỹ thuật số có giá trị.
            </p>
            
            <div className="hero-stats-new">
              <div className="stat-card-new">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <span className="stat-number">{totalNFTs}</span>
                  <span className="stat-label">NFT Đang Bán</span>
                </div>
              </div>
              <div className="stat-card-new">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <span className="stat-number">{uniqueSellers}</span>
                  <span className="stat-label">Người Bán</span>
                </div>
              </div>
              <div className="stat-card-new">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <span className="stat-number">{avgPrice}</span>
                  <span className="stat-label">ETH Trung Bình</span>
                </div>
        </div>
      </div>
      
            <div className="hero-actions-new">
            <button 
                onClick={() => window.location.href = '/create-item'}
                className="btn-primary-new"
            >
                <span className="btn-icon">✨</span>
                Tạo NFT
            </button>
              <button 
                onClick={() => document.querySelector('.marketplace-section-new').scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary-new"
              >
                <span className="btn-icon">🔍</span>
                Khám Phá Ngay
              </button>
            </div>
          </div>


        </div>
      </div>

      {/* Marketplace Section */}
      <div className="marketplace-section-new">
        <div className="section-header-new">
          <div className="header-left">
            <h2 className="section-title-new">🏪 Khám Phá NFT</h2>
            <p className="section-subtitle">Tìm kiếm và mua những tác phẩm nghệ thuật số độc đáo</p>
          </div>
          <div className="header-right">
            <button onClick={handleRefresh} className="refresh-btn-new">
              <span className="refresh-icon">🔄</span>
              Làm mới
            </button>
          </div>
        </div>

        {/* Enhanced Category Filters */}
        <div className="category-filters-new">
          <div className="filter-container">
            <span className="filter-label">🎯 Danh mục:</span>
            <div className="filter-buttons">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`category-btn-new ${selectedCategory === category ? 'active' : ''}`}
                >
                  {category === UI_TEXT.CATEGORY_ALL ? '🌟 Tất cả' : 
                   category === UI_TEXT.CATEGORY_ART ? '🎨 Nghệ thuật' :
                   category === UI_TEXT.CATEGORY_MUSIC ? '🎵 Âm nhạc' :
                   category === UI_TEXT.CATEGORY_GAMING ? '🎮 Game' :
                   category === UI_TEXT.CATEGORY_SPORTS ? '⚽ Thể thao' :
                   category === UI_TEXT.CATEGORY_PHOTOGRAPHY ? '📸 Nhiếp ảnh' :
                   category}
                  {selectedCategory === category && filteredNfts.length > 0 && (
                    <span className="count-badge">{filteredNfts.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* NFT Grid */}
        <div className="nft-grid-new">
          {filteredNfts.map((nft, index) => (
            <div key={`collection-${nft.itemId}-${nft.tokenId}`} className="nft-grid-item">
            <NFTCard
              nft={nft}
                onBuy={buyNft}
                onView={handleViewNft}
              showBuyButton={account && account.toLowerCase() !== nft.seller.toLowerCase()}
            />
            </div>
          ))}
        </div>

        {/* Empty category state */}
        {filteredNfts.length === 0 && selectedCategory !== UI_TEXT.CATEGORY_ALL && (
          <div className="empty-category-new">
            <div className="empty-icon">📭</div>
            <h3>Chưa có NFT nào trong "{selectedCategory}"</h3>
            <p>Hãy thử chọn danh mục khác hoặc tạo NFT đầu tiên cho danh mục này!</p>
            <div className="empty-actions">
              <button 
                onClick={() => setSelectedCategory(UI_TEXT.CATEGORY_ALL)}
                className="btn-outline"
              >
                Xem tất cả
              </button>
              <button 
                onClick={() => window.location.href = '/create-item'}
                className="btn-primary"
              >
                Tạo NFT mới
              </button>
            </div>
          </div>
        )}
      </div>

      {/* NFT Details Modal */}
      <NFTDetailsModal
        nft={selectedNFT}
        isOpen={showModal}
        onClose={closeModal}
        onBuy={buyNft}
      />
    </div>
  );
} 