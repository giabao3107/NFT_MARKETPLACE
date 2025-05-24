import React from 'react';
import './NFTDetailsModal.css';

export default function NFTDetailsModal({ nft, isOpen, onClose, onBuyOnOpenSea }) {
  if (!isOpen || !nft) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatPrice = (price) => {
    if (price === 'Not for sale') return price;
    if (typeof price === 'string' && !isNaN(price)) {
      return `${parseFloat(price).toFixed(4)} ETH`;
    }
    return price;
  };

  const formatAddress = (address) => {
    if (!address || address === 'Unknown') return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <div className="nft-modal-overlay" onClick={handleOverlayClick}>
      <div className="nft-modal-container">
        <div className="nft-modal-header">
          <h2>{nft.name}</h2>
          <button className="nft-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="nft-modal-content">
          <div className="nft-modal-image-section">
            <img 
              src={nft.image} 
              alt={nft.name}
              className="nft-modal-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x400?text=OpenSea+NFT';
              }}
            />
            
            <div className="nft-modal-price-card">
              <div className="price-info">
                <span className="price-label">Current Price</span>
                <span className="price-value">{formatPrice(nft.price)}</span>
              </div>
              
              {nft.price !== 'Not for sale' && (
                <button 
                  className="buy-opensea-button"
                  onClick={() => onBuyOnOpenSea(nft)}
                >
                  🌊 Buy on OpenSea
                </button>
              )}
              
              <button 
                className="view-opensea-button"
                onClick={() => window.open(nft.permalink, '_blank')}
              >
                View on OpenSea
              </button>
            </div>
          </div>
          
          <div className="nft-modal-details-section">
            <div className="detail-group">
              <h3>Description</h3>
              <p>{nft.description || 'No description available.'}</p>
            </div>
            
            <div className="detail-group">
              <h3>Collection</h3>
              <p className="collection-name">{nft.collection}</p>
            </div>
            
            <div className="detail-group">
              <h3>Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Token ID</span>
                  <span className="detail-value">{nft.tokenId}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Contract Address</span>
                  <span 
                    className="detail-value address-value" 
                    onClick={() => copyToClipboard(nft.contract)}
                    title="Click to copy"
                  >
                    {formatAddress(nft.contract)}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Owner</span>
                  <span 
                    className="detail-value address-value"
                    onClick={() => copyToClipboard(nft.owner)}
                    title="Click to copy"
                  >
                    {formatAddress(nft.owner)}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Blockchain</span>
                  <span className="detail-value">
                    {nft.chain === 'ethereum' ? '🔷 Ethereum' : nft.chain}
                  </span>
                </div>
                
                {nft.rarity_rank && (
                  <div className="detail-item">
                    <span className="detail-label">Rarity Rank</span>
                    <span className="detail-value">#{nft.rarity_rank}</span>
                  </div>
                )}
              </div>
            </div>
            
            {nft.traits && nft.traits.length > 0 && (
              <div className="detail-group">
                <h3>Traits</h3>
                <div className="traits-grid">
                  {nft.traits.map((trait, index) => (
                    <div key={index} className="trait-item">
                      <span className="trait-type">{trait.trait_type}</span>
                      <span className="trait-value">{trait.value}</span>
                      {trait.rarity && (
                        <span className="trait-rarity">{(trait.rarity * 100).toFixed(1)}%</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {nft.last_sale && (
              <div className="detail-group">
                <h3>Sale History</h3>
                <div className="sale-info">
                  <span>Last Sale: {nft.last_sale.total_price} ETH</span>
                  <span>Date: {new Date(nft.last_sale.event_timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 