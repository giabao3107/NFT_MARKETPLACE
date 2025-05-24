import React from 'react';
import { FaEthereum, FaPlay, FaVolumeUp } from 'react-icons/fa';
import './NFTCard.css';

const NFTCard = ({ nft, onBuy, onView, showBuyButton = false }) => {
  // Debug: Log the NFT data to see what we're working with
  console.log('🔍 NFTCard rendering with data:', {
    name: nft.name,
    image: nft.image,
    imageLength: nft.image ? nft.image.length : 'no image',
    imageStart: nft.image ? nft.image.substring(0, 100) : 'no image'
  });

  // Detect media type from URL
  const getMediaType = (url) => {
    if (!url) return 'image';
    const lowerUrl = url.toLowerCase();
    
    // Check if it's an SVG placeholder (our blockchain-optimized versions)
    if (url.startsWith('data:image/svg+xml')) {
      return 'image'; // Display SVG placeholders as images
    }
    
    // Check data URLs for actual media content
    if (url.startsWith('data:video/')) {
      return 'video';
    }
    if (url.startsWith('data:audio/')) {
      return 'audio';
    }
    if (url.startsWith('data:image/')) {
      return 'image';
    }
    
    // Check regular URLs and file extensions
    if (lowerUrl.includes('video') || lowerUrl.match(/\.(mp4|webm|ogg|mov|avi)(\?|$)/)) {
      return 'video';
    }
    if (lowerUrl.includes('audio') || lowerUrl.match(/\.(mp3|wav|ogg|m4a|aac)(\?|$)/)) {
      return 'audio';
    }
    return 'image';
  };

  const mediaType = getMediaType(nft.image);

  const renderMedia = () => {
    switch (mediaType) {
      case 'video':
        return (
          <div className="video-container">
            <video 
              src={nft.image} 
              className="nft-media"
              controls={false}
              muted
              loop
              preload="metadata"
              onMouseEnter={(e) => {
                e.target.play().catch(err => console.log('Video play failed:', err));
              }}
              onMouseLeave={(e) => {
                e.target.pause();
              }}
              onError={(e) => {
                console.log('❌ Video failed to load:', nft.image);
                console.log('📝 Video error:', e.target.error);
              }}
              onLoadedData={() => {
                console.log('✅ Video loaded successfully:', nft.image);
              }}
            />
            <div className="media-overlay">
              <FaPlay className="media-icon" />
              <span>Video</span>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="audio-container">
            <div className="audio-placeholder">
              <FaVolumeUp className="audio-icon" />
              <span>Audio NFT</span>
              <p>{nft.name}</p>
            </div>
            <audio 
              src={nft.image} 
              className="hidden-audio"
              preload="metadata"
              onError={(e) => {
                console.log('❌ Audio failed to load:', nft.image);
                console.log('📝 Audio error:', e.target.error);
              }}
              onLoadedData={() => {
                console.log('✅ Audio loaded successfully:', nft.image);
              }}
            />
            <div className="media-overlay">
              <FaVolumeUp className="media-icon" />
              <span>Audio</span>
            </div>
          </div>
        );
      default:
        return (
          <img 
            src={nft.image} 
            alt={nft.name} 
            className="nft-media"
            onError={(e) => {
              console.log('❌ Image failed to load:', nft.image ? nft.image.substring(0, 100) + '...' : 'no image');
              console.log('📝 Full NFT data:', nft);
              
              // For SVG data URLs, try a different approach
              if (nft.image && nft.image.startsWith('data:image/svg+xml')) {
                console.log('🔄 SVG failed, trying simple conversion...');
                // Try using the SVG directly as innerHTML
                try {
                  const base64Data = nft.image.split(',')[1];
                  const svgContent = decodeURIComponent(escape(atob(base64Data)));
                  console.log('📝 Decoded SVG:', svgContent.substring(0, 200));
                  
                  // Create a simple colored rectangle as fallback
                  const fallbackSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                    '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">' +
                    '<rect width="400" height="300" fill="#6366f1"/>' +
                    '<text x="200" y="150" text-anchor="middle" fill="white" font-size="20">' +
                    (nft.name || 'NFT') +
                    '</text>' +
                    '</svg>'
                  )}`;
                  e.target.src = fallbackSvg;
                } catch (err) {
                  console.log('❌ SVG conversion failed:', err);
                  e.target.src = 'https://via.placeholder.com/400x300/6366f1/ffffff?text=' + encodeURIComponent(nft.name || 'NFT');
                }
              } else if (nft.image && nft.image.startsWith('ipfs://')) {
                // Convert ipfs:// to IPFS gateway URL
                const ipfsHash = nft.image.replace('ipfs://', '');
                const gatewayUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
                console.log('🔄 Trying IPFS gateway:', gatewayUrl);
                e.target.src = gatewayUrl;
              } else if (nft.image && nft.image.includes('ipfs.io')) {
                // Try alternative IPFS gateways
                const ipfsHash = nft.image.split('/ipfs/')[1];
                if (ipfsHash) {
                  const alternatives = [
                    `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
                    `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
                    `https://dweb.link/ipfs/${ipfsHash}`
                  ];
                  
                  // Try the first alternative
                  const altUrl = alternatives[0];
                  console.log('🔄 Trying alternative IPFS gateway:', altUrl);
                  e.target.src = altUrl;
                  
                  // Set up fallback for the alternative
                  e.target.onerror = () => {
                    console.log('❌ Alternative gateway also failed');
                    e.target.src = 'https://via.placeholder.com/400x300/f0f0f0/666666?text=' + encodeURIComponent(nft.name || 'NFT');
                  };
                }
              } else {
                // Use placeholder with NFT name
                console.log('💭 Using placeholder for:', nft.name);
                e.target.src = 'https://via.placeholder.com/400x300/f0f0f0/666666?text=' + encodeURIComponent(nft.name || 'NFT');
              }
            }}
            onLoad={() => {
              console.log('✅ Image loaded successfully:', nft.image ? nft.image.substring(0, 50) + '...' : 'no image');
            }}
          />
        );
    }
  };

  return (
    <div className="nft-card" onClick={() => onView && onView(nft)}>
      <div className="nft-image-container">
        {renderMedia()}
      </div>
      
      <div className="nft-details">
        <h3 className="nft-name">{nft.name}</h3>
        <p className="nft-description">{nft.description}</p>
        
        <div className="nft-price-section">
          <div className="price-info">
            <span className="price-label">Price</span>
            <div className="price-value">
              <FaEthereum className="eth-icon" />
              <span>{nft.price}</span>
            </div>
          </div>
          
          {showBuyButton && (
            <button 
              className="buy-button" 
              onClick={(e) => {
                e.stopPropagation();
                onBuy();
              }}
            >
              Buy Now
            </button>
          )}
        </div>
        
        <div className="nft-owner">
          <span className="owner-label">Owner:</span>
          <span className="owner-address">
            {nft.seller ? `${nft.seller.slice(0, 6)}...${nft.seller.slice(-4)}` : 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NFTCard; 