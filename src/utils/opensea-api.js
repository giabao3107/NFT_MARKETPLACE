// OpenSea API integration for fetching trending NFTs
// Using OpenSea API v2 for better performance and data

import { fetchFromAlternativeAPIs } from './nft-api-alternatives';

const OPENSEA_API_BASE = 'https://api.opensea.io/api/v2';

// API Key configuration (optional - add your OpenSea API key here)
const OPENSEA_API_KEY = process.env.REACT_APP_OPENSEA_API_KEY || null;

// Helper function to format OpenSea NFT data for our marketplace
const formatOpenSeaNFT = (nft) => {
  console.log('🔍 Raw NFT data from OpenSea:', nft);
  
  // Extract the best available image with priority order
  const getImageUrl = () => {
    // Priority order for image selection
    const imageOptions = [
      nft.image_url,
      nft.display_image_url,
      nft.metadata?.image,
      nft.metadata?.image_url,
      nft.metadata?.animation_url,
      nft.image_original_url,
      nft.image_preview_url,
      nft.image_thumbnail_url
    ];
    
    // Find the first valid image URL
    for (const imageUrl of imageOptions) {
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
        console.log('✅ Using image URL:', imageUrl);
        return imageUrl;
      }
    }
    
    console.log('⚠️ No valid image found, using placeholder');
    const placeholderText = nft.name || 'OpenSea NFT';
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#6366f1"/><text x="200" y="180" text-anchor="middle" fill="white" font-family="Arial" font-size="18" font-weight="bold">🌊 OpenSea</text><text x="200" y="220" text-anchor="middle" fill="white" font-family="Arial" font-size="14">${placeholderText}</text></svg>`)}`;
  };

  // Extract price information
  const getPrice = () => {
    // Check for listings in the NFT data
    if (nft.listings && nft.listings.length > 0) {
      const activeListing = nft.listings[0];
      if (activeListing.price) {
        const priceInEth = parseFloat(activeListing.price.current.value) / Math.pow(10, activeListing.price.current.decimals);
        return priceInEth.toFixed(4);
      }
    }
    
    // Fallback to orders
    if (nft.orders && nft.orders.length > 0) {
      const activeOrder = nft.orders.find(order => order.order_type === 'basic' || order.side === 1);
      if (activeOrder && activeOrder.current_price) {
        // Convert from wei to ETH
        const priceInEth = parseFloat(activeOrder.current_price) / Math.pow(10, 18);
        return priceInEth.toFixed(4);
      }
    }
    
    return 'Not for sale';
  };

  const formattedNFT = {
    id: nft.identifier || nft.token_id || Math.random().toString(),
    tokenId: nft.identifier || nft.token_id,
    name: nft.name || `${nft.collection} #${nft.identifier}` || 'Unnamed NFT',
    description: nft.description || nft.metadata?.description || 'OpenSea NFT',
    image: getImageUrl(),
    price: getPrice(),
    collection: nft.collection || 'Unknown Collection',
    permalink: nft.opensea_url || `https://opensea.io/assets/ethereum/${nft.contract}/${nft.identifier}`,
    owner: nft.owners?.[0]?.address || nft.owner || 'Unknown',
    contract: nft.contract,
    chain: nft.chain || 'ethereum',
    source: 'opensea',
    traits: nft.traits || [],
    rarity_rank: nft.rarity?.rank,
    last_sale: nft.last_sale,
    creator_earnings: nft.collection_fees
  };
  
  console.log('✅ Formatted NFT:', formattedNFT);
  return formattedNFT;
};

