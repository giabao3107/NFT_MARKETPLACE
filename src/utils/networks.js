import { INFURA_CONFIG } from '../infura-config';

// Network configurations for MetaMask
export const NETWORKS = {
  localhost: {
    chainId: '0x539', // 1337
    chainName: 'Hardhat Local',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['http://localhost:8545'],
    blockExplorerUrls: ['http://localhost:8545']
  },
  sepolia: {
    chainId: '0xaa36a7', // 11155111
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: [INFURA_CONFIG.networks.sepolia],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  },
  mainnet: {
    chainId: '0x1', // 1
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: [INFURA_CONFIG.networks.mainnet],
    blockExplorerUrls: ['https://etherscan.io']
  },
  polygon: {
    chainId: '0x89', // 137
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: [INFURA_CONFIG.networks.polygon],
    blockExplorerUrls: ['https://polygonscan.com']
  }
};

// Add network to MetaMask
export const addNetwork = async (networkName) => {
  if (!window.ethereum) {
    throw new Error('MetaMask not found');
  }

  const network = NETWORKS[networkName];
  if (!network) {
    throw new Error(`Network ${networkName} not found`);
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [network]
    });
    return true;
  } catch (error) {
    console.error('Error adding network:', error);
    throw error;
  }
};

// Switch to network
export const switchNetwork = async (networkName) => {
  if (!window.ethereum) {
    throw new Error('MetaMask not found');
  }

  const network = NETWORKS[networkName];
  if (!network) {
    throw new Error(`Network ${networkName} not found`);
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainId }]
    });
    return true;
  } catch (error) {
    // If network doesn't exist, add it
    if (error.code === 4902) {
      return await addNetwork(networkName);
    }
    console.error('Error switching network:', error);
    throw error;
  }
};

// Get current network
export const getCurrentNetwork = async () => {
  if (!window.ethereum) {
    return null;
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    // Find network by chainId
    for (const [name, config] of Object.entries(NETWORKS)) {
      if (config.chainId === chainId) {
        return { name, ...config };
      }
    }
    
    return { name: 'unknown', chainId };
  } catch (error) {
    console.error('Error getting current network:', error);
    return null;
  }
};

// Check if connected to correct network
export const isConnectedToNetwork = async (expectedNetwork) => {
  const current = await getCurrentNetwork();
  return current && current.name === expectedNetwork;
};

// Testnet faucet URLs
export const FAUCETS = {
  sepolia: [
    'https://sepoliafaucet.com/',
    'https://faucet.quicknode.com/ethereum/sepolia',
    'https://www.alchemy.com/faucets/ethereum-sepolia'
  ],
  goerli: [
    'https://goerlifaucet.com/',
    'https://faucet.quicknode.com/ethereum/goerli'
  ]
};

export default {
  NETWORKS,
  addNetwork,
  switchNetwork,
  getCurrentNetwork,
  isConnectedToNetwork,
  FAUCETS
}; 