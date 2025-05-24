// Alternative NFT APIs for when OpenSea is unavailable
// These APIs provide free access without requiring API keys

// Free public NFT data from various sources
export const fetchFromAlternativeAPIs = async (limit = 10) => {
  console.log('🔄 Trying alternative NFT APIs...');
  
  // Try CoinGecko NFT API (free, no auth required)
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/nfts/list?order=market_cap_usd_desc&per_page=10',
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Successfully fetched from CoinGecko');
      return formatCoinGeckoNFTs(data);
    }
  } catch (error) {
    console.log('CoinGecko API failed:', error.message);
  }

  // Try JSONPlaceholder for demo data (always works)
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/photos?_limit=10');
    const photos = await response.json();
    console.log('✅ Using demo data from JSONPlaceholder');
    return formatDemoNFTs(photos);
  } catch (error) {
    console.log('Demo API failed:', error.message);
  }

  // Return enhanced fallback data
  return getEnhancedFallbackNFTs();
};

// Format CoinGecko NFT data
const formatCoinGeckoNFTs = (nfts) => {
  return nfts.slice(0, 10).map((nft, index) => ({
    id: nft.id || `coingecko-${index}`,
    tokenId: index + 1,
    name: nft.name || `NFT #${index + 1}`,
    description: nft.description || `Popular NFT collection with strong community and trading volume.`,
    image: nft.image?.small || `https://picsum.photos/400/400?random=${index}`,
    price: (Math.random() * 5 + 0.1).toFixed(3),
    collection: nft.name || 'Popular Collection',
    permalink: nft.links?.homepage?.[0] || 'https://opensea.io',
    owner: '0x' + Math.random().toString(16).substr(2, 40),
    contract: nft.contract_address || '0x' + Math.random().toString(16).substr(2, 40),
    chain: 'ethereum',
    source: 'coingecko',
    traits: [
      { trait_type: 'Rarity', value: 'Common', rarity: 0.3 },
      { trait_type: 'Type', value: 'Art', rarity: 0.2 }
    ],
    rarity_rank: Math.floor(Math.random() * 1000) + 1,
  }));
};

// Format demo data as NFTs
const formatDemoNFTs = (photos) => {
  const collections = [
    'Bored Ape Yacht Club', 'CryptoPunks', 'Azuki', 'Doodles', 'Cool Cats',
    'World of Women', 'Moonbirds', 'CloneX', 'Art Blocks', 'Pudgy Penguins'
  ];

  return photos.map((photo, index) => ({
    id: `demo-${photo.id}`,
    tokenId: photo.id,
    name: `${collections[index % collections.length]} #${photo.id}`,
    description: photo.title || `Demo NFT showcasing marketplace functionality with realistic data.`,
    image: photo.url.replace('150', '400'), // Use higher resolution
    price: (Math.random() * 8 + 0.5).toFixed(3),
    collection: collections[index % collections.length],
    permalink: 'https://opensea.io',
    owner: '0x' + Math.random().toString(16).substr(2, 40),
    contract: '0x' + Math.random().toString(16).substr(2, 40),
    chain: 'ethereum',
    source: 'demo',
    traits: [
      { trait_type: 'Background', value: 'Rare', rarity: 0.05 },
      { trait_type: 'Style', value: 'Classic', rarity: 0.15 },
      { trait_type: 'Edition', value: 'Limited', rarity: 0.08 }
    ],
    rarity_rank: Math.floor(Math.random() * 500) + 1,
  }));
};

// Enhanced fallback NFTs with better variety
const getEnhancedFallbackNFTs = () => {
  const collections = [
    { 
      name: 'Bored Ape Yacht Club', 
      floor: '30.5',
      traits: [
        { trait_type: 'Background', value: 'Orange', rarity: 0.12 },
        { trait_type: 'Fur', value: 'Golden Brown', rarity: 0.08 },
        { trait_type: 'Eyes', value: 'Laser Eyes', rarity: 0.03 }
      ]
    },
    { 
      name: 'CryptoPunks', 
      floor: '65.2',
      traits: [
        { trait_type: 'Type', value: 'Male', rarity: 0.60 },
        { trait_type: 'Accessory', value: 'VR', rarity: 0.02 },
        { trait_type: 'Attribute', value: 'Mohawk', rarity: 0.44 }
      ]
    },
    { 
      name: 'Azuki', 
      floor: '8.7',
      traits: [
        { trait_type: 'Background', value: 'Red', rarity: 0.10 },
        { trait_type: 'Eyes', value: 'Closed', rarity: 0.15 },
        { trait_type: 'Mouth', value: 'Lipstick', rarity: 0.07 }
      ]
    },
    { 
      name: 'Doodles', 
      floor: '4.1',
      traits: [
        { trait_type: 'Background', value: 'Blue', rarity: 0.11 },
        { trait_type: 'Head', value: 'Purple', rarity: 0.09 },
        { trait_type: 'Body', value: 'Spotted Hoodie', rarity: 0.05 }
      ]
    },
    { 
      name: 'Cool Cats', 
      floor: '2.8',
      traits: [
        { trait_type: 'Body', value: 'Simple', rarity: 0.25 },
        { trait_type: 'Hat', value: 'Knit Hat', rarity: 0.08 },
        { trait_type: 'Face', value: 'Star Sunglasses', rarity: 0.04 }
      ]
    }
  ];

  return Array.from({ length: 10 }, (_, i) => {
    const collection = collections[i % collections.length];
    const tokenId = Math.floor(Math.random() * 9999) + 1;
    
    return {
      id: `enhanced-${i}`,
      tokenId: tokenId,
      name: `${collection.name} #${tokenId}`,
      description: `Rare collectible from the ${collection.name} collection. Features unique traits and community-driven value.`,
      image: `https://picsum.photos/400/400?random=${i + 100}`,
      price: collection.floor || (Math.random() * 15 + 0.5).toFixed(3),
      collection: collection.name,
      permalink: 'https://opensea.io',
      owner: '0x' + Math.random().toString(16).substr(2, 40),
      contract: '0x' + Math.random().toString(16).substr(2, 40),
      chain: 'ethereum',
      source: 'enhanced-fallback',
      traits: collection.traits || [],
      rarity_rank: Math.floor(Math.random() * 1000) + 1,
      last_sale: {
        total_price: (parseFloat(collection.floor || '1') * 0.8).toFixed(3),
        event_timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
  });
};

// Try to fetch real NFT collections data
export const fetchPopularCollections = async () => {
  try {
    // This is a simplified example - in practice you'd use a real API
    const collections = [
      { name: 'Bored Ape Yacht Club', volume: 15420.5 },
      { name: 'CryptoPunks', volume: 12800.2 },
      { name: 'Azuki', volume: 8950.7 },
      { name: 'Doodles', volume: 5420.1 },
      { name: 'Cool Cats', volume: 3210.8 }
    ];
    
    return collections;
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
};

export default {
  fetchFromAlternativeAPIs,
  fetchPopularCollections
}; 