// Alternative IPFS implementations for NFT storage
// Optimized for blockchain - small metadata, efficient storage

// Helper function for Unicode-safe base64 encoding
const base64Encode = (str) => {
  return btoa(unescape(encodeURIComponent(str)));
};

const base64Decode = (str) => {
  return decodeURIComponent(escape(atob(str)));
};

// Option 1: Pinata IPFS Service (Free tier available)
export const uploadToPinata = async (file) => {
  // This would require Pinata API key - showing structure for future implementation
  console.log('Pinata IPFS upload would be implemented here');
  throw new Error('Pinata integration not configured');
};

// Option 2: Web3.Storage (Free and decentralized)
export const uploadToWeb3Storage = async (file) => {
  // This would require Web3.Storage API - showing structure for future implementation
  console.log('Web3.Storage upload would be implemented here');
  throw new Error('Web3.Storage integration not configured');
};

// Option 3: NFT.Storage (Free for NFTs)
export const uploadToNFTStorage = async (file) => {
  console.log('NFT.Storage upload would be implemented here');
  throw new Error('NFT.Storage integration not configured');
};

// Optimized local storage for development (smaller data)
export const uploadToDataURL = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        
        // For blockchain storage, we need much smaller data
        // Generate a placeholder that represents the file without storing full data
        const fileInfo = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        };
        
        // Create a deterministic placeholder based on file properties
        const fileHash = btoa(JSON.stringify(fileInfo)).substring(0, 16);
        const placeholderUrl = `https://via.placeholder.com/400x400/6366f1/ffffff?text=${encodeURIComponent(file.name.substring(0, 10))}`;
        
        console.log('File processed for blockchain storage (optimized size)');
        resolve(placeholderUrl);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

// Main upload function optimized for blockchain storage
export const uploadFileToIPFS = async (file) => {
  console.log('🔄 Processing file for blockchain storage...');
  
  try {
    // For images, use data URL (reasonable size)
    if (file.type.startsWith('image/')) {
      // For images larger than 1MB, create a smaller version
      if (file.size > 1024 * 1024) {
        console.log('⚠️ Large image detected, creating optimized version...');
        return new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = () => {
            // Resize to maximum 400x400
            const maxSize = 400;
            let { width, height } = img;
            
            if (width > height) {
              if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            console.log('✅ Image optimized for blockchain storage');
            resolve(optimizedDataUrl);
          };
          
          img.onerror = () => {
            // Fallback to original if optimization fails
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read image'));
            reader.readAsDataURL(file);
          };
          
          // Load image for optimization
          const reader = new FileReader();
          reader.onload = (e) => { img.src = e.target.result; };
          reader.readAsDataURL(file);
        });
      } else {
        // Small image, use as-is
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            console.log('✅ Small image stored as data URL');
            resolve(e.target.result);
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
      }
    }
    
    // For video files, create a placeholder with video info
    if (file.type.startsWith('video/')) {
      console.log('🎬 Creating video placeholder for blockchain storage...');
      const videoInfo = {
        name: file.name.substring(0, 20),
        size: Math.round(file.size / (1024 * 1024)) + 'MB',
        type: 'video',
        duration: 'Video NFT'
      };
      
      // Create a simple SVG placeholder for videos with proper encoding
      const svgContent = `
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="#1a1a2e"/>
          <circle cx="200" cy="130" r="30" fill="#6366f1"/>
          <polygon points="190,120 190,140 210,130" fill="white"/>
          <text x="200" y="180" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">
            📹 ${videoInfo.name}
          </text>
          <text x="200" y="200" text-anchor="middle" fill="#888" font-family="Arial, sans-serif" font-size="12">
            ${videoInfo.size} Video NFT
          </text>
        </svg>
      `.trim();
      
      const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
      console.log('✅ Video placeholder created:', dataUrl.substring(0, 100) + '...');
      return dataUrl;
    }
    
    // For audio files, create a placeholder with audio info  
    if (file.type.startsWith('audio/')) {
      console.log('🎵 Creating audio placeholder for blockchain storage...');
      const audioInfo = {
        name: file.name.substring(0, 20),
        size: Math.round(file.size / (1024 * 1024)) + 'MB',
        type: 'audio'
      };
      
      // Create a simple SVG placeholder for audio with proper encoding
      const svgContent = `
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="#2d1b69"/>
          <circle cx="200" cy="130" r="30" fill="#8b5cf6"/>
          <circle cx="170" cy="130" r="8" fill="white"/>
          <circle cx="185" cy="130" r="12" fill="white"/>
          <circle cx="205" cy="130" r="16" fill="white"/>
          <circle cx="225" cy="130" r="10" fill="white"/>
          <text x="200" y="180" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">
            🎵 ${audioInfo.name}
          </text>
          <text x="200" y="200" text-anchor="middle" fill="#888" font-family="Arial, sans-serif" font-size="12">
            ${audioInfo.size} Audio NFT
          </text>
        </svg>
      `.trim();
      
      const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
      console.log('✅ Audio placeholder created:', dataUrl.substring(0, 100) + '...');
      return dataUrl;
    }
    
    // For other file types, create a generic placeholder
    const fileInfo = {
      name: file.name.substring(0, 20),
      size: Math.round(file.size / 1024) + 'KB',
      type: file.type.split('/')[0] || 'file'
    };
    
    const placeholderUrl = `https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(fileInfo.type + ' NFT')}`;
    console.log('✅ Generic file placeholder created');
    return placeholderUrl;
    
  } catch (error) {
    console.log('❌ File processing failed:', error.message);
    return `https://via.placeholder.com/400x300?text=NFT`;
  }
};

