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
    
    try {
      // Create preview URL from actual file for immediate preview
      const actualFileUrl = URL.createObjectURL(file);
      setPreviewUrl(actualFileUrl);
      
      // Upload optimized version for blockchain storage
      const ipfsUrl = await uploadFileToIPFS(file);
      setFileUrl(ipfsUrl);
      setUploadProgress('File processed successfully!');
      toast.success('File processed successfully!');
    } catch (error) {
      console.log('Error processing file: ', error);
      setUploadProgress('Error processing file');
      toast.error('Error processing file');
      
      // Fallback to placeholder for demo
      const placeholderUrl = `https://via.placeholder.com/400x400?text=${encodeURIComponent(file.name)}`;
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
        }
      ]
    };
    
    try {
      setUploadProgress('Uploading metadata to IPFS...');
      // Upload metadata to IPFS with original media for playback
      const metadataUrl = await uploadJSONToIPFS(metadata, previewUrl);
      setUploadProgress('Metadata uploaded successfully!');
      return metadataUrl;
    } catch (error) {
      console.error('Error uploading metadata:', error);
      setUploadProgress('Error uploading metadata');
      toast.error('Error uploading metadata to IPFS');
      
      // Fallback to data URL for demo
      const metadataString = JSON.stringify(metadata);
      const metadataUrl = `data:application/json;base64,${btoa(metadataString)}`;
      toast.info('Using data URL as fallback for metadata');
      return metadataUrl;
    }
  }

  async function listNFTForSale() {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      return;
    }

    setLoading(true);
    
    try {
      const metadataUrl = await createMetadataAndUpload();
      if (!metadataUrl) {
        setLoading(false);
        return;
      }

      setUploadProgress('Connecting to wallet...');
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      setUploadProgress('Creating NFT token...');
      // Create NFT
      let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
      
      // Estimate gas for the transaction
      const gasEstimate = await contract.estimateGas.createToken(metadataUrl);
      const gasLimit = gasEstimate.mul(120).div(100); // Add 20% buffer
      console.log(`Gas estimate: ${gasEstimate.toString()}, using limit: ${gasLimit.toString()}`);
      
      let transaction = await contract.createToken(metadataUrl, { gasLimit });
      let tx = await transaction.wait();
      let event = tx.events[0];
      let value = event.args[2];
      let tokenId = value.toNumber();
      
      const price = ethers.utils.parseUnits(formInput.price, 'ether');

      setUploadProgress('Listing NFT for sale...');
      // List NFT for sale
      contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      let listingPrice = await contract.getListingPrice();
      listingPrice = listingPrice.toString();

      // Estimate gas for listing transaction
      const listingGasEstimate = await contract.estimateGas.createMarketItem(nftaddress, tokenId, price, { value: listingPrice });
      const listingGasLimit = listingGasEstimate.mul(120).div(100); // Add 20% buffer
      console.log(`Listing gas estimate: ${listingGasEstimate.toString()}, using limit: ${listingGasLimit.toString()}`);

      transaction = await contract.createMarketItem(nftaddress, tokenId, price, { 
        value: listingPrice,
        gasLimit: listingGasLimit 
      });
      await transaction.wait();
      
      setUploadProgress('');
      toast.success('NFT created and listed successfully!');
      setLoading(false);
      navigate('/');
    } catch (error) {
      console.error(error);
      setUploadProgress('');
      toast.error('Error creating NFT');
      setLoading(false);
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