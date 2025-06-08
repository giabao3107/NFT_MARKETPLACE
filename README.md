# 🎨 NFT Marketplace - Sàn Giao Dịch NFT Phi Tập Trung

<div align="center">

![NFT Marketplace](https://img.shields.io/badge/NFT-Marketplace-orange?style=for-the-badge&logo=ethereum)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue?style=for-the-badge&logo=solidity)
![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react)
![Hardhat](https://img.shields.io/badge/Hardhat-Development-yellow?style=for-the-badge&logo=ethereum)

**Nền tảng giao dịch NFT hoàn chỉnh với hệ thống rút tiền và lịch sử giao dịch**

[Demo](#-demo) • [Cài Đặt](#-cài-đặt-và-chạy-project) • [Tính Năng](#-tính-năng-chính) • [API Docs](#-api-documentation)

</div>

---

## 📋 Mục Lục

- [🎯 Giới Thiệu](#-giới-thiệu)
- [✨ Tính Năng Chính](#-tính-năng-chính)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Cài Đặt và Chạy Project](#-cài-đặt-và-chạy-project)
- [📱 Hướng Dẫn Sử Dụng](#-hướng-dẫn-sử-dụng)
- [📁 Cấu Trúc Project](#-cấu-trúc-project)
- [🔧 Cấu Hình](#-cấu-hình)
- [📊 Smart Contracts](#-smart-contracts)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🔐 Security](#-security)
- [🎥 Demo](#-demo)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🏆 Credits](#-credits)

---

## 🎯 Giới Thiệu

**NFT Marketplace** là một nền tảng giao dịch NFT phi tập trung được xây dựng trên Ethereum blockchain. Dự án cung cấp đầy đủ các tính năng cần thiết cho việc tạo, mua bán và quản lý NFT với giao diện người dùng hiện đại và trải nghiệm mượt mà.

### 🌟 Điểm Nổi Bật

- **🔗 Hoàn toàn phi tập trung** - Không cần server trung tâm
- **💰 Hệ thống rút tiền thông minh** - Seller có thể rút tiền riêng biệt 
- **📊 Lịch sử giao dịch đầy đủ** - Theo dõi mọi hoạt động NFT
- **🎨 Hỗ trợ đa media** - Images, Videos, Audio files
- **⚡ Gas optimization** - Tối ưu chi phí giao dịch
- **📱 Responsive design** - Hoạt động mượt trên mọi thiết bị

---

## ✨ Tính Năng Chính

### 🖼️ Quản Lý NFT

| Tính Năng | Mô Tả | Trạng Thái |
|-----------|--------|------------|
| **Tạo NFT** | Upload media, set metadata, mint to blockchain | ✅ Hoàn thành |
| **Preview NFT** | Xem trước media trước khi mint | ✅ Hoàn thành |
| **Category System** | Phân loại NFT theo danh mục | ✅ Hoàn thành |
| **Media Support** | Images (JPG, PNG, GIF), Videos (MP4, WebM), Audio (MP3, WAV) | ✅ Hoàn thành |

### 🛒 Marketplace 

| Tính Năng | Mô Tả | Trạng Thái |
|-----------|--------|------------|
| **Browse NFTs** | Xem danh sách NFT với filter và search | ✅ Hoàn thành |
| **Buy NFTs** | Mua NFT với MetaMask integration | ✅ Hoàn thành |
| **NFT Details** | Modal hiển thị thông tin chi tiết và media player | ✅ Hoàn thành |
| **Price Display** | Hiển thị giá với currency conversion (ETH/USD/VND) | ✅ Hoàn thành |

### 💸 Hệ Thống Thanh Toán

| Tính Năng | Mô Tả | Trạng Thái |
|-----------|--------|------------|
| **Instant Payment** | Thanh toán tức thì qua smart contract | ✅ Hoàn thành |
| **Withdrawal System** | Seller có thể rút tiền từ pending balance | ✅ Hoàn thành |
| **MetaMask Activity** | Giao dịch hiển thị trong MetaMask history | ✅ Hoàn thành |
| **Fee Management** | Marketplace fee tự động được trừ | ✅ Hoàn thành |

### 📊 Analytics & History

| Tính Năng | Mô Tả | Trạng Thái |
|-----------|--------|------------|
| **Transaction History** | Lịch sử đầy đủ các giao dịch NFT | ✅ Hoàn thành |
| **Purchase History** | Theo dõi NFT đã mua | ✅ Hoàn thành |
| **Pending Withdrawals** | Quản lý số tiền chờ rút | ✅ Hoàn thành |
| **Wallet Integration** | Hiển thị balance và thông tin ví | ✅ Hoàn thành |

---

## 🛠️ Tech Stack

### Frontend
```
🎨 UI/UX
├── React.js 18.0+          # UI Framework
├── React Router Dom        # Client-side routing  
├── CSS3 + Flexbox/Grid    # Styling
├── React Icons            # Icon library
└── React Toastify         # Notification system
```

### Blockchain
```
⛓️ Web3 Integration
├── Hardhat               # Development environment
├── Ethers.js 5.7+        # Ethereum library
├── Solidity 0.8.24       # Smart contract language
├── MetaMask              # Wallet integration
└── OpenZeppelin          # Security contracts
```

### Storage & APIs
```
💾 Data Management
├── IPFS                  # Decentralized storage
├── Local Storage         # Client-side caching
├── Base64 Encoding       # Media optimization
└── JSON Metadata         # NFT standards
```

### Development Tools
```
🔧 DevOps
├── Git & GitHub          # Version control
├── npm/yarn             # Package management
├── Hardhat Network      # Local blockchain
└── VS Code/Cursor       # Development IDE
```

---

## 🚀 Cài Đặt và Chạy Project

### 📋 Yêu Cầu Hệ Thống

- **Node.js** v16.0.0+ ([Download](https://nodejs.org/))
- **npm** v8.0.0+ hoặc **yarn** v1.22.0+
- **Git** ([Download](https://git-scm.com/))
- **MetaMask** Browser Extension ([Install](https://metamask.io/))

### 🔄 Bước 1: Clone Repository

```bash
# Clone repository
git clone https://github.com/giabao3107/NFT_MARKET.git

# Di chuyển vào thư mục project
cd NFT_MARKET

# Kiểm tra branch hiện tại
git branch
```

### 📦 Bước 2: Cài Đặt Dependencies

```bash
# Cài đặt tất cả dependencies
npm install

# Hoặc sử dụng yarn
yarn install

# Verify installation
npm list --depth=0
```

### ⚒️ Bước 3: Compile Smart Contracts

```bash
# Compile Solidity contracts
npx hardhat compile

# Kiểm tra artifacts được tạo
ls artifacts/contracts/
```

### 🌐 Bước 4: Khởi Động Local Blockchain

```bash
# Terminal 1 - Chạy Hardhat node (để luôn chạy)
npx hardhat node

# ✅ Blockchain sẽ chạy trên: http://localhost:8545
# ✅ Chain ID: 1337
# ✅ 20 test accounts với 10,000 ETH mỗi account
```

### 🚀 Bước 5: Deploy Smart Contracts

```bash
# Terminal 2 - Deploy contracts lên local network
npx hardhat run scripts/deploy.js --network localhost

# ✅ Output sẽ hiển thị contract addresses
# ✅ File config.js sẽ được tự động cập nhật
```

### 💻 Bước 6: Khởi Động Frontend

```bash
# Terminal 3 - Chạy React development server
npm start

# ✅ Frontend sẽ chạy trên: http://localhost:3000
# ✅ Auto-reload khi có thay đổi code
```

### 🦊 Bước 7: Cấu Hình MetaMask

#### 7.1. Thêm Hardhat Network
```
Network Settings:
┌─────────────────┬──────────────────────────┐
│ Network Name    │  Hardhat Local           │
│ RPC URL         │ http://localhost:8545    │
│ Chain ID        │ 1337                     │
│ Currency Symbol │ ETH                      │
│ Block Explorer  │ (để trống)               │
└─────────────────┴──────────────────────────┘
```

#### 7.2. Import Test Account
```bash
# Account #0 - Main test account
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Balance: 10,000 ETH

# Account #1 - Secondary test account  
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Balance: 10,000 ETH
```

### ✅ Bước 8: Verify Setup

```bash
# Kiểm tra tất cả services đang chạy
curl http://localhost:8545    # Hardhat node
curl http://localhost:3000    # React app

# Test tạo NFT đầu tiên
# 1. Mở http://localhost:3000
# 2. Connect MetaMask
# 3. Chọn Hardhat Network  
# 4. Click "Create" -> Upload file -> Create NFT
```

---

## 📱 Hướng Dẫn Sử Dụng

### 🎨 Tạo NFT Mới

1. **Kết nối ví**
   ```
   🦊 MetaMask → Connect Wallet → Approve Connection
   ```

2. **Upload Media**
   ```
   📁 Create → Choose File → Select Image/Video/Audio
   ✅ Supported: JPG, PNG, GIF, MP4, WebM, MP3, WAV
   📏 Max size: 10MB
   ```

3. **Điền Metadata**
   ```
   📝 Name: "My Awesome NFT"
   📄 Description: "Detailed description..."
   🏷️ Category: Art/Music/Gaming/Sports/Photography
   💰 Price: 0.1 ETH
   ```

4. **Mint NFT**
   ```
   🚀 Create NFT → Confirm MetaMask Transaction
   ⏳ Wait for confirmation (~15 seconds)
   ✅ NFT created successfully!
   ```

### 🛒 Mua NFT

1. **Browse Marketplace**
   ```
   🏠 Home Page → Browse Available NFTs
   🔍 Use category filters
   👀 Click NFT để xem details
   ```

2. **NFT Details**
   ```
   🖼️ Full size preview
   ▶️ Video/Audio player (nếu có)
   💰 Price display (ETH/USD/VND)
   👤 Seller information
   ```

3. **Purchase**
   ```
   💳 Buy NFT → Confirm Price → MetaMask Transaction
   ⏳ Wait for confirmation
   ✅ NFT transferred to your wallet
   ```

### 💰 Quản Lý Tài Chính

#### Rút Tiền (Seller)
```
💰 Wallet Page → Pending Withdrawals
📊 View available balance
💸 Withdraw Amount → Confirm Transaction
✅ Money transferred to MetaMask
```

#### Xem Lịch Sử
```
📊 Wallet Page → Transaction History  
🕐 View all NFT transactions
🔍 Filter by type (Buy/Sell/Withdraw)
💾 Export transaction data
```

### 👤 Quản Lý NFT Cá Nhân

#### My NFTs - NFT Đã Mua
```
👤 My NFTs → View purchased NFTs
🔍 Filter: All/Owned/Listed
👀 View details và resell options
```

#### Created NFTs - NFT Đã Tạo
```
🎨 Created → View your created NFTs
💰 See sales status
📊 Track performance
```

---

## 📁 Cấu Trúc Project

```
NFT_MARKET/
├── 📁 contracts/                    # Smart Contracts
│   ├── NFT.sol                     # ERC721 NFT contract
│   ├── NFTMarketplace.sol          # Marketplace logic
│   └── Migrations.sol              # Deployment helper
│
├── 📁 scripts/                     # Deployment Scripts
│   ├── deploy.js                   # Main deployment script
│   ├── deploy-testnet.js           # Testnet deployment
│   └── test-metamask-activity.js   # Testing utilities
│
├── 📁 test/                        # Contract Tests
│   ├── NFTMarketplace.test.js      # Marketplace tests
│   └── sample-test.js              # Sample tests
│
├── 📁 src/                         # Frontend Source
│   ├── 📁 components/              # React Components
│   │   ├── Header.js               # Navigation header
│   │   ├── NFTCard.js              # NFT display card
│   │   ├── NFTDetailsModal.js      # NFT detail popup
│   │   ├── LoadingSpinner.js       # Loading indicator
│   │   ├── TransactionHistory.js   # Transaction tracking
│   │   ├── PendingWithdrawals.js   # Withdrawal management
│   │   └── *.css                   # Component styles
│   │
│   ├── 📁 pages/                   # Main Pages
│   │   ├── Home.js                 # Marketplace homepage
│   │   ├── CreateItem.js           # NFT creation page
│   │   ├── MyNFTs.js               # User's NFT collection
│   │   ├── CreatedNFTs.js          # Created NFT management
│   │   ├── Wallet.js               # Wallet & finance page
│   │   └── *.css                   # Page styles
│   │
│   ├── 📁 utils/                   # Utility Functions
│   │   ├── constants.js            # App constants
│   │   ├── ipfs-alternatives.js    # IPFS storage handling
│   │   └── placeholderService.js   # Placeholder generation
│   │
│   ├── 📁 artifacts/               # Compiled Contracts
│   │   └── contracts/              # Contract ABIs
│   │
│   ├── config.js                   # Contract addresses
│   ├── App.js                      # Main app component
│   ├── App.css                     # Global styles
│   └── index.js                    # React entry point
│
├── 📁 public/                      # Static Assets
│   ├── index.html                  # HTML template
│   ├── favicon.ico                 # App icon
│   └── manifest.json               # PWA manifest
│
├── 📋 Configuration Files
├── hardhat.config.js               # Hardhat configuration
├── package.json                    # Dependencies
├── package-lock.json               # Lock file
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

---

## 🔧 Cấu Hình

### Contract Addresses (Auto-generated)

```javascript
// src/config.js
export const nftaddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
export const nftmarketaddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

// ⚠️ Addresses sẽ thay đổi mỗi lần redeploy
```

### Hardhat Network Configuration

```javascript
// hardhat.config.js
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: {
        count: 20,
        initialIndex: 0,
        mnemonic: "test test test...",
        accountsBalance: "10000000000000000000000" // 10,000 ETH
      }
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    }
  }
};
```

### Environment Variables (Optional)

```bash
# .env (tạo file nếu cần)
REACT_APP_NETWORK_ID=1337
REACT_APP_RPC_URL=http://localhost:8545
REACT_APP_MARKETPLACE_FEE=0.025  # 2.5%
```

---

## 📊 Smart Contracts

### 🎨 NFT.sol - ERC721 Contract

```solidity
// Chức năng chính:
✅ ERC721 compliant
✅ Minting NFTs với metadata
✅ Token URI management  
✅ Ownership tracking
✅ Transfer functionality
```

### 🏪 NFTMarketplace.sol - Marketplace Logic

```solidity
// Chức năng chính:
✅ Listing NFTs for sale
✅ Buying/selling với escrow
✅ Fee management (2.5% default)
✅ Withdrawal system
✅ Event emission cho tracking
✅ Reentrancy protection
```

#### Key Functions:

| Function | Mô Tả | Gas Cost |
|----------|--------|----------|
| `createToken()` | Mint NFT mới | ~200,000 gas |
| `createMarketItem()` | List NFT for sale | ~150,000 gas |
| `buyNFT()` | Mua NFT | ~300,000 gas |
| `withdrawPayment()` | Rút tiền seller | ~50,000 gas |
| `fetchMarketItems()` | Lấy danh sách NFT | View function |

#### Events:

```solidity
event MarketItemCreated(uint256 indexed itemId, address indexed nftContract, 
                        uint256 indexed tokenId, address seller, address owner, 
                        uint256 price, bool sold);

event MarketItemSold(uint256 indexed itemId, address indexed nftContract,
                     uint256 indexed tokenId, address seller, address buyer, 
                     uint256 price);

event PaymentWithdrawn(address indexed seller, uint256 amount);
```

---

## 🧪 Testing

### Smart Contract Tests

```bash
# Chạy tất cả tests
npx hardhat test

# Chạy test cụ thể
npx hardhat test test/NFTMarketplace.test.js

# Test với gas reporting
REPORT_GAS=true npx hardhat test

# Test coverage
npx hardhat coverage
```

### Frontend Testing

```bash
# Unit tests (nếu có)
npm test

# E2E testing với Cypress (nếu setup)
npm run cypress:open
```

### Manual Testing Checklist

- [ ] ✅ Connect/Disconnect MetaMask
- [ ] ✅ Switch between test accounts
- [ ] ✅ Create NFT với different media types
- [ ] ✅ Buy NFT từ different account
- [ ] ✅ Check transaction history
- [ ] ✅ Withdraw pending payments
- [ ] ✅ Test error handling
- [ ] ✅ Mobile responsiveness

---

## 🚀 Deployment

### Deploy lên Testnet (Sepolia/Goerli)

```bash
# 1. Cấu hình network trong hardhat.config.js
# 2. Get testnet ETH từ faucet
# 3. Deploy contracts
npx hardhat run scripts/deploy.js --network sepolia

# 4. Verify contracts (optional)
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

### Deploy lên Mainnet

```bash
# ⚠️ CẢNH BÁO: Mainnet deployment costs real money!

# 1. Prepare mainnet wallet với ETH
# 2. Double-check all configurations
# 3. Deploy contracts
npx hardhat run scripts/deploy.js --network mainnet

# 4. Update frontend với new addresses
# 5. Deploy frontend to hosting service
```

### Frontend Deployment

```bash
# Build production bundle
npm run build

# Deploy to services:
# - Vercel: vercel --prod
# - Netlify: netlify deploy --prod --dir=build
# - IPFS: ipfs add -r build/
```

---

## 🔐 Security

### Smart Contract Security

- ✅ **Reentrancy Protection** - Using OpenZeppelin ReentrancyGuard
- ✅ **Access Control** - Owner-only functions protected
- ✅ **Input Validation** - All inputs properly validated
- ✅ **Integer Overflow** - Solidity 0.8+ built-in protection
- ✅ **External Calls** - Safe interaction patterns

### Frontend Security

- ✅ **XSS Prevention** - React built-in protection
- ✅ **Input Sanitization** - All user inputs sanitized
- ✅ **Wallet Security** - MetaMask integration best practices
- ✅ **HTTPS Only** - Production deployment on HTTPS

### Audit Checklist

- [ ] 🔍 Contract security audit
- [ ] 🧪 Comprehensive test coverage (>90%)
- [ ] ⚡ Gas optimization review
- [ ] 🔒 Access control verification
- [ ] 📊 Economic model validation

---

## 🎥 Demo

### 🖼️ Screenshots

```
🏠 Homepage
├── Modern hero section với stats
├── Category filtering system
├── NFT grid với preview
└── Responsive design

🎨 Create NFT
├── Drag & drop file upload
├── Real-time preview
├── Form validation
└── Transaction confirmation

💰 Wallet Management
├── Balance display
├── Transaction history
├── Withdrawal interface
└── MetaMask integration
```

### 🎬 Video Demo

```bash
# Có thể thêm link video demo tại đây
# YouTube: https://youtube.com/watch?v=...
# Loom: https://loom.com/share/...
```

### 🌐 Live Demo

```bash
# Production deployment URLs
# Frontend: https://nft-marketplace-demo.vercel.app
# Testnet: https://sepolia.etherscan.io/address/CONTRACT_ADDRESS
```

---

## 🤝 Contributing

### 💡 How to Contribute

1. **Fork repository**
   ```bash
   # Click Fork button trên GitHub
   git clone https://github.com/YOUR_USERNAME/NFT_MARKET.git
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/awesome-feature
   git checkout -b bugfix/fix-issue-123
   ```

3. **Make changes & test**
   ```bash
   # Implement your changes
   npm test
   npx hardhat test
   ```

4. **Commit với convention**
   ```bash
   git commit -m "feat: add new NFT category system"
   git commit -m "fix: resolve MetaMask connection issue"
   git commit -m "docs: update README installation guide"
   ```

5. **Push & create PR**
   ```bash
   git push origin feature/awesome-feature
   # Tạo Pull Request trên GitHub
   ```

### 📋 Development Guidelines

#### Code Style
```javascript
// ✅ Use descriptive variable names
const nftMetadata = { name, description, image };

// ✅ Add comments for complex logic
// Calculate seller payment after marketplace fee deduction
const sellerPayment = nftPrice - marketplaceFee;

// ✅ Handle errors gracefully
try {
  await contract.buyNFT(nftId);
  toast.success('NFT purchased successfully!');
} catch (error) {
  toast.error(`Error: ${error.message}`);
}
```

#### Git Commit Convention
```bash
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation changes
style:    # Code style changes (formatting, etc.)
refactor: # Code refactoring
test:     # Adding or updating tests
chore:    # Maintenance tasks
```

### 🐛 Bug Reports

**Template for bug reports:**
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Screenshots
If applicable, add screenshots

## Environment
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91.0]
- MetaMask Version: [e.g. 10.14.1]
- Node.js Version: [e.g. 16.14.0]
```

---

## 📄 License

```
MIT License

Copyright (c) 2024 Group 6 - Class 243BFF400602

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🏆 Credits

### 👥 Team Members - Group 6, Class 243BFF400602

| Role | Contributor | Responsibilities |
|------|-------------|------------------|
| **🎨 Frontend Lead** | Team Member 1 | React.js, UI/UX, Component Development |
| **⛓️ Blockchain Lead** | Team Member 2 | Smart Contracts, Solidity, Web3 Integration |
| **🔧 DevOps Engineer** | Team Member 3 | Deployment, Testing, CI/CD |
| **📋 Project Manager** | Team Member 4 | Documentation, Coordination, QA |

### 🙏 Special Thanks

- **[OpenZeppelin](https://openzeppelin.com/)** - Security contracts và best practices
- **[Hardhat](https://hardhat.org/)** - Development environment và testing framework  
- **[MetaMask](https://metamask.io/)** - Wallet integration và Web3 provider
- **[React](https://reactjs.org/)** - Frontend framework
- **[Ethers.js](https://docs.ethers.io/)** - Ethereum library
- **[IPFS](https://ipfs.io/)** - Decentralized storage solution

### 📚 Learning Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [React Documentation](https://reactjs.org/docs/)
- [Ethereum.org](https://ethereum.org/developers/)
- [OpenZeppelin Learn](https://docs.openzeppelin.com/learn/)
- [Hardhat Tutorial](https://hardhat.org/tutorial/)

### 🌟 Inspiration

Dự án được lấy cảm hứng từ các NFT marketplace lớn như OpenSea, Rarible và Foundation, với mục tiêu tạo ra một nền tảng đơn giản nhưng đầy đủ tính năng cho việc học tập và phát triển.

---

<div align="center">

### 🚀 Ready to Start Building?

[🔧 Set up Development Environment](#-cài-đặt-và-chạy-project) • [📖 Read Full Documentation](#-mục-lục) • [🤝 Join Community](#-contributing)

**⭐ Nếu project này hữu ích, hãy star repository để ủng hộ team! ⭐**

---

**Made with ❤️ by Group 6 - Class 243BFF400602**

![Built with Love](https://img.shields.io/badge/Built%20with-❤️-red?style=for-the-badge)
![Powered by Ethereum](https://img.shields.io/badge/Powered%20by-Ethereum-blue?style=for-the-badge&logo=ethereum)

</div>
