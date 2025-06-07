# 🔗 NFT Marketplace Smart Contracts

## 📋 Tổng Quan

Hệ thống NFT Marketplace bao gồm 2 smart contracts chính được thiết kế để hoạt động cùng nhau:

- **🎨 NFT.sol**: ERC721 contract để mint và quản lý NFT tokens
- **🏪 NFTMarketplace.sol**: Marketplace contract để list và trade NFT tokens với hệ thống escrow

---

## 🏗️ Kiến Trúc Hệ Thống

```
                    ┌─────────────────────────────────────┐
                    │         USER INTERACTIONS           │
                    │                                     │
                    │  ┌─────────┐    ┌─────────────┐     │
                    │  │ Creator │    │   Buyer     │     │
                    │  │ (Alice) │    │   (Bob)     │     │
                    │  └─────────┘    └─────────────┘     │
                    └─────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
    ┌─────────────────────┐                 ┌─────────────────────┐
    │     NFT.sol         │◄────────────────┤  NFTMarketplace.sol │
    │   (ERC721 Token)    │   Pre-Approval  │   (Trading Logic)   │
    ├─────────────────────┤                 ├─────────────────────┤
    │                     │                 │                     │
    │ 🎯 Core Functions:  │                 │ 🎯 Core Functions:  │
    │ • mint tokens       │                 │ • list items        │
    │ • manage metadata   │                 │ • execute sales     │
    │ • track ownership   │                 │ • handle payments   │
    │ • auto-approval     │                 │ • manage escrow     │
    │                     │                 │                     │
    │ 💾 State:           │                 │ 💾 State:           │
    │ • _tokenIds         │                 │ • _itemIds          │
    │ • token→URI mapping │                 │ • _itemsSold        │
    │ • owner→balance     │                 │ • item→data mapping │
    │ • approval→mapping  │                 │ • listingPrice      │
    └─────────────────────┘                 └─────────────────────┘
```

---

## 🎨 NFT.sol - Logic Analysis

### 📊 Contract Structure

```solidity
contract NFT is ERC721, ERC721URIStorage {
    using Counters for Counters.Counter;
    
    // State Variables
    Counters.Counter private _tokenIds;      // Auto-incrementing ID
    address contractAddress;                 // Marketplace address
    
    // Constructor
    constructor(address marketplaceAddress) 
        ERC721("Metaverse", "MTVS") 
    
    // Core Function
    function createToken(string memory tokenURI) → uint256
}
```

### 🔄 Function Flow Analysis

#### `createToken()` Step-by-Step Logic:

```
Input: tokenURI (string) - IPFS metadata link
│
├─ STEP 1: Increment Token Counter
│  ├─ _tokenIds.increment()
│  └─ newItemId = _tokenIds.current()  // Gets: 1, 2, 3, ...
│
├─ STEP 2: Mint NFT to Caller
│  ├─ _mint(msg.sender, newItemId)
│  └─ Creates ownership: msg.sender → tokenId
│
├─ STEP 3: Set Metadata URI
│  ├─ _setTokenURI(newItemId, tokenURI)
│  └─ Links token to metadata (images, properties)
│
├─ STEP 4: Pre-Approve Marketplace
│  ├─ setApprovalForAll(contractAddress, true)
│  └─ Allows marketplace to transfer NFT later
│
└─ STEP 5: Return Token ID
   └─ return newItemId
```

### 🧠 Design Decisions & Logic

**1. Why Auto-Approval?**
```solidity
setApprovalForAll(contractAddress, true);
```
- **Problem**: User tạo NFT → User phải approve riêng → User list NFT
- **Solution**: Auto-approve marketplace ngay khi mint
- **Trade-off**: Convenience vs Security risk

**2. Why Counters Library?**
```solidity
using Counters for Counters.Counter;
```
- **Prevents**: Integer overflow attacks
- **Ensures**: Unique token IDs
- **Pattern**: Industry standard for ID management

**3. Why ERC721URIStorage?**
```solidity
contract NFT is ERC721, ERC721URIStorage
```
- **ERC721**: Basic NFT functionality
- **ERC721URIStorage**: Adds per-token metadata storage
- **Alternative**: Base URI + token ID pattern

---

