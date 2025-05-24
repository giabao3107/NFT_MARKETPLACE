import React from 'react';
import { FaEthereum } from 'react-icons/fa';
import './NFTCard.css';

const NFTCard = ({ nft, onBuy, showBuyButton = false }) => {
  return (
    <div className="nft-card">
      <div className="nft-image-container">
        <img src={nft.image} alt={nft.name} className="nft-image" />
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
            <button className="buy-button" onClick={onBuy}>
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