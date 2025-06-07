import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletContext } from '../App';
import { UI_TEXT } from '../utils/constants';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const { account, balance, connectWallet, isConnecting, refreshBalance } = useContext(WalletContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    if (!balance) return '0.0000';
    const num = parseFloat(balance);
    return num.toFixed(4);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Navigation items
  const navItems = [
    { path: '/', icon: '🌟', text: 'Khám phá' },
    { path: '/create-item', icon: '✨', text: 'Tạo NFT' },
    { path: '/my-nfts', icon: '🖼️', text: 'NFT của tôi' },
    { path: '/purchase-history', icon: '🛒', text: 'Lịch sử mua' },
    { path: '/wallet', icon: '💳', text: 'Quản lý ví' },
  ];

  // Update active index and slider position
  useEffect(() => {
    const currentIndex = navItems.findIndex(item => item.path === location.pathname);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [location.pathname]);

  // Update slider position
  const updateSliderPosition = () => {
    const slider = document.querySelector('.nav-slider');
    const activeLink = document.querySelector('.nav-link.active');
    
    if (slider && activeLink) {
      const navContainer = document.querySelector('.header-nav');
      
      // Get positions relative to nav container
      const navRect = navContainer.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      
      // Calculate exact position - account for nav container padding (0.5rem = 8px)
      const offsetX = linkRect.left - navRect.left - 8; // 8px = 0.5rem nav container padding
      const width = linkRect.width;
      
      slider.style.transform = `translateX(${offsetX}px)`;
      slider.style.width = `${width}px`;
    }
  };

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      updateSliderPosition();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [activeIndex]);

  // Initial setup and window resize handler
  useEffect(() => {
    // Initial position update
    const timer = setTimeout(() => {
      updateSliderPosition();
    }, 50);
    
    const handleResize = () => {
      updateSliderPosition();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-container">
        {/* Brand Section */}
        <div className="header-brand">
          <Link to="/" className="brand-link">
            <span className="logo-icon">🎨</span>
            <span className="brand-name">NFT Market</span>
        </Link>
        </div>
        
        {/* Navigation */}
        <nav className={`header-nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <div className="nav-slider"></div>
          {navItems.map((item, index) => (
          <Link 
              key={item.path}
              to={item.path} 
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.text}</span>
          </Link>
          ))}
        </nav>

        {/* Wallet Section */}
        <div className="header-actions">
          {account ? (
            <div 
              className="wallet-connected" 
              title={`Địa chỉ: ${account}\nSố dư: ${formatBalance(balance)} ETH`}
            >
              <div className="connection-status">
                <div className="status-dot"></div>
                <span className="status-text">Đã kết nối</span>
              </div>
              <div className="wallet-address">
                  {formatAddress(account)}
              </div>
              <div className="profile-avatar">
                <span>👤</span>
              </div>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="connect-wallet-btn"
            >
              {isConnecting ? (
                <>
                  <span className="loading-spinner"></span>
                  <span className="wallet-text">Đang kết nối...</span>
                </>
              ) : (
                <>
                  <span>🔗</span>
                  <span className="wallet-text">Kết nối ví</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="menu-line"></span>
          <span className="menu-line"></span>
          <span className="menu-line"></span>
        </button>
      </div>
    </header>
  );
} 