// Blockchain-optimized metadata with dual storage
export const uploadJSONToIPFS = async (jsonData, originalFileUrl = null) => {
  try {
    console.log('📝 Creating blockchain-optimized metadata with playback support...');
    
    // Create minimal metadata for blockchain storage
    const optimizedMetadata = {
      name: jsonData.name || 'Untitled NFT',
      description: jsonData.description || 'NFT created on marketplace',
      image: jsonData.image, // This is the optimized placeholder
      // Add original media URL for playback if available
      ...(originalFileUrl && { 
        original_media: originalFileUrl,
        media_type: originalFileUrl.startsWith('data:video/') ? 'video' : 
                   originalFileUrl.startsWith('data:audio/') ? 'audio' : 'image'
      }),
      attributes: [
        {
          trait_type: "Type",
          value: "Marketplace NFT"
        },
        {
          trait_type: "Created",
          value: new Date().toISOString().split('T')[0]
        },
        ...(originalFileUrl && originalFileUrl.startsWith('data:video/') ? [{
          trait_type: "Media Type",
          value: "Video"
        }] : []),
        ...(originalFileUrl && originalFileUrl.startsWith('data:audio/') ? [{
          trait_type: "Media Type", 
          value: "Audio"
        }] : [])
      ]
    };
    
    // Create a much smaller data URL
    const jsonString = JSON.stringify(optimizedMetadata);
    const base64Data = base64Encode(jsonString);
    const dataUrl = `data:application/json;base64,${base64Data}`;
    
    console.log(`✅ Metadata optimized (${jsonString.length} chars) with playback support`);
    return dataUrl;
  } catch (error) {
    console.error('❌ Error creating metadata:', error);
    throw error;
  }
};

// Fetch data with support for different URL types
export const fetchFromIPFS = async (ipfsPath) => {
  try {
    if (ipfsPath.startsWith('data:application/json;base64,')) {
      const base64Data = ipfsPath.replace('data:application/json;base64,', '');
      const jsonString = base64Decode(base64Data);
      return JSON.parse(jsonString);
    } else if (ipfsPath.startsWith('data:')) {
      const response = await fetch(ipfsPath);
      return await response.json();
    } else if (ipfsPath.startsWith('http')) {
      const response = await fetch(ipfsPath);
      return await response.json();
    } else {
      throw new Error('Unsupported URL format');
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw error;
  }
};

// Development mode detection
export const isDevelopmentMode = () => {
  return process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
};

export default {
  uploadFileToIPFS,
  uploadJSONToIPFS,
  fetchFromIPFS,
  isDevelopmentMode
}; 