import React from 'react';
import { FaEthereum } from 'react-icons/fa';
import MediaPreview from './MediaPreview';
import { PlaceholderService } from '../utils/placeholderService';
import './NFTCard.css';
import { addNFTToMetaMask } from '../utils/metamaskHelpers';

export default function NFTCard({ nft, onBuy, onView, showBuyButton }) {
  // Get fallback image with tokenId for consistency - only when absolutely needed
  const getFallbackImage = () => {
    return PlaceholderService.getPlaceholder(400, 400, nft.tokenId || Date.now());
  };

  // Use the actual image if available, fallback only if truly needed
  const imageSource = nft.image || getFallbackImage();

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      const transaction = await marketplaceContract.createMarketSale(nftContract.address, item.tokenId, {
        value: item.price
      });
      await transaction.wait();
      
      // Add NFT to MetaMask automatically after successful purchase
      await addNFTToMetaMask(
        nftContract.address,
        item.tokenId.toString(),
        item.tokenURI
      );
      
      setIsLoading(false);
      onPurchaseSuccess();
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      setIsLoading(false);
    }
  };

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