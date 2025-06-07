// Language constants for unified UI text
export const UI_TEXT = {
  // Navigation
  EXPLORE: "Khám phá",
  CREATE: "Tạo NFT",
  MY_NFTS: "NFT của tôi",
  
  // Common buttons
  CREATE_NFT: "Tạo NFT",
  BUY_NOW: "Mua ngay",
  CONNECT_WALLET: "Kết nối ví",
  CHOOSE_FILE: "Chọn tệp",
  CREATING: "Đang tạo...",
  LOADING: "Đang tải...",
  
  // Home page
  HOME_HERO_TITLE: "Khám phá, thu thập và bán các NFT đặc biệt",
  HOME_HERO_SUBTITLE: "Thị trường NFT hàng đầu dành cho nghệ thuật số, vật sưu tập và nhiều hơn nữa",
  HOME_EMPTY_TITLE: "Chưa có NFT nào",
  HOME_EMPTY_SUBTITLE: "Hãy trở thành người đầu tiên tạo và bán NFT trên marketplace!",
  HOME_EXPLORE_BUTTON: "Khám phá marketplace",
  
  // Create page
  CREATE_TITLE: "Tạo NFT mới",
  CREATE_SUBTITLE: "Tạo và bán tác phẩm nghệ thuật số của bạn",
  CREATE_UPLOAD_TITLE: "Tải lên hình ảnh",
  CREATE_UPLOAD_DRAG: "Kéo thả hình ảnh vào đây hoặc",
  CREATE_UPLOAD_CLICK: "chọn hình ảnh",
  CREATE_UPLOAD_FORMATS: "Định dạng hỗ trợ: JPG, PNG, GIF, WebP (tối đa 5MB)",
  CREATE_NAME_LABEL: "Tên NFT",
  CREATE_NAME_PLACEHOLDER: "Nhập tên cho NFT của bạn",
  CREATE_DESCRIPTION_LABEL: "Mô tả",
  CREATE_DESCRIPTION_PLACEHOLDER: "Mô tả chi tiết về NFT của bạn",
  CREATE_PRICE_LABEL: "Giá bán (ETH)",
  CREATE_PRICE_PLACEHOLDER: "0.001",
  CREATE_SUCCESS: "NFT đã được tạo thành công!",
  CREATE_ERROR: "Có lỗi xảy ra khi tạo NFT",
  
  // My NFTs page
  MY_NFTS_TITLE: "NFT của tôi",
  MY_NFTS_EMPTY_TITLE: "Bạn chưa sở hữu NFT nào",
  MY_NFTS_EMPTY_SUBTITLE: "Bạn chưa sở hữu NFT nào. Hãy bắt đầu khám phá marketplace để mua NFT đầu tiên!",
  MY_NFTS_EXPLORE_BUTTON: "Khám phá marketplace",
  
  // Wallet
  WALLET_CONNECT_NEEDED: "Bạn cần kết nối ví để tạo NFT",
  WALLET_WRONG_NETWORK: "Vui lòng chuyển sang mạng Hardhat Local (Chain ID: 1337)",
  WALLET_INSTALL_METAMASK: "Vui lòng cài đặt MetaMask!",
  
  // Categories
  CATEGORY_ALL: "Tất cả",
  CATEGORY_ART: "Nghệ thuật",
  CATEGORY_PHOTOGRAPHY: "Nhiếp ảnh",
  CATEGORY_DIGITAL_ART: "Nghệ thuật số",
  CATEGORY_COLLECTIBLES: "Sưu tập",
  CATEGORY_GAMING: "Game",
  CATEGORY_MEMES: "Memes",
  
  // Stats
  STATS_TOTAL_ITEMS: "Tổng số NFT",
  STATS_FLOOR_PRICE: "Giá sàn",
  STATS_VOLUME: "Khối lượng giao dịch",
  
  // Loading states
  LOADING_NFTS: "Đang tải NFT...",
  LOADING_CREATING: "Đang tạo NFT...",
  LOADING_UPLOADING: "Đang tải lên...",
  
  // Error states
  ERROR_NETWORK: "Lỗi kết nối mạng",
  ERROR_CONTRACT: "Lỗi hợp đồng thông minh",
  ERROR_METAMASK: "Lỗi MetaMask"
};

// Currency conversion rates (should be updated from API in production)
export const CURRENCY_RATES = {
  USD: 2300, // 1 ETH = ~2300 USD
  VND: 56000000 // 1 ETH = ~56M VND
};

// Format currency helper
export const formatCurrency = (ethAmount, currency = 'USD') => {
  const amount = parseFloat(ethAmount) * CURRENCY_RATES[currency];
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  } else if (currency === 'VND') {
    return `${amount.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫`;
  }
  return amount.toLocaleString();
};

// File upload constants - Images only
export const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for images

export const NFT_CATEGORIES = [
  'Nghệ thuật',
  'Nhiếp ảnh', 
  'Nghệ thuật số',
  'Sưu tập',
  'Game',
  'Memes'
];

// Validation helpers
export const isValidImageFile = (file) => {
  return SUPPORTED_FORMATS.includes(file.type) && file.size <= MAX_FILE_SIZE;
};

export const getFileError = (file) => {
  if (!file) return 'Không có file được chọn';
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return 'Định dạng file không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, GIF, WebP';
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File quá lớn. Kích thước tối đa: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
  }
  return null;
};

// Address formatting
export const formatAddress = (address) => {
  if (!address) return 'Unknown';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatPrice = (price) => {
  return parseFloat(price).toFixed(3);
};