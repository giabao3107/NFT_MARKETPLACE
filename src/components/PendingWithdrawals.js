import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { nftmarketaddress } from '../config';
import Market from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';
import { WalletContext } from '../App';

import LoadingSpinner from './LoadingSpinner';
import './PendingWithdrawals.css';

export default function PendingWithdrawals() {
  const [pendingAmount, setPendingAmount] = useState('0');
  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const { account, updateBalance } = useContext(WalletContext);

  useEffect(() => {
    if (account) {
      loadPendingWithdrawals();
    }
  }, [account]);

  async function loadPendingWithdrawals() {
    if (!account || !window.ethereum) return;

    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(nftmarketaddress, Market.abi, provider);
      
      const pending = await contract.getPendingWithdrawal(account);
      setPendingAmount(ethers.utils.formatEther(pending));
      
      console.log('💰 Pending withdrawals:', ethers.utils.formatEther(pending), 'ETH');
    } catch (error) {
      console.error('❌ Error loading pending withdrawals:', error);
    } finally {
      setLoading(false);
    }
  }



  async function claimPayment() {
    if (!account || !window.ethereum) {
      toast.error('Vui lòng kết nối ví!');
      return;
    }

    if (parseFloat(pendingAmount) <= 0) {
      toast.error('Không có tiền để nhận!');
      return;
    }

    setWithdrawing(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

      console.log('💰 Claiming payment:', pendingAmount, 'ETH');
      toast.info(`Đang nhận tiền ${pendingAmount} ETH...`);

      // Get contract interface to encode function call with custom data
      const contractInterface = new ethers.utils.Interface(Market.abi);
      const encodedData = contractInterface.encodeFunctionData('claimPayment', []);
      
      // Create transaction with custom description in data
      const transaction = await signer.sendTransaction({
        to: nftmarketaddress,
        data: encodedData,
        gasLimit: 300000,
        // Note: MetaMask will still show +0 ETH but transaction will work correctly
      });

      console.log('✅ Payment claim transaction sent:', transaction.hash);
      toast.info('Giao dịch nhận tiền đã gửi! Đang chờ xác nhận...');

      const receipt = await transaction.wait();
      console.log('✅ Payment claim confirmed:', receipt);

      if (receipt.status === 1) {
        // Show detailed success message with amount received
        toast.success(
          `🎉 Nhận tiền thành công!\n💰 Đã nhận: ${pendingAmount} ETH\n📱 MetaMask sẽ hiển thị "Claim Payment +0 ETH" (bình thường)\n💳 Số dư ví đã được cộng ${pendingAmount} ETH`,
          { autoClose: 8000 }
        );
        
        // Update balance and reload pending withdrawals
        await updateBalance();
        await loadPendingWithdrawals();
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error) {
      console.error('❌ Error claiming payment:', error);
      
      if (error.code === 4001) {
        toast.error('Giao dịch bị từ chối bởi người dùng');
      } else if (error.message.includes('No payment to claim')) {
        toast.error('Không có tiền để nhận');
      } else {
        toast.error('Lỗi nhận tiền: ' + (error.message || 'Lỗi không xác định'));
      }
    } finally {
      setWithdrawing(false);
    }
  }





  if (!account) {
    return null;
  }

  const hasPending = parseFloat(pendingAmount) > 0;

  return (
    <div className="pending-withdrawals">
      <div className="withdrawal-header">
        <h3>💰 Tiền chờ rút</h3>
        <button onClick={loadPendingWithdrawals} disabled={loading}>
          {loading ? '🔄' : '↻'}
        </button>
      </div>

      {loading && (
        <div className="loading-state">
          <LoadingSpinner />
          <p>Đang kiểm tra tiền chờ rút...</p>
        </div>
      )}

      {!loading && (
        <div className="withdrawal-content">
          <div className="pending-amount">
            <div className="amount-primary">
              {pendingAmount} ETH
            </div>
          </div>

          {hasPending ? (
            <div className="withdrawal-info">
              <div className="info-card">
                <div className="info-icon">💡</div>
                <div className="info-text">
                  <strong>Nhận tiền:</strong>
                  <p>Nhận tiền từ việc bán NFT. Giao dịch "Claim Payment" sẽ hiển thị trong MetaMask Activity và số dư ETH sẽ được cộng vào ví.</p>
                  <div className="amount-info">
                    <span className="amount-label">Số tiền sẽ nhận:</span>
                    <span className="amount-value">{pendingAmount} ETH</span>
                  </div>
                </div>
              </div>

              <div className="withdraw-buttons">
                <button 
                  className="withdraw-button featured"
                  onClick={claimPayment}
                  disabled={withdrawing}
                >
                  {withdrawing ? (
                    <>
                      <LoadingSpinner />
                      Đang nhận...
                    </>
                  ) : (
                    <>
                      💰 Nhận tiền + ETH ({pendingAmount} ETH)
                    </>
                  )}
                </button>
              </div>

              <div className="withdrawal-note">
                <small>
                  ✅ Sau khi rút, giao dịch sẽ hiển thị trong MetaMask Activity
                </small>
              </div>
            </div>
          ) : (
            <div className="no-pending">
              <div className="no-pending-icon">💳</div>
              <p>Chưa có tiền chờ rút</p>
              <small>Tiền từ việc bán NFT sẽ xuất hiện ở đây</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 