// Fallback NFTs when OpenSea API is unavailable
const getFallbackNFTs = () => {
  const fallbackCollections = [
    { name: 'Bored Ape Yacht Club', color: 'FF6B35', emoji: '🐵' },
    { name: 'CryptoPunks', color: '7209B7', emoji: '👤' }, 
    { name: 'Azuki', color: 'FF5E5B', emoji: '🌸' },
    { name: 'Doodles', color: '00F5FF', emoji: '🎨' },
    { name: 'Cool Cats', color: '4ECDC4', emoji: '😎' },
    { name: 'World of Women', color: 'FFD23F', emoji: '👩' },
    { name: 'Moonbirds', color: '8B5CF6', emoji: '🌙' },
    { name: 'CloneX', color: '06FFA5', emoji: '🤖' },
    { name: 'Art Blocks', color: 'F72585', emoji: '🎭' },
    { name: 'Pudgy Penguins', color: '4CC9F0', emoji: '🐧' }
  ];

  return Array.from({ length: 10 }, (_, i) => {
    const collection = fallbackCollections[i];
    const tokenId = Math.floor(Math.random() * 9999);
    
    return {
      id: `fallback-${i}`,
      tokenId: tokenId,
      name: `${collection.name} #${tokenId}`,
      description: `Popular NFT from ${collection.name} collection. This is a demonstration of how OpenSea NFTs would appear in the marketplace.`,
      image: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#${collection.color};stop-opacity:1" /><stop offset="100%" style="stop-color:#${collection.color}80;stop-opacity:1" /></linearGradient></defs><rect width="400" height="400" fill="url(#grad)"/><text x="200" y="160" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">${collection.emoji}</text><text x="200" y="200" text-anchor="middle" fill="white" font-family="Arial" font-size="16">${collection.name}</text><text x="200" y="240" text-anchor="middle" fill="white" font-family="Arial" font-size="14">#${tokenId}</text></svg>`)}`,
      price: (Math.random() * 10 + 0.1).toFixed(3),
      collection: collection.name,
      permalink: 'https://opensea.io',
      owner: '0x' + Math.random().toString(16).substr(2, 40),
      contract: '0x' + Math.random().toString(16).substr(2, 40),
      chain: 'ethereum',
      source: 'opensea',
      traits: [
        { trait_type: 'Background', value: 'Rare', rarity: 0.05 },
        { trait_type: 'Eyes', value: 'Diamond', rarity: 0.02 },
        { trait_type: 'Mouth', value: 'Smile', rarity: 0.15 }
      ],
      rarity_rank: Math.floor(Math.random() * 1000) + 1,
    };
  });
};

