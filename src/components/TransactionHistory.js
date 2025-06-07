import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { nftmarketaddress } from '../config';
import Market from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';
import { WalletContext } from '../App';
import './TransactionHistory.css';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { account } = useContext(WalletContext);

  useEffect(() => {
    if (account) {
      loadTransactionHistory();
    }
  }, [account]);

  // Listen for storage changes and custom events to auto-reload when new activities are added
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'nft_activity' && account) {
        console.log('🔄 NFT activity changed via storage, reloading transaction history...');
        setTimeout(() => loadTransactionHistory(), 100);
      }
    };

    const handleActivityUpdate = (e) => {
      if (account) {
        console.log('🔄 NFT activity updated via event, reloading transaction history...');
        setTimeout(() => loadTransactionHistory(), 100);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('nftActivityUpdated', handleActivityUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('nftActivityUpdated', handleActivityUpdate);
    };
  }, [account]);

  async function loadTransactionHistory() {
    if (!account || !window.ethereum) return;

    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(nftmarketaddress, Market.abi, provider);

      // Get all events related to this account
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000); // Last ~10k blocks

      console.log('🔍 Loading transaction history for:', account);

      // Get seller payment events
      const sellerPaidFilter = contract.filters.SellerPaid(account);
      const sellerPaidEvents = await contract.queryFilter(sellerPaidFilter, fromBlock);

      // Get marketplace fee events (if this account is marketplace owner)
      const feeFilter = contract.filters.MarketplaceFeeCollected(account);
      const feeEvents = await contract.queryFilter(feeFilter, fromBlock);

      // Get market item sold events where this account was the seller
      const soldFilter = contract.filters.MarketItemSold();
      const soldEvents = await contract.queryFilter(soldFilter, fromBlock);
      const mySoldEvents = soldEvents.filter(event => 
        event.args.seller.toLowerCase() === account.toLowerCase()
      );

      // Combine and format transactions
      const allTransactions = [];

      // Add seller payments
      for (const event of sellerPaidEvents) {
        const block = await provider.getBlock(event.blockNumber);
        allTransactions.push({
          id: `seller-${event.transactionHash}-${event.logIndex}`,
          type: 'seller_payment',
          amount: ethers.utils.formatEther(event.args.amount),
          itemId: event.args.itemId.toString(),
          timestamp: block.timestamp,
          txHash: event.transactionHash,
          description: 'Nhận tiền bán NFT'
        });
      }

      // Add marketplace fees
      for (const event of feeEvents) {
        const block = await provider.getBlock(event.blockNumber);
        allTransactions.push({
          id: `fee-${event.transactionHash}-${event.logIndex}`,
          type: 'marketplace_fee',
          amount: ethers.utils.formatEther(event.args.fee),
          itemId: event.args.itemId.toString(),
          timestamp: block.timestamp,
          txHash: event.transactionHash,
          description: 'Phí marketplace'
        });
      }

      // Get activities from localStorage (create token, create market item, buy nft)
      const localActivities = JSON.parse(localStorage.getItem('nft_activity') || '[]');
      console.log('📋 All localStorage activities:', localActivities);
      console.log('👛 Current account:', account);
      
      const userActivities = localActivities.filter(activity => {
        // For BUY_NFT, filter by buyer
        if (activity.type === 'BUY_NFT') {
          const isBuyer = activity.buyer && activity.buyer.toLowerCase() === account.toLowerCase();
          console.log(`🛒 Buy NFT activity ${activity.id || activity.txHash}: buyer=${activity.buyer}, current=${account}, match=${isBuyer}`);
          return isBuyer;
        }
        // For CREATE_TOKEN and CREATE_MARKET_ITEM, filter by address (creator)
        const isCreator = activity.address && activity.address.toLowerCase() === account.toLowerCase();
        console.log(`🎨 Create activity ${activity.id || activity.txHash}: creator=${activity.address}, current=${account}, match=${isCreator}`);
        return isCreator;
      });
      
      console.log('📝 Filtered user activities:', userActivities);

      // Add local activities to transactions
      for (const activity of userActivities) {
        if (activity.type === 'CREATE_TOKEN') {
          allTransactions.push({
            id: `create-token-${activity.txHash}`,
            type: 'create_token',
            amount: '0',
            itemId: activity.tokenId?.toString() || 'Unknown',
            timestamp: Math.floor(activity.timestamp / 1000),
            txHash: activity.txHash,
            description: `Tạo NFT: ${activity.name || 'Unnamed'}`
          });
        } else if (activity.type === 'CREATE_MARKET_ITEM') {
          allTransactions.push({
            id: `create-market-${activity.txHash}`,
            type: 'create_market',
            amount: activity.price || '0',
            itemId: activity.tokenId?.toString() || 'Unknown',
            timestamp: Math.floor(activity.timestamp / 1000),
            txHash: activity.txHash,
            description: `Đăng bán NFT: ${activity.name || 'Unnamed'}`
          });
        } else if (activity.type === 'BUY_NFT') {
          allTransactions.push({
            id: `buy-nft-${activity.txHash}-${activity.timestamp}`,
            type: 'buy_nft',
            amount: activity.price || '0',
            itemId: activity.tokenId?.toString() || 'Unknown',
            timestamp: Math.floor(activity.timestamp / 1000),
            txHash: activity.txHash,
            description: `Mua NFT: ${activity.name || 'Unnamed'}`
          });
        }
      }

      // Sort by timestamp (newest first)
      allTransactions.sort((a, b) => b.timestamp - a.timestamp);

      setTransactions(allTransactions);
      console.log('📋 Loaded transaction history:', allTransactions);

    } catch (error) {
      console.error('❌ Error loading transaction history:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString('vi-VN');
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'seller_payment':
        return '💰';
      case 'marketplace_fee':
        return '💼';
      case 'create_token':
        return '🎨';
      case 'create_market':
        return '🏪';
      case 'buy_nft':
        return '🛒';
      default:
        return '📄';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'seller_payment':
        return '#10b981'; // Green for income
      case 'marketplace_fee':
        return '#3b82f6'; // Blue for fees
      case 'create_token':
        return '#8b5cf6'; // Purple for creation
      case 'create_market':
        return '#f59e0b'; // Orange for listing
      case 'buy_nft':
        return '#ef4444'; // Red for purchase (expense)
      default:
        return '#6b7280';
    }
  };

  if (!account) {
    return (
      <div className="transaction-history">
        <p>Vui lòng kết nối ví để xem lịch sử giao dịch</p>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <div className="history-header">
        <h3>Lịch sử giao dịch NFT</h3>
        <button onClick={loadTransactionHistory} disabled={loading}>
          {loading ? '🔄' : '↻'} Làm mới
        </button>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải lịch sử giao dịch...</p>
        </div>
      )}

      {!loading && transactions.length === 0 && (
        <div className="empty-state">
          <p>Chưa có giao dịch NFT nào</p>
        </div>
      )}

      {!loading && transactions.length > 0 && (
        <div className="transactions-list">
          {transactions.map((tx) => (
            <div key={tx.id} className="transaction-item">
              <div className="tx-icon">
                {getTransactionIcon(tx.type)}
              </div>
              
              <div className="tx-details">
                <div className="tx-description">{tx.description}</div>
                <div className="tx-meta">
                  <span className="tx-date">{formatDate(tx.timestamp)}</span>
                  <span className="tx-item">NFT #{tx.itemId}</span>
                </div>
              </div>
              
              <div className="tx-amount" style={{ color: getTransactionColor(tx.type) }}>
                {tx.type === 'buy_nft' ? '-' : '+'}{tx.amount} ETH
              </div>
              
              <div className="tx-hash">
                <a 
                  href={`https://etherscan.io/tx/${tx.txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="Xem trên Etherscan"
                >
                  🔗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 