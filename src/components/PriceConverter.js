import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/constants';
import './PriceConverter.css';

const PriceConverter = ({ ethAmount, className = '' }) => {
  const [showConverter, setShowConverter] = useState(false);
  const [usdAmount, setUsdAmount] = useState('');
  const [vndAmount, setVndAmount] = useState('');

  useEffect(() => {
    if (ethAmount && !isNaN(parseFloat(ethAmount))) {
      const ethValue = parseFloat(ethAmount);
      setUsdAmount(formatCurrency(ethValue, 'USD'));
      setVndAmount(formatCurrency(ethValue, 'VND'));
      setShowConverter(true);
    } else {
      setShowConverter(false);
    }
  }, [ethAmount]);

  if (!showConverter || !ethAmount) {
    return null;
  }

  return (
    <div className={`price-converter ${className}`}>
      <div className="converter-header">
        <span className="converter-icon">💱</span>
        <span className="converter-label">Quy đổi</span>
      </div>
      
      <div className="converter-amounts">
        <div className="converter-item">
          <span className="currency-flag">🇺🇸</span>
          <span className="currency-amount">{usdAmount}</span>
          <span className="currency-code">USD</span>
        </div>
        
        <div className="converter-item">
          <span className="currency-flag">🇻🇳</span>
          <span className="currency-amount">{vndAmount}</span>
          <span className="currency-code">VND</span>
        </div>
      </div>
      
      <div className="converter-note">
        <span className="note-icon">ℹ️</span>
        <span>Tỷ giá ước tính, có thể thay đổi</span>
      </div>
    </div>
  );
};

export default PriceConverter; 