// Fetch trending NFTs from OpenSea
export const fetchTrendingNFTs = async (limit = 10) => {
  try {
    console.log('🌊 Fetching trending NFTs from OpenSea...');
    
    // Using the collections endpoint to get trending collections first
    const headers = {
      'Accept': 'application/json',
    };
    
    // Add API key if available
    if (OPENSEA_API_KEY) {
      headers['X-API-KEY'] = OPENSEA_API_KEY;
      console.log('🔑 Using API key for OpenSea requests');
    } else {
      console.log('⚠️ No API key found - using rate-limited access');
    }
    
    // Try different endpoints to get real NFT data
    const endpoints = [
      `${OPENSEA_API_BASE}/collections?order_by=seven_day_volume&limit=5`,
      `${OPENSEA_API_BASE}/collections?order_by=total_volume&limit=5`,
      `${OPENSEA_API_BASE}/collections?limit=5`
    ];
    
    let collectionsData = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying endpoint: ${endpoint}`);
        const collectionsResponse = await fetch(endpoint, { headers });
        
        if (collectionsResponse.ok) {
          collectionsData = await collectionsResponse.json();
          console.log('✅ Collections response:', collectionsData);
          break;
        } else {
          console.log(`❌ Endpoint failed with status: ${collectionsResponse.status}`);
        }
      } catch (endpointError) {
        console.log(`❌ Endpoint error:`, endpointError);
        continue;
      }
    }

    if (!collectionsData || !collectionsData.collections || collectionsData.collections.length === 0) {
      console.log('❌ No trending collections found, using fallback data');
      return getFallbackNFTs();
    }

    // Get NFTs from the top trending collection
    const topCollection = collectionsData.collections[0];
    console.log(`📈 Fetching NFTs from trending collection: ${topCollection.name || topCollection.collection}`);

    const nftsResponse = await fetch(
      `${OPENSEA_API_BASE}/collection/${topCollection.collection}/nfts?limit=${limit}`,
      { headers }
    );

    if (!nftsResponse.ok) {
      console.log(`❌ NFTs API error: ${nftsResponse.status}`);
      throw new Error(`OpenSea NFTs API error: ${nftsResponse.status}`);
    }

    const nftsData = await nftsResponse.json();
    console.log('🎯 NFTs response:', nftsData);
    
    if (!nftsData.nfts || nftsData.nfts.length === 0) {
      console.log('❌ No NFTs found in collection, using fallback');
      return getFallbackNFTs();
    }

    const formattedNFTs = nftsData.nfts.slice(0, limit).map(formatOpenSeaNFT);
    console.log(`✅ Successfully fetched ${formattedNFTs.length} real OpenSea NFTs`);
    
    return formattedNFTs;
  } catch (error) {
    console.error('❌ Error fetching OpenSea NFTs:', error);
    console.log('🔄 Trying alternative APIs...');
    
    // Try alternative APIs first
    try {
      const alternativeData = await fetchFromAlternativeAPIs(limit);
      if (alternativeData && alternativeData.length > 0) {
        return alternativeData;
      }
    } catch (altError) {
      console.log('❌ Alternative APIs also failed:', altError.message);
    }
    
    console.log('🔄 Using enhanced fallback NFTs');
    return getFallbackNFTs();
  }
};

// Fetch detailed NFT information
export const fetchNFTDetails = async (contract, tokenId) => {
  try {
    console.log(`🔍 Fetching NFT details for ${contract}/${tokenId}`);
    
    const headers = {
      'Accept': 'application/json',
    };
    
    // Add API key if available
    if (OPENSEA_API_KEY) {
      headers['X-API-KEY'] = OPENSEA_API_KEY;
    }
    
    const response = await fetch(
      `${OPENSEA_API_BASE}/chain/ethereum/contract/${contract}/nfts/${tokenId}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`OpenSea NFT details API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.nft) {
      throw new Error('NFT not found');
    }

    return formatOpenSeaNFT(data.nft);
  } catch (error) {
    console.error('Error fetching NFT details:', error);
    throw error;
  }
};

// Search NFTs by collection or name
export const searchOpenSeaNFTs = async (query, limit = 10) => {
  try {
    console.log(`🔍 Searching OpenSea for: ${query}`);
    
    const headers = {
      'Accept': 'application/json',
    };
    
    // Add API key if available
    if (OPENSEA_API_KEY) {
      headers['X-API-KEY'] = OPENSEA_API_KEY;
    }
    
    // First try to search collections
    const collectionsResponse = await fetch(
      `${OPENSEA_API_BASE}/collections?search=${encodeURIComponent(query)}&limit=3`,
      { headers }
    );

    if (collectionsResponse.ok) {
      const collectionsData = await collectionsResponse.json();
      
      if (collectionsData.collections && collectionsData.collections.length > 0) {
        const collection = collectionsData.collections[0];
        
        const nftsResponse = await fetch(
          `${OPENSEA_API_BASE}/collection/${collection.collection}/nfts?limit=${limit}`,
          { headers }
        );

        if (nftsResponse.ok) {
          const nftsData = await nftsResponse.json();
          if (nftsData.nfts && nftsData.nfts.length > 0) {
            return nftsData.nfts.map(formatOpenSeaNFT);
          }
        }
      }
    }

    console.log('No search results found, returning empty array');
    return [];
  } catch (error) {
    console.error('Error searching OpenSea NFTs:', error);
    return [];
  }
};

export default {
  fetchTrendingNFTs,
  fetchNFTDetails,
  searchOpenSeaNFTs
}; 