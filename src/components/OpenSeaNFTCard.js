import React, { useState } from 'react';
import './OpenSeaNFTCard.css';

export default function OpenSeaNFTCard({ nft, onView, onBuyOnOpenSea }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = (e) => {
    console.log('🖼️ Image failed to load:', e.target.src);
    setImageError(true);
    // Try a series of fallback images
    const fallbacks = [
      `https://picsum.photos/400/400?random=${nft.id}`,
      `https://via.placeholder.com/400x400/6366f1/white?text=${encodeURIComponent(nft.name)}`,
      'https://via.placeholder.com/400x400/6366f1/white?text=OpenSea+NFT'
    ];
    
    const currentSrc = e.target.src;
    const currentFallbackIndex = fallbacks.findIndex(fallback => currentSrc.includes(fallback.split('?')[0]));
    
    if (currentFallbackIndex < fallbacks.length - 1) {
      e.target.src = fallbacks[currentFallbackIndex + 1];
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const formatPrice = (price) => {
    if (price === 'Not for sale') return price;
    if (typeof price === 'string' && !isNaN(price)) {
      return `${parseFloat(price).toFixed(3)} ETH`;
    }
    return price;
  };

  const formatAddress = (address) => {
    if (!address || address === 'Unknown') return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get the best image URL with fallbacks
  const getImageSrc = () => {
    if (imageError) {
      return `https://picsum.photos/400/400?random=${nft.id}`;
    }
    return nft.image || `https://via.placeholder.com/400x400/6366f1/white?text=${encodeURIComponent(nft.name)}`;
  };

  return (
    <div className="opensea-nft-card" onClick={() => onView(nft)}>
      <div className="opensea-nft-image-container">
        {!imageLoaded && !imageError && (
          <div className="image-loading-placeholder">
            <span>Loading...</span>
          </div>
        )}
        <img
          src={getImageSrc()}
          alt={nft.name}
          className={`opensea-nft-image ${imageLoaded ? 'loaded' : ''}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ display: imageLoaded || imageError ? 'block' : 'none' }}
        />
        <div className="opensea-badge">
          <span>🌊 OpenSea</span>
        </div>
      </div>
      
      <div className="opensea-nft-details">
        <div className="opensea-nft-header">
          <h3 className="opensea-nft-name">{nft.name}</h3>
          <p className="opensea-nft-collection">{nft.collection}</p>
        </div>
        
        <p className="opensea-nft-description">
          {nft.description && nft.description.length > 80 
            ? `${nft.description.substring(0, 80)}...` 
            : nft.description || 'No description available'}
        </p>
        
        <div className="opensea-nft-info">
          <div className="opensea-price-section">
            <span className="opensea-price-label">Price</span>
            <span className="opensea-price">{formatPrice(nft.price)}</span>
          </div>
          
          <div className="opensea-owner-section">
            <span className="opensea-owner-label">Owner</span>
            <span className="opensea-owner">{formatAddress(nft.owner)}</span>
          </div>
        </div>
        
        <div className="opensea-nft-actions">
          <button 
            className="opensea-view-button"
            onClick={(e) => {
              e.stopPropagation();
              onView(nft);
            }}
          >
            View Details
          </button>
          
          <button 
            className="opensea-buy-button"
            onClick={(e) => {
              e.stopPropagation();
              onBuyOnOpenSea(nft);
            }}
            disabled={nft.price === 'Not for sale'}
          >
            {nft.price === 'Not for sale' ? 'Not for Sale' : 'Buy on OpenSea'}
          </button>
        </div>
        
        {nft.rarity_rank && (
          <div className="opensea-rarity">
            <span>🏆 Rarity Rank: #{nft.rarity_rank}</span>
          </div>
        )}
      </div>
    </div>
  );
} 