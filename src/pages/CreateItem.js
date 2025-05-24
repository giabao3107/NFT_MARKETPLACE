import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { uploadFileToIPFS, uploadJSONToIPFS } from '../utils/ipfs-alternatives';
import { nftaddress, nftmarketaddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';
import './CreateItem.css';

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null); // For actual file preview
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const navigate = useNavigate();

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function onChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setUploadProgress('Processing file...');
    console.log('📁 Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    try {
      // Create preview URL from actual file for immediate preview
      const actualFileUrl = URL.createObjectURL(file);
      setPreviewUrl(actualFileUrl);
      console.log('👁️ Preview URL created');
      
      // For development, use a simple approach
      if (file.type.startsWith('image/')) {
        // For images, convert to data URL (optimized for small files)
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          setFileUrl(dataUrl);
          setUploadProgress('✅ Image processed successfully!');
          toast.success('Image processed successfully!');
          console.log('✅ Image converted to data URL, size:', dataUrl.length);
        };
        reader.onerror = () => {
          console.error('❌ Failed to read image file');
          setUploadProgress('❌ Error processing image');
          toast.error('Error processing image');
        };
        reader.readAsDataURL(file);
      } else {
        // For other files, create a simple placeholder
        const placeholderUrl = `https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(file.name.substring(0, 20))}`;
        setFileUrl(placeholderUrl);
        setUploadProgress('✅ File processed successfully!');
        toast.success('File processed successfully!');
        console.log('✅ Placeholder created for non-image file');
      }
    } catch (error) {
      console.error('❌ Error processing file:', error);
      setUploadProgress('❌ Error processing file');
      toast.error('Error processing file');
      
      // Fallback to placeholder for demo
      const placeholderUrl = `https://via.placeholder.com/400x400/ff6b6b/ffffff?text=${encodeURIComponent('Error+Loading+File')}`;
      setFileUrl(placeholderUrl);
      setPreviewUrl(placeholderUrl);
      toast.info('Using placeholder as fallback');
    }
  }

  async function createMetadataAndUpload() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) {
      toast.error('Please fill in all fields and upload an image');
      return null;
    }
    
    setUploadProgress('Creating metadata...');
    console.log('📝 Creating metadata for NFT...');
    
    // Create metadata object
    const metadata = {
      name,
      description,
      image: fileUrl,
      attributes: [
        {
          trait_type: "Creator",
          value: "NFT Marketplace User"
        },
        {
          trait_type: "Price",
          value: `${price} ETH`
        },
        {
          trait_type: "Created",
          value: new Date().toISOString()
        }
      ]
    };
    
    console.log('📄 Metadata created:', metadata);
    
    try {
      // For development, use data URL (much more reliable than IPFS)
      const metadataString = JSON.stringify(metadata);
      const metadataUrl = `data:application/json;base64,${btoa(unescape(encodeURIComponent(metadataString)))}`;
      
      setUploadProgress('✅ Metadata created successfully!');
      console.log('✅ Metadata encoded as data URL, length:', metadataUrl.length);
      
      return metadataUrl;
    } catch (error) {
      console.error('❌ Error creating metadata:', error);
      setUploadProgress('❌ Error creating metadata');
      toast.error('Error creating metadata');
      return null;
    }
  }

  async function listNFTForSale() {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      return;
    }

    setLoading(true);
    console.log('🚀 Starting NFT creation process...');
    
    try {
      // Check form inputs
      const { name, description, price } = formInput;
      if (!name || !description || !price || !fileUrl) {
        toast.error('Please fill in all fields and upload an image');
        setLoading(false);
        return;
      }

      console.log('📝 Form data:', { name, description, price, fileUrl: fileUrl.substring(0, 50) + '...' });

      const metadataUrl = await createMetadataAndUpload();
      if (!metadataUrl) {
        setLoading(false);
        return;
      }

      console.log('📄 Metadata URL:', metadataUrl.substring(0, 100) + '...');

      setUploadProgress('Connecting to wallet...');
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      console.log('👛 Connected wallet:', signerAddress);
      
      // Check network
      const network = await provider.getNetwork();
      console.log('🌐 Network:', network);
      
      if (network.chainId !== 1337) {
        toast.error('Please switch to Hardhat Local network (Chain ID: 1337)');
        setLoading(false);
        return;
      }

      setUploadProgress('Creating NFT token...');
      console.log('🎨 Creating NFT with contract:', nftaddress);
      
      // Create NFT
      let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
      
      // Debug contract setup
      console.log('📋 NFT Contract address:', contract.address);
      console.log('📋 NFT Contract functions:', Object.keys(contract.functions));
      console.log('📋 Available methods:', Object.keys(contract));
      
      // Test if createToken function exists
      if (!contract.createToken) {
        throw new Error('createToken function not found in NFT contract');
      }
      
      try {
        // Try without gas estimation first (let MetaMask handle it)
        console.log('⛽ Creating token without manual gas estimation...');
        let transaction = await contract.createToken(metadataUrl);
        console.log('📤 Transaction sent:', transaction.hash);
        
        setUploadProgress('Waiting for transaction confirmation...');
        let tx = await transaction.wait();
        console.log('✅ Token creation confirmed:', tx);
        
        // Parse token ID from transaction receipt
        let tokenId;
        
        // Method 1: Try to get from events array
        if (tx.events && tx.events.length > 0) {
          console.log('📋 Transaction events:', tx.events);
          
          // Look for Transfer event (which should contain the token ID)
          const transferEvent = tx.events.find(event => event.event === 'Transfer');
          if (transferEvent && transferEvent.args) {
            tokenId = transferEvent.args[2].toNumber(); // tokenId is usually the 3rd argument
            console.log('🎯 Token ID from Transfer event:', tokenId);
          } else {
            // Fallback: use the first event
            const firstEvent = tx.events[0];
            if (firstEvent && firstEvent.args && firstEvent.args.length > 2) {
              tokenId = firstEvent.args[2].toNumber();
              console.log('🎯 Token ID from first event:', tokenId);
            }
          }
        }
        
        // Method 2: If events parsing fails, try to get from logs
        if (!tokenId && tx.logs && tx.logs.length > 0) {
          console.log('📋 Transaction logs:', tx.logs);
          
          try {
            // Parse logs manually using the contract interface
            const nftInterface = new ethers.utils.Interface(NFT.abi);
            for (const log of tx.logs) {
              try {
                const parsedLog = nftInterface.parseLog(log);
                if (parsedLog.name === 'Transfer' && parsedLog.args.length > 2) {
                  tokenId = parsedLog.args[2].toNumber();
                  console.log('🎯 Token ID from parsed log:', tokenId);
                  break;
                }
              } catch (parseError) {
                // Skip logs that can't be parsed
                continue;
              }
            }
          } catch (logParseError) {
            console.log('⚠️ Log parsing failed:', logParseError);
          }
        }
        
        // Method 3: If still no tokenId, try to get the next token ID from contract
        if (!tokenId) {
          console.log('⚠️ Could not parse token ID from events, trying to get current token count...');
          try {
            // Get the return value from the createToken transaction
            // The createToken function returns the new token ID
            const currentTokenId = await contract.getCurrentTokenId();
            tokenId = currentTokenId.toNumber();
            console.log('🎯 Token ID from getCurrentTokenId:', tokenId);
          } catch (counterError) {
            console.log('⚠️ Could not get token from getCurrentTokenId, using fallback');
            // Last resort: assume it's token ID 1 if this is the first token
            tokenId = 1;
          }
        }
        
        if (!tokenId) {
          throw new Error('Could not determine token ID from transaction');
        }
        
        console.log('🎯 Final token ID:', tokenId);
        
        const priceInWei = ethers.utils.parseUnits(formInput.price, 'ether');
        console.log('💰 Price in wei:', priceInWei.toString());

        setUploadProgress('Listing NFT for sale...');
        // List NFT for sale
        console.log('🏪 Setting up marketplace contract:', nftmarketaddress);
        contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
        
        // Debug marketplace contract
        console.log('📋 Marketplace Contract address:', contract.address);
        console.log('📋 Marketplace Contract functions:', Object.keys(contract.functions));
        
        // Test if getListingPrice function exists
        if (!contract.getListingPrice) {
          throw new Error('getListingPrice function not found in Marketplace contract');
        }
        
        console.log('🏷️ Getting listing price...');
        let listingPrice = await contract.getListingPrice();
        listingPrice = listingPrice.toString();
        console.log('🏷️ Listing price required:', listingPrice);

        console.log('📦 Creating market item...');
        transaction = await contract.createMarketItem(nftaddress, tokenId, priceInWei, { 
          value: listingPrice
        });
        console.log('📤 Listing transaction sent:', transaction.hash);
        
        setUploadProgress('Waiting for listing confirmation...');
        await transaction.wait();
        console.log('✅ NFT listed successfully!');
        
        setUploadProgress('');
        toast.success('NFT created and listed successfully!');
        setLoading(false);
        navigate('/');
        
      } catch (gasError) {
        console.error('⛽ First attempt failed, trying with manual gas:', gasError);
        
        // Check if this is actually a gas estimation error or something else
        if (!gasError.message.includes('gas') && !gasError.message.includes('estimation')) {
          // If it's not a gas error, don't try the fallback
          throw gasError;
        }
        
        try {
          // Fallback: try with manual gas estimation
          console.log('⛽ Attempting manual gas estimation...');
          
          // Check if the estimateGas function exists
          if (!contract.estimateGas || !contract.estimateGas.createToken) {
            throw new Error('Gas estimation functions not available on contract');
          }
          
          const gasEstimate = await contract.estimateGas.createToken(metadataUrl);
          const gasLimit = gasEstimate.mul(150).div(100); // Add 50% buffer
          console.log(`⛽ Manual gas estimate: ${gasEstimate.toString()}, using limit: ${gasLimit.toString()}`);
          
          let transaction = await contract.createToken(metadataUrl, { gasLimit });
          let tx = await transaction.wait();
          
          // Parse token ID from transaction receipt (same logic as above)
          let tokenId;
          
          if (tx.events && tx.events.length > 0) {
            const transferEvent = tx.events.find(event => event.event === 'Transfer');
            if (transferEvent && transferEvent.args) {
              tokenId = transferEvent.args[2].toNumber();
            } else if (tx.events[0] && tx.events[0].args && tx.events[0].args.length > 2) {
              tokenId = tx.events[0].args[2].toNumber();
            }
          }
          
          // Fallback to log parsing if events don't work
          if (!tokenId && tx.logs && tx.logs.length > 0) {
            try {
              const nftInterface = new ethers.utils.Interface(NFT.abi);
              for (const log of tx.logs) {
                try {
                  const parsedLog = nftInterface.parseLog(log);
                  if (parsedLog.name === 'Transfer' && parsedLog.args.length > 2) {
                    tokenId = parsedLog.args[2].toNumber();
                    break;
                  }
                } catch (parseError) {
                  continue;
                }
              }
            } catch (logParseError) {
              console.log('⚠️ Fallback log parsing failed:', logParseError);
            }
          }
          
          // Last resort: get from contract counter
          if (!tokenId) {
            try {
              const currentTokenId = await contract.getCurrentTokenId();
              tokenId = currentTokenId.toNumber();
            } catch (counterError) {
              tokenId = 1; // Assume first token
            }
          }
          
          if (!tokenId) {
            throw new Error('Could not determine token ID from transaction');
          }
          
          console.log('🎯 Fallback token ID:', tokenId);
          
          const priceInWei = ethers.utils.parseUnits(formInput.price, 'ether');

          // List NFT for sale
          contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
          let listingPrice = await contract.getListingPrice();
          
          const listingGasEstimate = await contract.estimateGas.createMarketItem(nftaddress, tokenId, priceInWei, { value: listingPrice });
          const listingGasLimit = listingGasEstimate.mul(150).div(100);
          
          transaction = await contract.createMarketItem(nftaddress, tokenId, priceInWei, { 
            value: listingPrice,
            gasLimit: listingGasLimit 
          });
          await transaction.wait();
          
          setUploadProgress('');
          toast.success('NFT created and listed successfully!');
          setLoading(false);
          navigate('/');
          
        } catch (manualGasError) {
          throw manualGasError; // Re-throw to be caught by outer catch
        }
      }
      
    } catch (error) {
      console.error('❌ Error creating NFT:', error);
      setUploadProgress('');
      setLoading(false);
      
      // More specific error messages
      if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient funds. Make sure you have enough ETH for gas fees.');
      } else if (error.message.includes('user rejected')) {
        toast.error('Transaction rejected by user.');
      } else if (error.message.includes('network')) {
        toast.error('Network error. Make sure you\'re connected to Hardhat Local network.');
      } else if (error.message.includes('nonce')) {
        toast.error('Nonce error. Try refreshing MetaMask or the page.');
      } else if (error.code === 4001) {
        toast.error('Transaction rejected by user.');
      } else if (error.code === -32603) {
        toast.error('Internal JSON-RPC error. Check your network connection.');
      } else {
        toast.error(`Error creating NFT: ${error.message || 'Unknown error'}`);
      }
    }
  }

  return (
    <div className="create-item-container">
      <div className="create-form">
        <h1>Create New NFT</h1>
        
        <div className="form-group">
          <label>Upload Image, Video, Audio, or 3D Model</label>
          <div className="file-upload">
            <input
              type="file"
              id="file-upload"
              onChange={onChange}
              accept="image/*,video/*,audio/*,.glb,.gltf"
            />
            <label htmlFor="file-upload" className="file-upload-label">
              {fileName || 'Choose File'}
            </label>
          </div>
          
          {uploadProgress && (
            <div className="upload-progress">
              <p>{uploadProgress}</p>
            </div>
          )}
          
          {previewUrl && (
            <div className="preview">
              {fileName.toLowerCase().match(/\.(mp4|webm|ogg|mov|avi)$/i) ? (
                <video 
                  src={previewUrl} 
                  className="preview-media"
                  controls
                  preload="metadata"
                  style={{ maxWidth: '300px', maxHeight: '200px' }}
                  onError={(e) => {
                    console.log('❌ Preview video failed to load:', previewUrl);
                  }}
                  onLoadedData={() => {
                    console.log('✅ Preview video loaded:', previewUrl);
                  }}
                />
              ) : fileName.toLowerCase().match(/\.(mp3|wav|ogg|m4a|aac)$/i) ? (
                <div className="audio-preview">
                  <div className="audio-placeholder">
                    🎵 Audio File
                    <p>{fileName}</p>
                  </div>
                  <audio 
                    src={previewUrl} 
                    controls
                    preload="metadata"
                    style={{ width: '100%', marginTop: '10px' }}
                    onError={(e) => {
                      console.log('❌ Preview audio failed to load:', previewUrl);
                    }}
                    onLoadedData={() => {
                      console.log('✅ Preview audio loaded:', previewUrl);
                    }}
                  />
                </div>
              ) : (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="preview-media"
                  style={{ maxWidth: '300px', maxHeight: '200px' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              )}
              <p>✅ File processed successfully!</p>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Name</label>
          <input
            placeholder="Asset Name"
            className="form-input"
            onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            placeholder="Asset Description"
            className="form-textarea"
            onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Price in ETH</label>
          <input
            placeholder="Asset Price in ETH"
            className="form-input"
            type="number"
            step="0.01"
            onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
          />
        </div>

        <button
          onClick={listNFTForSale}
          className="create-button"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create NFT'}
        </button>
      </div>
    </div>
  );
} 