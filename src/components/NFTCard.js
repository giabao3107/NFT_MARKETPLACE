import React from 'react';
import { FaEthereum } from 'react-icons/fa';
import MediaPreview from './MediaPreview';
import { PlaceholderService } from '../utils/placeholderService';
import './NFTCard.css';

export default function NFTCard({ nft, onBuy, onView, showBuyButton }) {
  // Get fallback image with tokenId for consistency - only when absolutely needed
  const getFallbackImage = () => {
    return PlaceholderService.getPlaceholder(400, 400, nft.tokenId || Date.now());
  };

  // Use the actual image if available, fallback only if truly needed
  const imageSource = nft.image || getFallbackImage();

  return (
    <div className="nft-card" onClick={() => onView(nft)}>
      <div className="nft-card-image-container">
        <MediaPreview 
          src={imageSource} 
          alt={nft.name || `NFT #${nft.tokenId}`}
          className="nft-card-image"
        />
        {nft.statusBadge && (
          <div className="category-badge">
            {nft.statusBadge}
          </div>
        )}
      </div>
      
      <div className="nft-card-content">
        <div className="nft-card-header">
          <h3 className="nft-card-title">{nft.name || `NFT #${nft.tokenId}`}</h3>
          <div className="nft-card-price">
            <FaEthereum className="eth-icon" />
            <span>{nft.price} ETH</span>
          </div>
        </div>

        <p className="nft-card-description">
          {nft.description || 'No description available'}
        </p>

        <div className="nft-card-footer">
          <div className="nft-card-owner">
            <span className="owner-label">Owner</span>
            <span className="owner-address">
              {nft.owner === '0x0000000000000000000000000000000000000000' 
                ? 'No Owner'
                : `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`}
            </span>
          </div>

          {showBuyButton && (
            <button 
              className="buy-button"
              onClick={(e) => {
                e.stopPropagation();
                onBuy(nft);
              }}
            >
              Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 