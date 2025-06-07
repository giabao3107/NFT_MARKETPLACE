import React from 'react';
import { FaEthereum, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import MediaPreview from './MediaPreview';
import { PlaceholderService } from '../utils/placeholderService';
import './NFTDetailsModal.css';

export default function NFTDetailsModal({ nft, isOpen, onClose, onBuy }) {
  if (!isOpen || !nft) return null;

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get fallback image
  const getFallbackImage = () => {
    return PlaceholderService.getPlaceholder(400, 400, nft.tokenId || Date.now());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{nft.name || `NFT #${nft.tokenId}`}</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="nft-image-container">
            <MediaPreview 
              src={nft.image || getFallbackImage()} 
              alt={nft.name || `NFT #${nft.tokenId}`}
              className="modal-media-preview"
            />
          </div>

          <div className="nft-details">
            <div className="detail-group">
              <span className="detail-label">Description</span>
              <p className="detail-value">
                {nft.description || 'No description available'}
              </p>
            </div>

            <div className="detail-group">
              <span className="detail-label">Token ID</span>
              <span className="detail-value">#{nft.tokenId}</span>
            </div>

            <div className="detail-group">
              <span className="detail-label">Owner</span>
              <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {formatAddress(nft.owner)}
                <a 
                  href={`https://etherscan.io/address/${nft.owner}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit' }}
                >
                  <FaExternalLinkAlt size={14} />
                </a>
              </div>
            </div>

            {nft.seller && (
              <div className="detail-group">
                <span className="detail-label">Seller</span>
                <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {formatAddress(nft.seller)}
                  <a 
                    href={`https://etherscan.io/address/${nft.seller}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit' }}
                  >
                    <FaExternalLinkAlt size={14} />
                  </a>
                </div>
              </div>
            )}

            <div className="price-section">
              <div className="price-info">
                <FaEthereum className="eth-icon" />
                <span className="price-value">{nft.price} ETH</span>
              </div>
              {onBuy && (
                <button 
                  className="buy-button"
                  onClick={() => onBuy(nft)}
                >
                  Buy Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 