## 🏪 NFTMarketplace.sol - Logic Analysis

### 📊 Contract Structure

```solidity
contract NFTMarketplace is ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // State Management
    Counters.Counter private _itemIds;       // Total items listed
    Counters.Counter private _itemsSold;     // Items sold counter
    address payable owner;                   // Platform owner
    uint256 listingPrice = 0.025 ether;     // Platform fee
    
    // Data Structure
    struct MarketItem {
        uint itemId;           // Unique item ID
        address nftContract;   // NFT contract address
        uint256 tokenId;       // NFT token ID
        address payable seller; // Original seller
        address payable owner;  // Current owner (0x0 = listed)
        uint256 price;         // Sale price
        bool sold;             // Sale status
    }
    
    mapping(uint256 => MarketItem) private idToMarketItem;
}
```

### 🔄 Core Functions Flow

#### 1. `createMarketItem()` - Listing Logic

```
Input: nftContract, tokenId, price
Payment: listingPrice (0.025 ETH)
│
├─ STEP 1: Input Validation
│  ├─ require(price > 0, "Price must be at least 1 wei")
│  └─ require(msg.value == listingPrice, "Must pay listing fee")
│
├─ STEP 2: Generate Unique Item ID
│  ├─ _itemIds.increment()
│  └─ itemId = _itemIds.current()
│
├─ STEP 3: Create Market Item Struct
│  └─ idToMarketItem[itemId] = MarketItem(
│       itemId,               // Unique marketplace ID
│       nftContract,          // NFT contract address
│       tokenId,              // NFT token ID  
│       payable(msg.sender),  // Seller address
│       payable(address(0)),  // Owner = 0x0 (listed state)
│       price,                // Sale price in wei
│       false                 // sold = false
│     )
│
├─ STEP 4: Transfer NFT to Escrow
│  ├─ IERC721(nftContract).transferFrom(
│  │    msg.sender,           // From seller
│  │    address(this),        // To marketplace (escrow)
│  │    tokenId               // Specific NFT
│  │  )
│  └─ NFT now held by marketplace
│
└─ STEP 5: Emit Event for Indexing
   └─ emit MarketItemCreated(...)
```

#### 2. `buyNFT()` - Purchase Logic

```
Input: nftContract, itemId  
Payment: exact item price
│
├─ STEP 1: Load Item Data
│  ├─ MarketItem storage item = idToMarketItem[itemId]
│  ├─ uint price = item.price
│  └─ uint tokenId = item.tokenId
│
├─ STEP 2: Payment Validation
│  └─ require(msg.value == price, "Submit exact asking price")
│
├─ STEP 3: Payment Distribution
│  ├─ item.seller.transfer(msg.value)     // Seller gets full price
│  └─ payable(owner).transfer(listingPrice) // Platform gets fee
│
├─ STEP 4: NFT Transfer
│  └─ IERC721(nftContract).transferFrom(
│       address(this),        // From marketplace escrow
│       msg.sender,           // To buyer
│       tokenId               // Specific NFT
│     )
│
├─ STEP 5: State Updates
│  ├─ item.owner = payable(msg.sender)    // New owner = buyer
│  ├─ item.sold = true                    // Mark as sold
│  └─ _itemsSold.increment()              // Update sold counter
│
└─ STEP 6: Event Emission
   └─ emit MarketItemSold(...)
```

---

## 🔄 Complete User Journey Flow

### 📈 End-to-End Transaction Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PHASE 1: NFT CREATION                            │
└─────────────────────────────────────────────────────────────────────────────┘

Creator (Alice)
    │
    ├─ 1. Uploads media to IPFS
    │    └─ Gets: "ipfs://QmHash123..."
    │
    └─ 2. Calls NFT.createToken(tokenURI)
         │
         ├─ NFT Contract Actions:
         │  ├─ _tokenIds: 0 → 1
         │  ├─ _mint(alice, tokenId=1)
         │  ├─ _setTokenURI(1, "ipfs://QmHash123...")
         │  └─ setApprovalForAll(marketplace, true)
         │
         └─ Result: Alice owns NFT #1, Marketplace pre-approved

