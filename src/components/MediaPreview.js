import React, { useState } from 'react';
import { PlaceholderService } from '../utils/placeholderService';
import './MediaPreview.css';

const MediaPreview = ({ src, className = '', alt = '' }) => {
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);

  // Update imageSrc when src prop changes
  React.useEffect(() => {
    if (src !== imageSrc) {
      console.log(`🖼️ MediaPreview: Updating image source for ${alt}:`, 
        src?.startsWith('data:') ? `Data URL (${src.length} chars)` : src);
      setImageSrc(src);
      setError(false);
      setRetryCount(0);
    }
  }, [src]);

  const handleImageError = () => {
    console.log(`❌ Image load failed for ${alt}:`, 
      imageSrc?.startsWith('data:') ? `Data URL (${imageSrc.length} chars)` : imageSrc);
    
    // Only try placeholder if this is not already a data URL (real image)
    if (!imageSrc?.startsWith('data:') && retryCount < 2) {
      // Try placeholder service only for external URLs
      const tokenId = alt.match(/\d+/) ? parseInt(alt.match(/\d+/)[0]) : Date.now();
      const placeholderUrl = PlaceholderService.getPlaceholder(400, 400, tokenId);
      
      if (imageSrc !== placeholderUrl) {
        PlaceholderService.markServiceFailed(imageSrc);
        console.log(`🔄 Retrying with placeholder for ${alt}:`, placeholderUrl);
        setImageSrc(placeholderUrl);
        setRetryCount(prev => prev + 1);
        return;
      }
    }
    
    // Final fallback only if it's not a data URL
    if (!imageSrc?.startsWith('data:')) {
      console.log(`🚨 Using error placeholder for ${alt}`);
      setImageSrc(PlaceholderService.getErrorPlaceholder());
    }
    
    setError(true);
  };

  const handleImageLoad = () => {
    console.log(`✅ Image loaded successfully for ${alt}:`, 
      imageSrc?.startsWith('data:') ? `Data URL (${imageSrc.length} chars)` : imageSrc);
    setError(false);
  };

  return (
    <img 
      src={imageSrc || PlaceholderService.getLoadingPlaceholder()} 
      alt={alt} 
      className={`media-preview image-preview ${className}`}
      onError={handleImageError}
      onLoad={handleImageLoad}
    />
  );
};

export default MediaPreview; 