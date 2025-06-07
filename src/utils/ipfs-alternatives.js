// IPFS Alternative Solutions for NFT Marketplace - Images Only
// Fallback approach for file hosting when IPFS is unavailable

import { toast } from 'react-toastify';
import { PlaceholderService } from './placeholderService';
import { SUPPORTED_FORMATS, MAX_FILE_SIZE } from './constants';

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
        
        // Return the actual data URL for the image
        console.log('✅ File processed successfully - returning actual image data');
        resolve(dataUrl);
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
    console.log('📝 Creating blockchain-optimized metadata...');
    
    // Create metadata for blockchain storage with real image data
    const optimizedMetadata = {
      name: jsonData.name || 'Untitled NFT',
      description: jsonData.description || 'NFT created on marketplace',
      image: jsonData.image, // This should be the real image data URL
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
    
    // Log metadata details for debugging
    console.log('📋 Metadata details:', {
      name: optimizedMetadata.name,
      hasImage: !!optimizedMetadata.image,
      imageType: optimizedMetadata.image?.startsWith('data:') ? 'Data URL' : 'External URL',
      imageSize: optimizedMetadata.image?.length || 0
    });
    
    // Create a much smaller data URL
    const jsonString = JSON.stringify(optimizedMetadata);
    const base64Data = base64Encode(jsonString);
    const dataUrl = `data:application/json;base64,${base64Data}`;
    
    console.log(`✅ Metadata created (${jsonString.length} chars) with real image data`);
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

export const uploadToIPFSAlternative = async (file, onProgress) => {
  try {
    console.log('📁 Starting file upload:', file.name, file.size, 'bytes');
    
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Simulate upload progress
    const simulateProgress = () => {
      return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            resolve();
          }
          if (onProgress) onProgress(Math.floor(progress));
        }, 200);
      });
    };

    await simulateProgress();

    // Handle different file types - prioritize returning real data
    if (SUPPORTED_FORMATS.includes(file.type)) {
      console.log('✅ Processing supported image file with real data');
      return await processImageFile(file);
    } else if (file.type === 'application/json') {
      return await processJSONFile(file);
    } else {
      console.warn('Unsupported file type:', file.type);
      return getImagePlaceholder(file);
    }

  } catch (error) {
    console.error('❌ Upload failed:', error);
    
    // For JSON metadata files, create minimal metadata data URL instead of placeholder
    if (file.type === 'application/json') {
      console.log('🔄 Creating fallback metadata data URL...');
      try {
        const fallbackMetadata = {
          name: "NFT",
          description: "NFT created on marketplace", 
          image: PlaceholderService.getLocalPlaceholder(),
          error: "Metadata upload failed, using fallback"
        };
        const jsonString = JSON.stringify(fallbackMetadata);
        const dataUrl = `data:application/json;base64,${btoa(jsonString)}`;
        console.log('✅ Fallback metadata data URL created');
        return dataUrl;
      } catch (metaError) {
        console.error('❌ Failed to create fallback metadata:', metaError);
      }
    }
    
    // For other files, use local placeholder
    return PlaceholderService.getLocalPlaceholder();
  }
};

const processImageFile = async (file) => {
  try {
    console.log('🖼️ Processing image file:', file.name, file.type, `${Math.round(file.size/1024)}KB`);
    
    // Convert to data URL for immediate use - return the actual image
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        console.log('✅ Image processed successfully as data URL');
        resolve(dataUrl);
      };
      
      reader.onerror = () => {
        console.error('❌ Failed to read image file');
        reject(new Error('Failed to process image'));
      };
      
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('❌ Error processing image:', error);
    // Only use placeholder if there's a real error
    throw error;
  }
};