┌─────────────────────────────────────────────────────────────────────────────┐
│                          PHASE 2: MARKETPLACE LISTING                      │
└─────────────────────────────────────────────────────────────────────────────┘

Creator (Alice)
    │
    └─ 3. Calls Marketplace.createMarketItem(nftAddr, 1, 1ETH) + 0.025ETH
         │
         ├─ Marketplace Contract Actions:
         │  ├─ Validate: price > 0 ✓
         │  ├─ Validate: msg.value == 0.025ETH ✓
         │  ├─ _itemIds: 0 → 1
         │  ├─ Create MarketItem struct:
         │  │  ├─ itemId: 1
         │  │  ├─ seller: alice
         │  │  ├─ owner: 0x0 (listed)
         │  │  ├─ price: 1 ETH
         │  │  └─ sold: false
         │  ├─ transferFrom(alice → marketplace, tokenId=1)
         │  └─ emit MarketItemCreated(...)
         │
         └─ Result: NFT in escrow, Listed for 1 ETH

┌─────────────────────────────────────────────────────────────────────────────┐
│                           PHASE 3: DISCOVERY                               │
└─────────────────────────────────────────────────────────────────────────────┘

Buyer (Bob)
    │
    └─ 4. Calls Marketplace.fetchMarketItems()
         │
         ├─ Query Logic:
         │  ├─ Loop through all itemIds
         │  ├─ Filter: owner == 0x0 AND sold == false
         │  └─ Return array of available items
         │
         └─ Result: [MarketItem{itemId:1, price:1ETH, ...}]

┌─────────────────────────────────────────────────────────────────────────────┐
│                            PHASE 4: PURCHASE                               │
└─────────────────────────────────────────────────────────────────────────────┘

Buyer (Bob)
    │
    └─ 5. Calls Marketplace.buyNFT(nftAddr, itemId=1) + 1ETH
         │
         ├─ Marketplace Contract Actions:
         │  ├─ Load item data: price=1ETH, seller=alice
         │  ├─ Validate: msg.value == 1ETH ✓
         │  ├─ alice.transfer(1ETH)              // Seller payment
         │  ├─ transferFrom(marketplace → bob, tokenId=1) // NFT transfer
         │  ├─ Update state:
         │  │  ├─ item.owner = bob
         │  │  └─ item.sold = true
         │  ├─ _itemsSold: 0 → 1
         │  ├─ owner.transfer(0.025ETH)          // Platform fee
         │  └─ emit MarketItemSold(...)
         │
         └─ Result: Bob owns NFT, Alice got 1ETH, Platform got 0.025ETH

┌─────────────────────────────────────────────────────────────────────────────┐
│                             FINAL STATE                                    │
└─────────────────────────────────────────────────────────────────────────────┘

NFT Contract State:
├─ ownerOf(tokenId=1) = Bob
├─ tokenURI(1) = "ipfs://QmHash123..."
└─ getApproved(1) = marketplace (still approved)

Marketplace State:
├─ idToMarketItem[1].owner = Bob
├─ idToMarketItem[1].sold = true
├─ _itemIds.current() = 1
└─ _itemsSold.current() = 1

Balances:
├─ Alice: +1 ETH (sale price)
├─ Bob: -1 ETH, +NFT #1
└─ Platform: +0.025 ETH (listing fee)
```

---

## 💾 State Management Deep Dive

### 📊 Data Flow Between Contracts

```
┌─────────────────┐                    ┌─────────────────┐
│   NFT Contract  │                    │ Marketplace     │
│                 │                    │ Contract        │
├─────────────────┤                    ├─────────────────┤
│ _tokenIds: 1    │                    │ _itemIds: 1     │
│                 │                    │ _itemsSold: 1   │
│ Token Mapping:  │                    │                 │
│ 1 → alice       │ ── transferFrom ──▶│ Item Mapping:   │
│     ↓ listing   │                    │ 1 → {           │
│ 1 → marketplace │                    │   seller: alice │
│     ↓ sale      │                    │   owner: bob    │
│ 1 → bob         │                    │   sold: true    │
│                 │                    │ }               │
│ URI Mapping:    │                    │                 │
│ 1 → "ipfs://..."│                    │ Platform Fee:   │
│                 │                    │ 0.025 ETH       │
└─────────────────┘                    └─────────────────┘
```

### 🔄 State Transitions

#### NFT Ownership States:
```
[CREATION] → [LISTED] → [SOLD]
     │            │         │
     ▼            ▼         ▼
  Creator  → Marketplace → Buyer
   (mint)     (escrow)   (transfer)
