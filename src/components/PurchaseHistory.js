import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { nftaddress, nftmarketaddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';
import { WalletContext } from '../App';
import { PlaceholderService } from '../utils/placeholderService';
import LoadingSpinner from './LoadingSpinner';
import './PurchaseHistory.css';

export default function PurchaseHistory() {
  const [purchasedNFTs, setPurchasedNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { account } = useContext(WalletContext);

  useEffect(() => {
    if (account) {
      loadPurchasedNFTs();
    }
  }, [account]);

  async function loadPurchasedNFTs() {
    if (!account) return;

    try {
      setIsLoading(true);
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      const nftContract = new ethers.Contract(nftaddress, NFT.abi, signer);

      // Get purchased NFTs
      const items = await marketContract.fetchMyNFTs();
      
      const nfts = await Promise.all(items.map(async (item) => {
        try {
          const tokenUri = await nftContract.tokenURI(item.tokenId);
          
          let metadata = {};
          if (tokenUri.startsWith('data:')) {
            // Handle data URI format: data:application/json;base64,<base64data>
            if (tokenUri.includes('base64,')) {
              const base64Data = tokenUri.split('base64,')[1];
              const decodedJson = atob(base64Data);
              metadata = JSON.parse(decodedJson);
            } else {
              // Handle plain JSON data URI
              const json = tokenUri.substring(29);
              metadata = JSON.parse(json);
            }
          } else {
            const response = await fetch(tokenUri);
            metadata = await response.json();
          }

          return {
            itemId: item.itemId.toNumber(),
            tokenId: item.tokenId.toNumber(),
            seller: item.seller,
            owner: item.owner,
            price: ethers.utils.formatEther(item.price),
            name: metadata.name || `NFT #${item.tokenId}`,
            description: metadata.description || 'No description',
            image: metadata.image || PlaceholderService.getPlaceholder(item.tokenId.toNumber()),
            category: metadata.category || 'Unknown',
            sold: item.sold
          };
        } catch (error) {
          console.error('Error loading NFT metadata:', error);
          return {
            itemId: item.itemId.toNumber(),
            tokenId: item.tokenId.toNumber(),
            seller: item.seller,
            owner: item.owner,
            price: ethers.utils.formatEther(item.price),
            name: `NFT #${item.tokenId}`,
            description: 'Metadata loading failed',
            image: PlaceholderService.getErrorPlaceholder(),
            category: 'Unknown',
            sold: item.sold
          };
        }
      }));

      setPurchasedNFTs(nfts);
    } catch (error) {
      console.error('Error loading purchased NFTs:', error);
      toast.error('Lỗi tải danh sách NFT đã mua');
    } finally {
      setIsLoading(false);
    }
  }

  if (!account) {
    return (
      <div className="purchase-history-container">
        <div className="no-wallet">
          <h3>Kết nối ví để xem lịch sử mua hàng</h3>
          <p>Bạn cần kết nối ví để xem các NFT đã mua</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="purchase-history-container">
        <div className="loading-section">
          <LoadingSpinner size="large" />
          <p>Đang tải lịch sử mua hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="purchase-history-container">
      <div className="history-header">
        <div className="header-content">
          <h2 className="history-title">
            <span className="title-icon">🛒</span>
            Lịch sử mua hàng
          </h2>
          <p className="history-subtitle">
            Quản lý các NFT bạn đã mua - Giao dịch tự động ghi nhận trong MetaMask Activity
          </p>
        </div>
      </div>

      {purchasedNFTs.length === 0 ? (
        <div className="no-purchases">
          <div className="empty-state">
            <div className="empty-icon">🛍️</div>
            <h3>Chưa có NFT nào được mua</h3>
            <p>Khi bạn mua NFT, chúng sẽ xuất hiện ở đây</p>
          </div>
        </div>
      ) : (
        <div className="nft-grid">
          {purchasedNFTs.map((nft) => (
            <div key={nft.itemId} className="nft-card">
              <div className="nft-image-container">
                <img 
                  src={nft.image} 
                  alt={nft.name}
                  onError={(e) => {
                    e.target.src = PlaceholderService.getErrorPlaceholder();
                  }}
                />
              </div>
              
              <div className="nft-content">
                <h3 className="nft-name">{nft.name}</h3>
                <p className="nft-description">{nft.description}</p>
                
                <div className="nft-details">
                  <div className="detail-row">
                    <span className="detail-label">Giá mua:</span>
                    <span className="detail-value">{nft.price} ETH</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Token ID:</span>
                    <span className="detail-value">#{nft.tokenId}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Item ID:</span>
                    <span className="detail-value">#{nft.itemId}</span>
                  </div>
                </div>

                <div className="nft-status">
                  <div className="status-badge">
                    <span className="status-icon">✅</span>
                    <span>Đã mua thành công</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 