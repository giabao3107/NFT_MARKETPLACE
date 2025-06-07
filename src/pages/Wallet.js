import React, { useContext } from 'react';
import { WalletContext } from '../App';
import TransactionHistory from '../components/TransactionHistory';
import PendingWithdrawals from '../components/PendingWithdrawals';
import { UI_TEXT } from '../utils/constants';
import './Wallet.css';

export default function Wallet() {
  const { account, connectWallet, balance } = useContext(WalletContext);

  if (!window.ethereum) {
    return (
      <div className="wallet-container">
        <div className="wallet-header">
          <h1 className="wallet-title">MetaMask Required</h1>
          <p className="wallet-subtitle">Please install MetaMask to manage your wallet.</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="wallet-container">
        <div className="wallet-header">
          <h1 className="wallet-title">Kết nối ví</h1>
          <p className="wallet-subtitle">
            Kết nối ví để xem số dư, lịch sử giao dịch và rút tiền
          </p>
          <button onClick={connectWallet} className="connect-button">
            Kết nối ví
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-container">
      <div className="wallet-content">
        <div className="wallet-header">
          <h1 className="wallet-title">💳 Quản lý ví</h1>
          <p className="wallet-subtitle">
            Theo dõi số dư, giao dịch và rút tiền từ NFT marketplace
          </p>
        </div>

        {/* Wallet Info */}
        <div className="wallet-info">
          <div className="info-card">
            <div className="info-header">
              <div className="info-icon">👤</div>
              <div className="info-text">
                <h3>Địa chỉ ví</h3>
                <p className="wallet-address">{account}</p>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-header">
              <div className="info-icon">💰</div>
              <div className="info-text">
                <h3>Số dư ví</h3>
                <p className="wallet-balance">{balance || '0'} ETH</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Withdrawals */}
        <PendingWithdrawals />

        {/* Transaction History */}
        <TransactionHistory />

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>🚀 Hành động nhanh</h3>
          <div className="action-grid">
            <button 
              onClick={() => window.location.href = '/create-item'}
              className="action-button create"
            >
              <span className="action-icon">✨</span>
              <div className="action-text">
                <strong>Tạo NFT</strong>
                <small>Tạo và bán NFT mới</small>
              </div>
            </button>

            <button 
              onClick={() => window.location.href = '/'}
              className="action-button browse"
            >
              <span className="action-icon">🔍</span>
              <div className="action-text">
                <strong>Khám phá</strong>
                <small>Xem NFT marketplace</small>
              </div>
            </button>

            <button 
              onClick={() => window.location.href = '/my-nfts'}
              className="action-button collection"
            >
              <span className="action-icon">🎨</span>
              <div className="action-text">
                <strong>NFT của tôi</strong>
                <small>Quản lý bộ sưu tập</small>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 