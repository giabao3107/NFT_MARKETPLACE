# NFT Marketplace

A decentralized NFT marketplace built with React, Solidity, and MetaMask. This project allows users to create, buy, and sell NFTs on the Ethereum blockchain with a modern, OpenSea-inspired user interface.

## 🚀 Features

- **Create NFTs**: Upload images and metadata to IPFS and mint new NFTs
- **Buy/Sell NFTs**: Purchase NFTs with ETH through smart contracts
- **Wallet Integration**: Connect with MetaMask for secure transactions
- **User Dashboard**: View owned NFTs and created NFTs
- **Responsive Design**: Modern UI that works on desktop and mobile
- **IPFS Storage**: Decentralized storage for NFT metadata and images

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Ethers.js** - Ethereum library for blockchain interactions
- **Web3Modal** - Wallet connection management
- **Axios** - HTTP client for API requests
- **React Icons** - Icon library
- **React Toastify** - Toast notifications
- **Styled Components** - CSS-in-JS styling

### Backend/Blockchain
- **Solidity** - Smart contract development
- **Hardhat** - Ethereum development environment
- **OpenZeppelin** - Secure smart contract library
- **IPFS** - Decentralized file storage

### Smart Contracts
- **NFT.sol** - ERC721 token contract for NFT creation
- **NFTMarketplace.sol** - Marketplace contract for buying/selling

## 📁 Project Structure

```
nft-marketplace/
├── contracts/                 # Solidity smart contracts
│   ├── NFT.sol               # ERC721 NFT contract
│   └── NFTMarketplace.sol    # Marketplace contract
├── scripts/                  # Deployment scripts
│   └── deploy.js            # Contract deployment script
├── src/                     # React frontend
│   ├── components/          # Reusable components
│   │   ├── Navbar.js       # Navigation component
│   │   ├── NFTCard.js      # NFT display card
│   │   └── *.css           # Component styles
│   ├── pages/              # Page components
│   │   ├── Home.js         # Marketplace homepage
│   │   ├── CreateItem.js   # NFT creation page
│   │   ├── MyNFTs.js       # User's owned NFTs
│   │   └── CreatedNFTs.js  # User's created NFTs
│   ├── artifacts/          # Compiled contract artifacts
│   ├── config.js           # Contract addresses
│   ├── App.js              # Main app component
│   └── index.js            # App entry point
├── public/                 # Static files
├── hardhat.config.js       # Hardhat configuration
├── package.json           # Dependencies and scripts
└── README.md              # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nft-marketplace.git
   cd nft-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up IPFS (Optional - for local development)**
   - Sign up for [Infura IPFS](https://infura.io/product/ipfs)
   - Get your project ID and secret
   - Update the IPFS client configuration in `src/pages/CreateItem.js`

### 🔧 Development Setup

1. **Start local Hardhat network**
   ```bash
   npx hardhat node
   ```
   This will start a local Ethereum network on `http://localhost:8545`

2. **Deploy smart contracts**
   ```bash
   npm run deploy
   ```
   This will deploy the contracts and output their addresses.

3. **Update contract addresses**
   Copy the deployed contract addresses and update `src/config.js`:
   ```javascript
   export const nftaddress = "YOUR_NFT_CONTRACT_ADDRESS";
   export const nftmarketaddress = "YOUR_MARKETPLACE_CONTRACT_ADDRESS";
   ```

4. **Start the React development server**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

5. **Configure MetaMask**
   - Add the local Hardhat network to MetaMask:
     - Network Name: Hardhat Local
     - RPC URL: http://localhost:8545
     - Chain ID: 1337
     - Currency Symbol: ETH
   - Import one of the test accounts from Hardhat node output

## 📱 Usage

### For Users

1. **Connect Wallet**
   - Click "Connect Wallet" in the navigation
   - Approve the connection in MetaMask

2. **Browse NFTs**
   - Visit the homepage to see all available NFTs
   - Click on any NFT to view details

3. **Buy NFTs**
   - Click "Buy Now" on any NFT
   - Confirm the transaction in MetaMask
   - Pay the listing price + gas fees

4. **Create NFTs**
   - Go to "Create" page
   - Upload an image file
   - Add name, description, and price
   - Click "Create NFT" and confirm transactions

5. **View Your NFTs**
   - "My NFTs" - View NFTs you own
   - "Created" - View NFTs you've created

### For Developers

1. **Compile contracts**
   ```bash
   npm run compile
   ```

2. **Run tests**
   ```bash
   npx hardhat test
   ```

3. **Deploy to testnet**
   - Update `hardhat.config.js` with testnet configuration
   - Add your private key and Infura/Alchemy URL
   - Run deployment script

## 🔐 Smart Contract Details

### NFT.sol
- **Standard**: ERC721 with URI Storage
- **Features**: 
  - Mint new tokens with metadata URI
  - Automatic approval for marketplace contract
  - Token counter for unique IDs

### NFTMarketplace.sol
- **Features**:
  - List NFTs for sale with custom pricing
  - Buy NFTs with ETH payments
  - Marketplace fee (0.025 ETH listing fee)
  - Fetch user's owned/created NFTs
  - Reentrancy protection

## 🎨 UI/UX Features

- **OpenSea-inspired Design**: Clean, modern interface
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Hover Effects**: Interactive card animations
- **Loading States**: User feedback during transactions
- **Toast Notifications**: Success/error messages
- **Wallet Integration**: Seamless MetaMask connection

## 🔧 Configuration

### Environment Variables (Optional)
Create a `.env` file for production deployment:
```
REACT_APP_INFURA_PROJECT_ID=your_infura_project_id
REACT_APP_INFURA_PROJECT_SECRET=your_infura_secret
PRIVATE_KEY=your_wallet_private_key
INFURA_URL=your_infura_ethereum_url
```

### Network Configuration
Update `hardhat.config.js` for different networks:
```javascript
networks: {
  goerli: {
    url: process.env.INFURA_URL,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

## 📝 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run compile` - Compile smart contracts
- `npm run deploy` - Deploy contracts to local network
- `npm run node` - Start local Hardhat network

## 🚀 Deployment

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or IPFS

### Smart Contract Deployment
1. Configure network in `hardhat.config.js`
2. Run: `npx hardhat run scripts/deploy.js --network <network-name>`
3. Update contract addresses in `src/config.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Hardhat for the excellent development environment
- React team for the amazing frontend framework
- IPFS for decentralized storage solution

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Join our community discussions

---

**Happy Building! 🚀** 