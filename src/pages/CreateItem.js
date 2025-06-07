import React, { useState, useContext } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { nftaddress, nftmarketaddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';
import { WalletContext } from '../App';
import { uploadToIPFSAlternative } from '../utils/ipfs-alternatives';
import { SUPPORTED_FORMATS, MAX_FILE_SIZE, NFT_CATEGORIES } from '../utils/constants';
import { PlaceholderService } from '../utils/placeholderService';
import { TransactionUtils } from '../utils/transactionUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import RichTextEditor from '../components/RichTextEditor';
import './CreateItem.css';

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({ 
    price: '', 
    name: '', 
    description: '',
    category: NFT_CATEGORIES[0] // Use first category from constants
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { account, connectWallet } = useContext(WalletContext);

  // File upload handling for images only
  async function onChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      toast.error('Chỉ hỗ trợ định dạng: JPG, PNG, GIF, WebP');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File quá lớn. Kích thước tối đa: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log('🔄 Starting upload for:', file.name, file.type, `${Math.round(file.size/1024)}KB`);
      
      // Create preview URL for immediate display
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload file and get the actual data URL
      const url = await uploadToIPFSAlternative(file, (progress) => {
        setUploadProgress(progress);
      });

      console.log('✅ Upload completed. URL type:', url?.startsWith('data:') ? 'Data URL' : 'External URL');
      setFileUrl(url);
      
      // Clean up object URL since we have the real data URL now
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(url);
      
      toast.success('Hình ảnh đã upload thành công!');
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      toast.error('Upload thất bại: ' + error.message);
      
      // Clean up on error
      setFileUrl(null);
      setPreviewUrl(null);
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  // Handle file upload errors
  const handleFileError = () => {
    console.log('🚨 File preview error for uploaded image');
    const tokenId = Date.now();
    const errorPlaceholder = PlaceholderService.getErrorPlaceholder();
    setPreviewUrl(errorPlaceholder);
  };

  // Debug function to check current file state
  const debugFileState = () => {
    console.log('🔍 Current file state debug:');
    console.log('  - selectedFile:', selectedFile?.name, selectedFile?.size, 'bytes');
    console.log('  - previewUrl:', previewUrl?.startsWith('data:') ? `Data URL (${previewUrl.length} chars)` : previewUrl);
    console.log('  - fileUrl:', fileUrl?.startsWith('data:') ? `Data URL (${fileUrl.length} chars)` : fileUrl);
    console.log('  - isUploading:', isUploading);
  };

  async function listNFTForSale() {
    if (!account) {
      await connectWallet();
      return;
    }

    if (!formInput.name || !formInput.description || !formInput.price) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (!fileUrl) {
      toast.error('Vui lòng upload hình ảnh!');
      return;
    }

    setIsCreating(true);
    
    try {
      const { name, description, price, category } = formInput;
    
    // Create metadata object
    const metadata = {
      name,
      description,
      image: fileUrl,
        category,
      attributes: [
        {
            trait_type: "Category", 
            value: category
          },
          {
            trait_type: "Creator",
            value: account
          }
        ]
      };
      
      // Debug log for metadata
      console.log('📋 Creating NFT with metadata:', {
        name: metadata.name,
        description: metadata.description.substring(0, 100) + '...',
        imageType: metadata.image?.startsWith('data:') ? 'Data URL' : 'URL',
        imageSize: metadata.image?.length,
        category: metadata.category
      });

      // Upload metadata
      console.log('📤 Starting metadata upload...');
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      console.log('📋 Metadata blob created:', {
        size: metadataBlob.size,
        type: metadataBlob.type
      });
      
      const metadataUrl = await uploadToIPFSAlternative(
        metadataBlob,
        (progress) => console.log('📊 Metadata upload progress:', progress)
      );
      
      console.log('✅ Metadata upload completed:', {
        urlType: metadataUrl?.startsWith('data:') ? 'Data URL' : 'External URL',
        urlLength: metadataUrl?.length,
        urlPreview: metadataUrl?.substring(0, 100) + '...'
      });

      // Create NFT
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const nftContract = new ethers.Contract(nftaddress, NFT.abi, signer);
      const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

      // Get listing price
      const listingPrice = await marketContract.getListingPrice();
      const priceInWei = ethers.utils.parseUnits(price, 'ether');

      // Create token
      const transaction = await nftContract.createToken(metadataUrl);
      const tx = await transaction.wait();
      
      const event = tx.events[0];
      const tokenId = event.args[2].toNumber();
      
      // Add create token to activity history
      const tokenActivity = {
        type: 'CREATE_TOKEN',
        txHash: tx.transactionHash,
        timestamp: Date.now(),
        tokenId: tokenId,
        name: name,
        address: account,
        status: 'success'
      };
      
      // Save to localStorage for activity tracking
      const existingActivity = JSON.parse(localStorage.getItem('nft_activity') || '[]');
      existingActivity.unshift(tokenActivity);
      localStorage.setItem('nft_activity', JSON.stringify(existingActivity.slice(0, 50)));

      // List on marketplace
      const listingTransaction = await marketContract.createMarketItem(
        nftaddress, 
        tokenId, 
        priceInWei,
        { value: listingPrice }
      );
      
      const listingTx = await listingTransaction.wait();
      
      // Add create market item to activity history
      const marketActivity = {
        type: 'CREATE_MARKET_ITEM',
        txHash: listingTx.transactionHash,
        timestamp: Date.now(),
        tokenId: tokenId,
        name: name,
        price: price,
        address: account,
        status: 'success'
      };
      
      existingActivity.unshift(marketActivity);
      localStorage.setItem('nft_activity', JSON.stringify(existingActivity.slice(0, 50)));
      
      toast.success(`NFT đã tạo thành công! Token ID: ${tokenId}`);
      
      // Reset form
      updateFormInput({ price: '', name: '', description: '', category: NFT_CATEGORIES[0] });
      setFileUrl(null);
      setPreviewUrl(null);
      setSelectedFile(null);
      
      // Redirect to home page after successful creation
      setTimeout(() => {
        window.location.href = '/';
      }, 2000); // Wait 2 seconds for user to see success message
      
    } catch (error) {
      console.error('Error creating NFT:', error);
      toast.error('Lỗi tạo NFT: ' + (error.message || 'Unknown error'));
    } finally {
      setIsCreating(false);
    }
  }

  if (!account) {
    return (
      <div className="create-item-container-new">
        <div className="connect-wallet-section-new">
          <div className="connect-hero">
            <div className="connect-icon">🔗</div>
            <h2>Kết nối ví để bắt đầu</h2>
            <p>Bạn cần kết nối ví crypto để tạo và bán NFT trên marketplace</p>
            
            <div className="wallet-features">
              <div className="feature-item">
                <span className="feature-icon">🔐</span>
                <span>An toàn & bảo mật</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Giao dịch nhanh chóng</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💎</span>
                <span>Tạo NFT miễn phí</span>
              </div>
            </div>
            
            <button onClick={connectWallet} className="connect-button-new">
              <span className="btn-icon">🚀</span>
              Kết nối ví MetaMask
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-item-container-new">
      {/* Header Section */}
      <div className="create-header-new">
        <div className="header-content">
          <div className="header-badge">
            <span className="badge-icon">✨</span>
            <span>Tạo NFT mới</span>
          </div>
          
          <h1 className="header-title">
            Biến ý tưởng thành&nbsp;
            <span className="title-highlight">tài sản số</span>
          </h1>
          
          <p className="header-description">
            Tạo, sưu tầm và bán những tác phẩm nghệ thuật số độc đáo của bạn trên blockchain
          </p>
        </div>
      </div>

      {/* Main Form */}
      <div className="create-form-new">
        <div className="form-container">
          <div className="form-grid">
            {/* Left Column - Image Upload */}
            <div className="upload-column">
              <div className="upload-section-new">
                <h3 className="section-title">
                  <span className="title-icon">🖼️</span>
                  Tải lên tác phẩm
                </h3>
                
                <div className="upload-area-new">
                  <input
                    type="file"
                    id="file-upload-new"
                    accept={SUPPORTED_FORMATS.join(',')}
                    onChange={onChange}
                    disabled={isUploading}
                    className="file-input-hidden"
                  />
                  
                  {!previewUrl && !isUploading && (
                    <label htmlFor="file-upload-new" className="upload-dropzone">
                      <div className="dropzone-content">
                        <div className="upload-icon-large">📸</div>
                        <h4>Kéo thả file vào đây</h4>
                        <p>hoặc <span className="upload-link">click để chọn file</span></p>
                        <div className="supported-formats">
                          <span className="format-badge">JPG</span>
                          <span className="format-badge">PNG</span>
                          <span className="format-badge">GIF</span>
                          <span className="format-badge">WebP</span>
                        </div>
                        <small>Tối đa 5MB</small>
                      </div>
                    </label>
                  )}
                  
                  {isUploading && (
                    <div className="upload-progress-new">
                      <div className="progress-spinner">
                        <LoadingSpinner size="large" />
                      </div>
                      <h4>Đang tải lên...</h4>
                      <p>{uploadProgress}% hoàn thành</p>
                      <div className="progress-bar-new">
                        <div 
                          className="progress-fill-new" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {previewUrl && !isUploading && (
                    <div className="preview-container-new">
                      <div className="preview-image-wrapper">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          onError={handleFileError}
                          className="preview-image-new"
                        />
                        <div className="preview-overlay">
                          <button 
                            type="button"
                            className="change-image-btn"
                            onClick={() => {
                              setPreviewUrl(null);
                              setFileUrl(null);
                              setSelectedFile(null);
                            }}
                          >
                            🔄 Thay đổi ảnh
                          </button>
                        </div>
                      </div>
                      
                      {fileUrl && (
                        <div className="upload-success">
                          <span className="success-icon">✅</span>
                          <span>Tải lên thành công!</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="details-column">
              <div className="form-section-new">
                <h3 className="section-title">
                  <span className="title-icon">📝</span>
                  Chi tiết NFT
                </h3>
                
                <div className="form-fields">
                  <div className="field-group">
                    <label className="field-label">
                      <span className="label-text">Tên NFT</span>
                      <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="field-input"
                      placeholder="VD: Siêu phẩm nghệ thuật #001"
                      value={formInput.name}
                      onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">
                      <span className="label-text">Mô tả</span>
                      <span className="required">*</span>
                    </label>
                    <RichTextEditor
                      placeholder="Kể câu chuyện đằng sau tác phẩm của bạn..."
                      value={formInput.description}
                      onChange={(value) => updateFormInput({ ...formInput, description: value })}
                      className="field-editor"
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">
                      <span className="label-text">Danh mục</span>
                    </label>
                    <select 
                      className="field-select"
                      value={formInput.category}
                      onChange={e => updateFormInput({ ...formInput, category: e.target.value })}
                    >
                      {NFT_CATEGORIES.map(category => (
                        <option key={category} value={category}>
                          {category === 'Art' ? '🎨 Nghệ thuật' :
                           category === 'Music' ? '🎵 Âm nhạc' :
                           category === 'Gaming' ? '🎮 Game' :
                           category === 'Sports' ? '⚽ Thể thao' :
                           category === 'Photography' ? '📸 Nhiếp ảnh' :
                           category}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="field-group">
                    <label className="field-label">
                      <span className="label-text">Giá bán</span>
                      <span className="required">*</span>
                    </label>
                    <div className="price-input-wrapper">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        className="field-input price-input"
                        placeholder="0.001"
                        value={formInput.price}
                        onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                      />
                      <span className="currency-label">ETH</span>
                    </div>
                    {formInput.price && (
                      <div className="price-estimate">
                        ≈ ${(parseFloat(formInput.price) * 2500).toLocaleString()} USD
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="action-section-new">
            <div className="action-info">
              <div className="info-card-new">
                <div className="info-icon">💡</div>
                <div className="info-content">
                  <h4>Phí tạo NFT</h4>
                  <p>Phí gas + 0.01 ETH phí đăng bán trên marketplace</p>
                </div>
              </div>
            </div>
            
            <button
              className="create-button-new"
              onClick={listNFTForSale}
              disabled={isCreating || isUploading || !fileUrl || !formInput.name || !formInput.description || !formInput.price}
            >
              {isCreating ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Đang tạo NFT...</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  <span>Tạo & Liệt kê NFT</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 