const processJSONFile = async (file) => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          console.log('📋 JSON content length:', content.length);
          
          // Use base64Encode for Unicode-safe encoding
          const dataUrl = `data:application/json;base64,${base64Encode(content)}`;
          console.log('✅ JSON processed as data URL with Unicode support');
          resolve(dataUrl);
        } catch (parseError) {
          console.error('❌ Error processing JSON content:', parseError);
          reject(parseError);
        }
      };
      
      reader.onerror = () => {
        console.error('❌ Failed to read JSON file');
        reject(new Error('Failed to read JSON file'));
      };
      
      reader.readAsText(file, 'utf-8'); // Ensure UTF-8 encoding
    });
  } catch (error) {
    console.error('❌ Error processing JSON:', error);
    // Create a proper fallback with Unicode support
    const fallbackMetadata = {
      name: "NFT",
      description: "Metadata processing failed",
      image: PlaceholderService.getLocalPlaceholder(),
      error: "Failed to process metadata"
    };
    return `data:application/json;base64,${base64Encode(JSON.stringify(fallbackMetadata))}`;
  }
};

const getImagePlaceholder = (file) => {
  const tokenId = file.name ? file.name.length : Date.now();
  return PlaceholderService.getPlaceholder(400, 400, tokenId);
};

// Alternative upload methods for different scenarios
export const uploadImageToDataURL = async (file) => {
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    throw new Error('Unsupported image type');
  }
  
  return processImageFile(file);
};

export const createPlaceholderURL = (text = 'NFT', width = 400, height = 400) => {
  const tokenId = text.length || Date.now();
  return PlaceholderService.getPlaceholder(width, height, tokenId);
};

// Enhanced error handling and retry mechanism
export const uploadWithRetry = async (file, maxRetries = 3, onProgress) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📁 Upload attempt ${attempt}/${maxRetries} for:`, file.name);
      
      if (onProgress) {
        onProgress((attempt - 1) * (100 / maxRetries));
      }
      
      const result = await uploadToIPFSAlternative(file, (progress) => {
        const totalProgress = ((attempt - 1) * 100 + progress) / maxRetries;
        if (onProgress) onProgress(Math.floor(totalProgress));
      });
      
      console.log(`✅ Upload successful on attempt ${attempt}`);
      return result;
      
    } catch (error) {
      console.error(`❌ Upload attempt ${attempt} failed:`, error);
      lastError = error;
      
      if (attempt < maxRetries) {
        console.log(`🔄 Retrying in ${attempt} seconds...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
  }
  
  console.error('❌ All upload attempts failed, using fallback');
  toast.error(`Upload failed after ${maxRetries} attempts. Using placeholder.`);
  
  // For JSON metadata files, create data URL instead of external placeholder
  if (file.type === 'application/json') {
    console.log('🔄 Creating fallback metadata after retry failures...');
    try {
      const fallbackMetadata = {
        name: "NFT",
        description: "NFT created on marketplace",
        image: PlaceholderService.getLocalPlaceholder(),
        error: `Upload failed after ${maxRetries} attempts`
      };
      const jsonString = JSON.stringify(fallbackMetadata);
      return `data:application/json;base64,${btoa(jsonString)}`;
    } catch (metaError) {
      console.error('❌ Failed to create fallback metadata:', metaError);
    }
  }
  
  return PlaceholderService.getLocalPlaceholder();
};

// Test function to check placeholder service availability
export const testPlaceholderServices = async () => {
  try {
    const results = await PlaceholderService.testServices();
    console.log('📊 Placeholder service test results:', results);
    return results;
  } catch (error) {
    console.error('❌ Error testing placeholder services:', error);
    return [];
  }
};

// Validate file before upload
export const validateFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file selected');
    return errors;
  }
  
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
  
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    errors.push(`Unsupported file type: ${file.type}. Only JPG, PNG, GIF, WebP are supported.`);
  }
  
  return errors;
};

// Get file info for display
export const getFileInfo = (file) => {
  if (!file) return null;
  
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    readable: {
      size: formatFileSize(file.size),
      type: 'image',
      modified: new Date(file.lastModified).toLocaleDateString()
    }
  };
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default {
  uploadFileToIPFS,
  uploadJSONToIPFS,
  fetchFromIPFS,
  isDevelopmentMode,
  uploadToIPFSAlternative,
  uploadImageToDataURL,
  createPlaceholderURL,
  uploadWithRetry,
  testPlaceholderServices,
  validateFile,
  getFileInfo
}; 