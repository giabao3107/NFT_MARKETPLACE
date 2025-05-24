import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { nftaddress, nftmarketaddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';
import './CreateItem.css';

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      // For demo purposes, we'll create a placeholder URL
      // In a real app, you would upload to IPFS or another storage service
      const placeholderUrl = `https://via.placeholder.com/400x400?text=${encodeURIComponent(file.name)}`;
      setFileUrl(placeholderUrl);
      toast.info('File selected - using placeholder image for demo');
    } catch (error) {
      console.log('Error handling file: ', error);
      toast.error('Error handling file');
    }
  }

  async function createMetadataJSON() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) {
      toast.error('Please fill in all fields and upload an image');
      return null;
    }
    
    // Create metadata object
    const metadata = {
      name,
      description,
      image: fileUrl,
    };
    
    // For demo purposes, we'll create a data URL with the metadata
    // In a real app, you would upload to IPFS
    const metadataString = JSON.stringify(metadata);
    const metadataUrl = `data:application/json;base64,${btoa(metadataString)}`;
    
    return metadataUrl;
  }

  async function listNFTForSale() {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      return;
    }

    setLoading(true);
    
    try {
      const metadataUrl = await createMetadataJSON();
      if (!metadataUrl) {
        setLoading(false);
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Create NFT
      let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
      let transaction = await contract.createToken(metadataUrl);
      let tx = await transaction.wait();
      let event = tx.events[0];
      let value = event.args[2];
      let tokenId = value.toNumber();
      
      const price = ethers.utils.parseUnits(formInput.price, 'ether');

      // List NFT for sale
      contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      let listingPrice = await contract.getListingPrice();
      listingPrice = listingPrice.toString();

      transaction = await contract.createMarketItem(nftaddress, tokenId, price, { value: listingPrice });
      await transaction.wait();
      
      toast.success('NFT created and listed successfully!');
      setLoading(false);
      navigate('/');
    } catch (error) {
      console.error(error);
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
              Choose File (Demo Mode - Placeholder will be used)
            </label>
          </div>
          {fileUrl && (
            <div className="preview">
              <img src={fileUrl} alt="Preview" className="preview-image" />
              <p>Preview: Placeholder image for demo</p>
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
        
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <small>
            <strong>Demo Mode:</strong> This version uses placeholder images and data URLs for metadata storage. 
            In production, you would integrate with IPFS for decentralized storage.
          </small>
        </div>
      </div>
    </div>
  );
} 