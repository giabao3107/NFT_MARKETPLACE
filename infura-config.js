// Infura Configuration for NFT Marketplace
// Move these to environment variables in production

export const INFURA_CONFIG = {
  // Project credentials
  projectId: '8e7323d7fd6e47e6ba293c62820e4314',
  projectSecret: '/MFbVKbctu+iieyvrOO7zz8kKq2+uBnV0cii8T286ojpGw83Ik1CLw',
  
  // Network URLs
  networks: {
    mainnet: 'https://mainnet.infura.io/v3/8e7323d7fd6e47e6ba293c62820e4314',
    sepolia: 'https://sepolia.infura.io/v3/8e7323d7fd6e47e6ba293c62820e4314',
    goerli: 'https://goerli.infura.io/v3/8e7323d7fd6e47e6ba293c62820e4314',
    polygon: 'https://polygon-mainnet.infura.io/v3/8e7323d7fd6e47e6ba293c62820e4314',
    polygonMumbai: 'https://polygon-mumbai.infura.io/v3/8e7323d7fd6e47e6ba293c62820e4314'
  },
  
  // IPFS Configuration (browser-compatible)
  ipfs: {
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    apiPath: '/api/v0',
    headers: {
      authorization: `Basic ${btoa('8e7323d7fd6e47e6ba293c62820e4314:/MFbVKbctu+iieyvrOO7zz8kKq2+uBnV0cii8T286ojpGw83Ik1CLw')}`
    }
  }
};

// Helper function to get network URL
export const getNetworkUrl = (network = 'sepolia') => {
  return INFURA_CONFIG.networks[network];
};

// Helper function to get IPFS client config
export const getIPFSConfig = () => {
  return INFURA_CONFIG.ipfs;
}; 