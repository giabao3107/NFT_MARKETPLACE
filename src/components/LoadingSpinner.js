import React from 'react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ 
  size = 'medium',
  fullScreen = false 
}) {
  if (fullScreen) {
    return (
      <div className="simple-spinner-overlay">
        <div className={`simple-loading-spinner spinner-${size} spinner-fullscreen`}>
          <div className="orange-circle"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`simple-loading-spinner spinner-${size}`}>
      <div className="orange-circle"></div>
    </div>
  );
}