```

#### Marketplace Item States:
```
NOT_EXIST → LISTED → SOLD
    │         │       │
    ▼         ▼       ▼
  empty → {owner:0x0, → {owner:buyer,
          sold:false}    sold:true}
```

---

## 🛡️ Security Analysis

### ✅ Security Measures Implemented

#### 1. Reentrancy Protection
```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

function buyNFT(...) public payable nonReentrant {
    // ✅ Protected against reentrancy attacks
    seller.transfer(msg.value);
}
```

**Why needed:**
- External calls to `transfer()` could trigger callback
- Callback could re-enter and drain contract
- `nonReentrant` prevents this attack

#### 2. Input Validation
```solidity
require(price > 0, "Price must be at least 1 wei");
require(msg.value == listingPrice, "Price must equal listing price");
require(msg.value == price, "Please submit the asking price");
```

**Protects against:**
- Zero-price attacks
- Incorrect payment amounts
- Economic griefing

#### 3. Safe Token Handling
```solidity
// ✅ Uses standard ERC721 interface
IERC721(nftContract).transferFrom(from, to, tokenId);

// ✅ Checks ownership implicitly
// transferFrom will revert if sender doesn't own token
```

### ⚠️ Potential Security Concerns

#### 1. Centralization Risks
```solidity
address payable owner;  // Single point of failure
uint256 listingPrice = 0.025 ether;  // Fixed by owner
```

**Issues:**
- Owner can change fees unilaterally
- No governance mechanism
- Single private key controls platform

#### 2. Auto-Approval Risk
```solidity
setApprovalForAll(contractAddress, true);  // In NFT.createToken()
```

**Risk scenario:**
1. Marketplace contract gets compromised
2. Attacker can transfer ALL user NFTs
3. Users lose entire collection

**Mitigation ideas:**
- Per-token approval instead of blanket approval
- Time-limited approvals
- Approval revocation functions

#### 3. Price Manipulation
```solidity
function updateListingPrice(uint _listingPrice) public payable {
    require(owner == msg.sender, "Only marketplace owner can update price");
    listingPrice = _listingPrice;
}
```

**Concerns:**
- Owner can front-run users
- No minimum/maximum limits
- No advance notice for changes

---

## ⚡ Gas Optimization Analysis

### 💰 Current Gas Costs (Estimated)

| Function | Gas Cost | Breakdown |
|----------|----------|-----------|
| `createToken()` | ~200,000 | Mint(~50k) + SetURI(~30k) + Approval(~50k) |
| `createMarketItem()` | ~150,000 | Storage(~20k) + Transfer(~50k) + Event(~5k) |
| `buyNFT()` | ~300,000 | Transfer(~50k) + ETH sends(~42k) + Updates(~20k) |

### 🔧 Optimization Strategies

#### 1. Struct Packing
```solidity
// ❌ Current: ~7 storage slots
struct MarketItem {
    uint itemId;              // 32 bytes - Slot 1
    address nftContract;      // 20 bytes - Slot 2
    uint256 tokenId;          // 32 bytes - Slot 3
    address payable seller;   // 20 bytes - Slot 4
    address payable owner;    // 20 bytes - Slot 5
    uint256 price;            // 32 bytes - Slot 6
    bool sold;                // 1 byte  - Slot 7
}

