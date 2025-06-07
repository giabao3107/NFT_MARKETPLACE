import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { MetaMaskHelpers } from '../utils/metamaskHelpers';
import './TransactionInfo.css';

export default function TransactionInfo({ isVisible, onClose }) {
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    if (isVisible) {
      loadRecentTransactions();
    }
  }, [isVisible]);

  const loadRecentTransactions = () => {
    try {
      // Get recent NFT activities from localStorage
      const activities = JSON.parse(localStorage.getItem('nft_activity') || '[]');
      
      // Get enhanced transaction info
      const enhancedTransactions = activities.slice(0, 10).map(activity => {
        const storedInfo = MetaMaskHelpers.getStoredTransactionInfo(activity.txHash);
        return {
          ...activity,
          enhancedInfo: storedInfo,
          displayName: MetaMaskHelpers.getTransactionDescription(storedInfo?.data || ''),
          timeAgo: getTimeAgo(activity.timestamp)
        };
      });

      setRecentTransactions(enhancedTransactions);
    } catch (error) {
      console.error('Error loading recent transactions:', error);
    }
  };

  const getTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return 'Vừa xong';
  };

  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'BUY_NFT': return '🛒';
      case 'CLAIM_PAYMENT': return '💰';
      case 'CREATE_TOKEN': return '🔨';
      case 'CREATE_MARKET_ITEM': return '🏪';
      default: return '📄';
    }
  };

  const getTransactionTypeName = (type) => {
    switch (type) {
      case 'BUY_NFT': return 'Mua NFT';
      case 'CLAIM_PAYMENT': return 'Nhận tiền';
      case 'CREATE_TOKEN': return 'Tạo NFT';
      case 'CREATE_MARKET_ITEM': return 'Đăng bán NFT';
      default: return 'Giao dịch';
    }
  };

  const openInEtherscan = (txHash) => {
    // For local development, just copy to clipboard
    navigator.clipboard.writeText(txHash);
    alert(`Transaction hash copied: ${txHash}`);
  };

  if (!isVisible) return null;

  return (
    <div className="transaction-info-overlay">
      <div className="transaction-info-modal">
        <div className="transaction-header">
          <h3>📱 Lịch sử giao dịch NFT</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="transaction-content">
          <div className="info-section">
            <h4>💡 Về MetaMask Activity</h4>
            <p>
              MetaMask hiển thị tất cả giao dịch smart contract dưới dạng "Contract Interaction". 
              Đây là behavior chuẩn và hoàn toàn bình thường.
            </p>
          </div>

          <div className="transactions-list">
            <h4>📋 Giao dịch gần đây</h4>
            {recentTransactions.length === 0 ? (
              <div className="no-transactions">
                <p>Chưa có giao dịch nào</p>
              </div>
            ) : (
              recentTransactions.map((tx, index) => (
                <div key={index} className="transaction-item">
                  <div className="tx-icon">
                    {getTransactionTypeIcon(tx.type)}
                  </div>
                  <div className="tx-details">
                    <div className="tx-type">
                      {getTransactionTypeName(tx.type)}
                    </div>
                    <div className="tx-name">{tx.name}</div>
                    <div className="tx-meta">
                      <span className="tx-time">{tx.timeAgo}</span>
                      {tx.price && <span className="tx-price">{tx.price} ETH</span>}
                    </div>
                  </div>
                  <div className="tx-actions">
                    <button 
                      className="tx-hash-btn"
                      onClick={() => openInEtherscan(tx.txHash)}
                      title="Copy transaction hash"
                    >
                      📋
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="info-section">
            <h4>🔍 Cách kiểm tra trong MetaMask</h4>
            <ol>
              <li>Mở MetaMask Extension</li>
              <li>Vào tab "Activity"</li>
              <li>Tìm "Contract Interaction" với thời gian tương ứng</li>
              <li>Click để xem chi tiết transaction</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 