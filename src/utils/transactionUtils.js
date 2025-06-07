// Transaction utilities for better MetaMask integration

export const TransactionUtils = {
  // Format transaction with custom data for MetaMask
  formatNFTPurchase: (nftName, price, to) => {
    return {
      // This will help MetaMask display transaction purpose
      data: {
        type: 'NFT_PURCHASE',
        nft: nftName,
        price: price,
        description: `Mua NFT: ${nftName}`,
      }
    };
  },

  // Format transaction for NFT creation
  formatNFTCreation: (nftName, price) => {
    return {
      data: {
        type: 'NFT_CREATION',
        nft: nftName,
        price: price,
        description: `Tạo NFT: ${nftName}`,
      }
    };
  },

  // Get transaction description based on function
  getTransactionDescription: (functionName, params) => {
    switch (functionName) {
      case 'buyNFT':
        return `Mua NFT #${params.itemId}`;
      case 'createMarketItem':
        return `Tạo NFT cho marketplace`;
      case 'createToken':
        return `Tạo NFT Token`;
      default:
        return 'Smart Contract Transaction';
    }
  },

  // Format balance change notification
  formatBalanceChange: (change, type) => {
    const changeAbs = Math.abs(change);
    const sign = change >= 0 ? '+' : '-';
    
    switch (type) {
      case 'purchase':
        return `${sign}${changeAbs} ETH (Mua NFT)`;
      case 'sale':
        return `${sign}${changeAbs} ETH (Bán NFT)`;
      case 'fee':
        return `${sign}${changeAbs} ETH (Phí marketplace)`;
      default:
        return `${sign}${changeAbs} ETH`;
    }
  }
};

export default TransactionUtils; 