// MetaMask Activity Enhancement Utilities
import { ethers } from 'ethers';

export const MetaMaskHelpers = {
  // Function signatures for better MetaMask recognition
  FUNCTION_SIGNATURES: {
    BUY_NFT: '0xa82ba76f', // buyNFT(address,uint256)
    CLAIM_PAYMENT: '0xc7dea2f2', // claimPayment()
    CREATE_TOKEN: '0x50bb4e7f', // createToken(string)
    CREATE_MARKET_ITEM: '0x0b2e4c2b' // createMarketItem(address,uint256,uint256)
  },

  // Get transaction description based on method signature
  getTransactionDescription: (data) => {
    if (!data || data.length < 10) return null;
    
    const methodId = data.slice(0, 10);
    
    switch (methodId) {
      case MetaMaskHelpers.FUNCTION_SIGNATURES.BUY_NFT:
        return 'Buy NFT';
      case MetaMaskHelpers.FUNCTION_SIGNATURES.CLAIM_PAYMENT:
        return 'Claim Payment';
      case MetaMaskHelpers.FUNCTION_SIGNATURES.CREATE_TOKEN:
        return 'Create NFT Token';
      case MetaMaskHelpers.FUNCTION_SIGNATURES.CREATE_MARKET_ITEM:
        return 'List NFT for Sale';
      default:
        return 'Contract Interaction';
    }
  },

  // Create transaction with enhanced data for MetaMask
  enhanceTransactionForMetaMask: (transaction, type, metadata = {}) => {
    const enhanced = { ...transaction };
    
    // Add transaction type to data field for MetaMask parsing
    if (enhanced.data) {
      // MetaMask can read certain patterns in transaction data
      const description = MetaMaskHelpers.getTransactionDescription(enhanced.data);
      
      // Log for debugging
      console.log(`📱 MetaMask Transaction Enhancement:`, {
        type,
        description,
        methodId: enhanced.data.slice(0, 10),
        metadata
      });
    }

    return enhanced;
  },

  // Add method to register function signatures with MetaMask
  registerFunctionSignatures: async () => {
    try {
      // MetaMask might recognize these if we call them explicitly
      const signatures = [
        { name: 'buyNFT', signature: 'buyNFT(address,uint256)' },
        { name: 'claimPayment', signature: 'claimPayment()' },
        { name: 'createToken', signature: 'createToken(string)' },
        { name: 'createMarketItem', signature: 'createMarketItem(address,uint256,uint256)' }
      ];

      console.log('📱 Registering function signatures for MetaMask:', signatures);
      
      // Store in localStorage for potential MetaMask extension access
      localStorage.setItem('nft_function_signatures', JSON.stringify(signatures));
      
      return signatures;
    } catch (error) {
      console.error('Error registering function signatures:', error);
      return [];
    }
  },

  // Create a transaction receipt enhancer
  enhanceTransactionReceipt: (receipt, type, metadata = {}) => {
    const enhanced = {
      ...receipt,
      nftTransactionType: type,
      nftMetadata: metadata,
      displayName: MetaMaskHelpers.getTransactionDescription(receipt.data || ''),
      timestamp: Date.now()
    };

    // Store enhanced receipt for reference
    const key = `nft_tx_${receipt.transactionHash}`;
    localStorage.setItem(key, JSON.stringify(enhanced));

    console.log('📱 Enhanced transaction receipt:', enhanced);
    return enhanced;
  },

  // Store transaction info for reference
  storeTransactionInfo: (txHash, type, metadata = {}) => {
    try {
      const txInfo = {
        hash: txHash,
        type,
        metadata,
        timestamp: Date.now()
      };
      
      const key = `nft_tx_${txHash}`;
      localStorage.setItem(key, JSON.stringify(txInfo));
      
      console.log('📱 Stored transaction info:', txInfo);
      return txInfo;
    } catch (error) {
      console.error('Error storing transaction info:', error);
      return null;
    }
  },

  // Get stored transaction info
  getStoredTransactionInfo: (txHash) => {
    try {
      const key = `nft_tx_${txHash}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting stored transaction info:', error);
      return null;
    }
  }
}; 