// ✅ Optimized: ~4 storage slots
struct MarketItem {
    uint128 itemId;           // 16 bytes \
    uint128 price;            // 16 bytes  } Slot 1
    address nftContract;      // 20 bytes \
    uint96 tokenId;           // 12 bytes  } Slot 2  
    address seller;           // 20 bytes \
    address owner;            // 20 bytes  } Slot 3
    bool sold;                // 1 byte   \
    // 11 bytes free           //           } Slot 4
}
```

**Savings:** ~60,000 gas per item creation/update

#### 2. Batch Operations
```solidity
// ✅ Add batch listing function
function createMarketItems(
    address[] nftContracts,
    uint256[] tokenIds,
    uint256[] prices
) external payable {
    require(msg.value == listingPrice * tokenIds.length);
    // Batch process multiple items
}
```

#### 3. Lazy Deletion
```solidity
// Instead of deleting struct, mark as inactive
idToMarketItem[itemId].sold = true;  // Current approach ✅
// vs
delete idToMarketItem[itemId];       // More expensive ❌
```

---

## 🧪 Testing Strategy

### 📋 Test Cases Required

#### NFT Contract Tests
```javascript
describe("NFT Contract", () => {
    it("Should mint token with correct ID", async () => {
        const tokenURI = "ipfs://test";
        const tx = await nft.createToken(tokenURI);
        const receipt = await tx.wait();
        
        expect(await nft.tokenURI(1)).to.equal(tokenURI);
        expect(await nft.ownerOf(1)).to.equal(creator.address);
    });
    
    it("Should auto-approve marketplace", async () => {
        await nft.createToken("ipfs://test");
        expect(await nft.isApprovedForAll(creator.address, marketplace.address))
            .to.be.true;
    });
});
```

#### Marketplace Contract Tests
```javascript
describe("Marketplace Contract", () => {
    it("Should create market item with correct escrow", async () => {
        // Setup: mint NFT first
        await nft.createToken("ipfs://test");
        
        // Test: list item
        const price = ethers.utils.parseEther("1");
        const listingPrice = await marketplace.getListingPrice();
        
        await marketplace.createMarketItem(nft.address, 1, price, {
            value: listingPrice
        });
        
        // Verify: NFT in escrow
        expect(await nft.ownerOf(1)).to.equal(marketplace.address);
        
        // Verify: market item created
        const item = await marketplace.idToMarketItem(1);
        expect(item.price).to.equal(price);
        expect(item.sold).to.be.false;
    });
    
    it("Should complete sale with correct payment distribution", async () => {
        // Setup: create and list NFT
        await setupNFTListing();
        
        // Test: buy NFT
        const price = ethers.utils.parseEther("1");
        const buyerBalanceBefore = await buyer.getBalance();
        const sellerBalanceBefore = await seller.getBalance();
        
        await marketplace.connect(buyer).buyNFT(nft.address, 1, {
            value: price
        });
        
        // Verify: ownership transfer
        expect(await nft.ownerOf(1)).to.equal(buyer.address);
        
        // Verify: payment distribution
        const sellerBalanceAfter = await seller.getBalance();
        expect(sellerBalanceAfter.sub(sellerBalanceBefore)).to.equal(price);
    });
});
```

#### Security Tests
```javascript
describe("Security Tests", () => {
    it("Should prevent reentrancy attacks", async () => {
        // Deploy malicious contract that tries to re-enter
        const MaliciousContract = await ethers.getContractFactory("ReentrancyAttacker");
        const attacker = await MaliciousContract.deploy(marketplace.address);
        
        // Test should revert
        await expect(
            attacker.attack()
        ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });
    
    it("Should validate exact payment amounts", async () => {
        await setupNFTListing();
        const price = ethers.utils.parseEther("1");
        const wrongPrice = ethers.utils.parseEther("0.5");
        
        await expect(
            marketplace.buyNFT(nft.address, 1, { value: wrongPrice })
        ).to.be.revertedWith("Please submit the asking price");
    });
});
```

---

## 🚀 Deployment Guide

### 📋 Deployment Sequence

```bash
# 1. Compile contracts
npx hardhat compile

# 2. Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# 3. Verify deployment
npx hardhat verify --network localhost <CONTRACT_ADDRESS>
```

### 📄 Deploy Script Analysis
```javascript
// scripts/deploy.js
async function main() {
    // Deploy Marketplace first
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    const nftMarketplace = await NFTMarketplace.deploy();
    await nftMarketplace.deployed();
    
    console.log("nftMarketplace deployed to:", nftMarketplace.address);
    
    // Deploy NFT with marketplace address
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(nftMarketplace.address);
    await nft.deployed();
    
    console.log("nft deployed to:", nft.address);
    
    // Update frontend config
    updateConfig(nft.address, nftMarketplace.address);
}
```

**Critical Points:**
1. **Order matters**: Marketplace phải deploy trước
2. **Address dependency**: NFT constructor cần marketplace address
3. **Config update**: Frontend cần addresses để interact

---

## 📖 Usage Examples

### 🎨 Creating and Selling NFT
```javascript
// Step 1: Create NFT
const tokenURI = "ipfs://QmYourMetadataHash";
const createTx = await nftContract.createToken(tokenURI);
const createReceipt = await createTx.wait();

// Extract token ID from event
const event = createReceipt.events?.find(e => e.event === 'Transfer');
const tokenId = event?.args?.tokenId;

// Step 2: List NFT for sale
const price = ethers.utils.parseEther("1.0"); // 1 ETH
const listingPrice = await marketplaceContract.getListingPrice();

const listTx = await marketplaceContract.createMarketItem(
    nftContract.address,
    tokenId,
    price,
    { value: listingPrice }
);
await listTx.wait();

console.log(`NFT ${tokenId} listed for ${ethers.utils.formatEther(price)} ETH`);
```

### 💳 Buying NFT
```javascript
// Step 1: Get market items
const marketItems = await marketplaceContract.fetchMarketItems();
const targetItem = marketItems[0]; // Buy first available item

// Step 2: Execute purchase
const buyTx = await marketplaceContract.connect(buyer).buyNFT(
    targetItem.nftContract,
    targetItem.itemId,
    { value: targetItem.price }
);
await buyTx.wait();

// Step 3: Verify ownership
const newOwner = await nftContract.ownerOf(targetItem.tokenId);
console.log(`NFT now owned by: ${newOwner}`);
```

### 📊 Querying Data
```javascript
// Get all market items
const allItems = await marketplaceContract.fetchMarketItems();

// Get user's owned NFTs
const myNFTs = await marketplaceContract.fetchMyNFTs();

// Get user's created items
const createdItems = await marketplaceContract.fetchItemsCreated();

// Get individual item details
const item = await marketplaceContract.idToMarketItem(itemId);
```

---

## 🔧 Troubleshooting

### ❌ Common Errors

#### 1. "ERC721: transfer caller is not owner nor approved"
```
Cause: NFT not properly approved for marketplace
Solution: Ensure setApprovalForAll() was called
```

#### 2. "Please submit the asking price"
```
Cause: Incorrect ETH amount sent with buyNFT()
Solution: Send exact item.price amount
```

#### 3. "Price must be equal to listing price"
```
Cause: Incorrect listing fee for createMarketItem()
Solution: Send exact getListingPrice() amount
```

### 🛠️ Debug Commands
```javascript
// Check NFT approval status
await nft.isApprovedForAll(owner, marketplace.address);

// Check current listing price
await marketplace.getListingPrice();

// Check item details
await marketplace.idToMarketItem(itemId);

// Check NFT owner
await nft.ownerOf(tokenId);
```

---

## 📈 Future Improvements

### 🚀 Enhanced Features
1. **Auction System**: Time-based bidding mechanism
2. **Royalties**: Automatic creator royalty payments
3. **Batch Operations**: Multiple NFT operations in single tx
4. **Governance**: Community voting for platform parameters
5. **Lazy Minting**: Mint only when purchased

### 🔒 Security Enhancements
1. **Multi-sig**: Require multiple signatures for admin functions
2. **Timelock**: Delay critical parameter changes
3. **Circuit Breaker**: Emergency pause functionality
4. **Audit**: Professional security audit

### ⚡ Gas Optimizations
1. **EIP-1167**: Minimal proxy patterns for NFT contracts
2. **Storage Packing**: Optimize struct layouts
3. **Batch Functions**: Reduce individual transaction costs
4. **Layer 2**: Deploy on Polygon/Arbitrum for lower fees

---

## 📚 Reference Links

- [OpenZeppelin ERC721](https://docs.openzeppelin.com/contracts/4.x/erc721)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Framework](https://hardhat.org/docs)
- [Ethers.js Library](https://docs.ethers.io/)
- [IPFS Documentation](https://docs.ipfs.io/)

---

**💡 Pro Tip**: Luôn test thoroughly trên local network trước khi deploy lên mainnet. Gas costs trên mainnet rất đắt! 