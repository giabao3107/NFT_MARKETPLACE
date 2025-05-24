# 🎨 NFT Marketplace - Sàn Giao Dịch NFT

## ✨ Tính Năng Chính

### 🖼️ Quản Lý NFT Đa Phương Tiện
- **Hỗ trợ nhiều định dạng**: Images, Videos (MP4, WebM, MOV), Audio (MP3, WAV, M4A)
- **Preview trong khi tạo**: Xem trước nội dung trước khi mint NFT
- **Playback thông minh**: Video và audio player tích hợp trong modal chi tiết

### 🛒 Marketplace Hoàn Chỉnh
- **Local NFTs**: NFT được tạo trên local blockchain (Hardhat)
- **OpenSea Integration**: Hiển thị NFT trending từ OpenSea
- **Smart Contract**: Tự động xử lý giao dịch mua bán
- **Responsive Design**: Tối ưu cho mọi thiết bị

### 💎 Tính Năng Nâng Cao
- **Wallet Integration**: Kết nối MetaMask với hiển thị balance real-time
- **Gas Optimization**: Tự động estimate và optimize gas fee
- **IPFS Storage**: Lưu trữ metadata và media phi tập trung
- **Transaction History**: Theo dõi lịch sử giao dịch

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI Framework
- **React Router** - Navigation
- **CSS3** - Styling với Flexbox và Grid
- **React Icons** - Icon library

### Blockchain
- **Hardhat** - Development environment
- **Ethers.js** - Ethereum library
- **Solidity** - Smart contract language
- **MetaMask** - Wallet integration

### Storage & APIs
- **IPFS** - Decentralized storage
- **OpenSea API** - NFT marketplace data
- **Local Storage** - Development data

## 🚀 Cài Đặt và Chạy Project

### Yêu Cầu Hệ Thống
- **Node.js** v16.0.0 trở lên
- **npm** hoặc **yarn**
- **MetaMask** browser extension
- **Git**

### Bước 1: Clone Repository
```bash
git clone <repository-url>
cd Blockchain
```

### Bước 2: Cài Đặt Dependencies
```bash
npm install
```

### Bước 3: Compile Smart Contracts
```bash
npx hardhat compile
```

### Bước 4: Khởi Động Local Blockchain
```bash
# Terminal 1 - Chạy Hardhat node
npx hardhat node
```

### Bước 5: Deploy Smart Contracts
```bash
# Terminal 2 - Deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

### Bước 6: Khởi Động Frontend
```bash
# Terminal 3 - Chạy React app
npm start
```

### Bước 7: Cấu Hình MetaMask
1. Mở MetaMask extension
2. Thêm network mới:
   - **Network Name**: Hardhat Local
   - **RPC URL**: http://localhost:8545
   - **Chain ID**: 1337
   - **Currency Symbol**: ETH
3. Import test account:
   - **Private Key**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - **Address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
   - **Balance**: 10,000 ETH

## 📱 Hướng Dẫn Sử Dụng

### Tạo NFT Mới
1. Nhấn **"Create"** trên navbar
2. Upload file (image/video/audio)
3. Điền thông tin: Name, Description, Price
4. Nhấn **"Create NFT"**
5. Confirm transaction trong MetaMask

### Mua NFT
1. Browse NFTs trên homepage
2. Click vào NFT để xem chi tiết
3. Nhấn **"Buy NFT"** (local) hoặc **"Buy on OpenSea"**
4. Confirm transaction

### Quản Lý NFT
- **My NFTs**: Xem NFT đã mua
- **Created NFTs**: Xem NFT đã tạo
- **Wallet Info**: Hiển thị balance và address

## 📁 Cấu Trúc Project

```
src/
├── components/           # React components
│   ├── Navbar.js        # Navigation bar với wallet info
│   ├── NFTCard.js       # Card hiển thị NFT
│   └── NFTDetailsModal.js # Modal chi tiết NFT
├── pages/               # Các trang chính
│   ├── Home.js          # Trang chủ marketplace
│   ├── CreateItem.js    # Trang tạo NFT
│   ├── MyNFTs.js        # NFT đã mua
│   └── CreatedNFTs.js   # NFT đã tạo
├── utils/               # Utility functions
│   ├── ipfs-alternatives.js # IPFS storage
│   └── opensea-api.js   # OpenSea integration
├── artifacts/           # Compiled contracts
└── contracts/           # Smart contracts
    ├── NFT.sol          # ERC721 NFT contract
    └── NFTMarketplace.sol # Marketplace contract
```

## 🔧 Cấu Hình

### Contract Addresses (Local)
```javascript
// src/config.js
export const nftaddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
export const nftmarketaddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
```

### OpenSea API
```javascript
// src/utils/opensea-api.js
const OPENSEA_API_KEY = 'your-api-key-here'
```

## 🎯 Tính Năng Đặc Biệt

### Dual Storage System
- **Blockchain**: Lưu SVG placeholder (tiết kiệm gas)
- **Local**: Lưu media gốc cho playback
- **Smart Detection**: Tự động phát hiện loại media

### Media Optimization
- **Images**: Auto resize > 1MB
- **Videos**: SVG placeholder với video icon
- **Audio**: SVG placeholder với audio waves

### Gas Optimization
- Auto estimate gas limit
- 20% buffer cho safety
- Optimized metadata size

## 🛡️ Security Features

- **Smart Contract Security**: Tested contracts
- **Wallet Integration**: Secure MetaMask connection
- **Input Validation**: Frontend và contract validation
- **Error Handling**: Comprehensive error management

## 🧪 Testing

### Chạy Tests
```bash
# Smart contract tests
npx hardhat test

# Frontend tests (nếu có)
npm test
```

### Test Accounts
```
Account #0: 0xf39F...2266 (10000 ETH)
Account #1: 0x70997...3045 (10000 ETH)
Account #2: 0x3C44C...7b47 (10000 ETH)
```

## 🚀 Deployment

### Deploy lên Testnet
```bash
# Cấu hình network trong hardhat.config.js
npx hardhat run scripts/deploy.js --network goerli
```

### Deploy lên Mainnet
```bash
# Cẩn thận với mainnet!
npx hardhat run scripts/deploy.js --network mainnet
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 Changelog

### v1.0.0 (Latest)
- ✅ Complete NFT marketplace
- ✅ Multi-media support (image/video/audio)
- ✅ OpenSea integration
- ✅ Wallet integration với real-time balance
- ✅ Gas optimization
- ✅ Responsive design

## 🐛 Known Issues

- Video playback chỉ hỗ trợ trên NFT mới tạo
- OpenSea API có rate limit
- IPFS loading có thể chậm

## 🏆 Credits

**Created By Group 6 - Class 243BFF400602**

### Team Members
- Frontend Development
- Smart Contract Development  
- UI/UX Design
- Testing & QA

### Special Thanks
- OpenSea API
- MetaMask team
- Hardhat framework
- React community

## 📄 License

MIT License - xem [LICENSE](LICENSE) file để biết thêm chi tiết.
