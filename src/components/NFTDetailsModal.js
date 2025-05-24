import React from 'react';
import { FaEthereum, FaPlay, FaVolumeUp } from 'react-icons/fa';
import './NFTDetailsModal.css';

export default function NFTDetailsModal({ nft, isOpen, onClose, onBuyOnOpenSea, onBuy }) {
  if (!isOpen || !nft) return null;

  // Debug: Log the full NFT object to see what we're working with
  console.log('🔍 NFT Modal Data:', {
    name: nft.name,
    hasOriginalMedia: !!nft.original_media,
    mediaType: nft.media_type,
    image: nft.image ? nft.image.substring(0, 100) + '...' : 'no image',
    allKeys: Object.keys(nft)
  });

  // Detect if this is a local NFT or OpenSea NFT
  const isLocalNFT = !nft.permalink && !nft.collection;
  
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

  // Detect media type for proper display
  const getMediaType = (url) => {
    if (!url) return 'image';
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('video') || lowerUrl.match(/\.(mp4|webm|ogg|mov|avi)(\?|$)/)) {
      return 'video';
    }
    if (lowerUrl.includes('audio') || lowerUrl.match(/\.(mp3|wav|ogg|m4a|aac)(\?|$)/)) {
      return 'audio';
    }
    return 'image';
  };

  const mediaType = getMediaType(nft.image);

  // Render the appropriate media player based on content type
  const renderMediaContent = () => {
    // Check if we have original media for playback (new NFTs)
    if (nft.original_media) {
      console.log('🎬 Rendering original media:', nft.media_type, nft.original_media.substring(0, 50));
      
      if (nft.media_type === 'video') {
        return (
          <div className="media-player">
            <video 
              src={nft.original_media}
              controls
              style={{ width: '100%', maxHeight: '400px', borderRadius: '8px' }}
              poster={nft.image} // Use the placeholder as poster
              onError={(e) => {
                console.log('❌ Video playback failed');
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            >
              Your browser does not support the video tag.
            </video>
            <div style={{ display: 'none' }}>
              <img src={nft.image} alt={nft.name} style={{ width: '100%', borderRadius: '8px' }} />
              <p style={{ textAlign: 'center', color: '#666', marginTop: '10px' }}>
                ⚠️ Video playback not supported - showing placeholder
              </p>
            </div>
          </div>
        );
      }
      
      if (nft.media_type === 'audio') {
        return (
          <div className="media-player">
            <img src={nft.image} alt={nft.name} style={{ width: '100%', borderRadius: '8px', marginBottom: '15px' }} />
            <audio 
              src={nft.original_media}
              controls
              style={{ width: '100%' }}
              onError={(e) => {
                console.log('❌ Audio playback failed');
              }}
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      }
    }
    
    // Check if this is a video/audio NFT by analyzing the image (for old NFTs)
    if (nft.image && nft.image.startsWith('data:image/svg+xml')) {
      try {
        // Decode the SVG to check if it's a video or audio placeholder
        const base64Data = nft.image.split(',')[1];
        const svgContent = decodeURIComponent(escape(atob(base64Data)));
        console.log('🔍 Analyzing SVG content:', svgContent.substring(0, 200));
        
        if (svgContent.includes('📹') || svgContent.includes('Video NFT')) {
          return (
            <div className="media-player">
              <img src={nft.image} alt={nft.name} style={{ width: '100%', borderRadius: '8px', marginBottom: '15px' }} />
              <div style={{ 
                background: 'linear-gradient(135deg, #1a1a2e, #16213e)', 
                padding: '20px', 
                borderRadius: '8px', 
                textAlign: 'center',
                border: '2px dashed #6366f1',
                color: 'white'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#6366f1' }}>🎬 Video NFT</h4>
                <p style={{ margin: '0', color: '#ccc' }}>
                  This NFT represents a video file stored on the blockchain.
                </p>
              </div>
            </div>
          );
        }
        
        if (svgContent.includes('🎵') || svgContent.includes('Audio NFT')) {
          return (
            <div className="media-player">
              <img src={nft.image} alt={nft.name} style={{ width: '100%', borderRadius: '8px', marginBottom: '15px' }} />
              <div style={{ 
                background: 'linear-gradient(135deg, #2d1b69, #3d2f7f)', 
                padding: '20px', 
                borderRadius: '8px', 
                textAlign: 'center',
                border: '2px dashed #8b5cf6',
                color: 'white'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#8b5cf6' }}>🎵 Audio NFT</h4>
                <p style={{ margin: '0', color: '#ccc' }}>
                  This NFT represents an audio file stored on the blockchain.
                </p>
              </div>
            </div>
          );
        }
      } catch (err) {
        console.log('❌ SVG analysis failed:', err);
      }
    }
    
    // Fallback to regular image display
    return (
      <img 
        src={nft.image} 
        alt={nft.name} 
        className="modal-media"
        style={{ width: '100%', borderRadius: '8px' }}
      />
    );
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
            {renderMediaContent()}
            
            <div className="nft-modal-price-card">
              <div className="price-info">
                <span className="price-label">Current Price</span>
                <div className="price-value">
                  <FaEthereum className="eth-icon" />
                  <span>{formatPrice(nft.price)}</span>
                </div>
              </div>
              
              {isLocalNFT ? (
                // Local NFT buttons
                nft.price !== 'Not for sale' && onBuy && (
                  <button 
                    className="buy-local-button"
                    onClick={() => onBuy(nft)}
                  >
                    💎 Buy NFT
                  </button>
                )
              ) : (
                // OpenSea NFT buttons
                <>
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
                </>
              )}
            </div>
          </div>
          
          <div className="nft-modal-details-section">
            <div className="detail-group">
              <h3>Description</h3>
              <p>{nft.description || 'No description available.'}</p>
            </div>
            
            {!isLocalNFT && (
              <div className="detail-group">
                <h3>Collection</h3>
                <p className="collection-name">{nft.collection}</p>
              </div>
            )}
            
            <div className="detail-group">
              <h3>Details</h3>
              <div className="detail-grid">
                {nft.tokenId && (
                  <div className="detail-item">
                    <span className="detail-label">Token ID</span>
                    <span className="detail-value">{nft.tokenId}</span>
                  </div>
                )}
                
                {isLocalNFT && (
                  <div className="detail-item">
                    <span className="detail-label">Contract Address</span>
                    <span 
                      className="detail-value address-value" 
                      onClick={() => copyToClipboard(nft.contract)}
                      title="Click to copy"
                    >
                      Unknown
                    </span>
                  </div>
                )}
                
                {!isLocalNFT && nft.contract && (
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
                )}
                
                <div className="detail-item">
                  <span className="detail-label">Owner</span>
                  <span 
                    className="detail-value address-value"
                    onClick={() => copyToClipboard(nft.owner || nft.seller)}
                    title="Click to copy"
                  >
                    {formatAddress(nft.owner || nft.seller)}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Blockchain</span>
                  <span className="detail-value">
                    {isLocalNFT ? '🏠 Local (Hardhat)' : '🔷 Ethereum'}
                  </span>
                </div>
                
                {!isLocalNFT && nft.rarity_rank && (
                  <div className="detail-item">
                    <span className="detail-label">Rarity Rank</span>
                    <span className="detail-value">#{nft.rarity_rank}</span>
                  </div>
                )}
              </div>
            </div>
            
            {!isLocalNFT && nft.traits && nft.traits.length > 0 && (
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
            
            {!isLocalNFT && nft.last_sale && (
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