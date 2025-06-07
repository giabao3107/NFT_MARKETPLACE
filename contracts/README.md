# NFT Marketplace Smart Contracts

## Tổng quan dự án

Dự án này bao gồm 2 smart contract chính tạo nên một hệ thống NFT marketplace hoàn chỉnh trên Ethereum blockchain:

- **NFT.sol**: Contract ERC721 để mint và quản lý NFT tokens
- **NFTMarketplace.sol**: Contract marketplace để list và trade NFT tokens

## Kiến trúc hệ thống

```
┌─────────────────┐       ┌─────────────────────┐
│   NFT.sol       │       │  NFTMarketplace.sol │
│  (ERC721)       │◄─────►│   (Marketplace)     │
├─────────────────┤       ├─────────────────────┤
│ - _tokenIds     │       │ - _itemIds          │
│ - contractAddr  │       │ - _itemsSold        │
│ - createToken() │       │ - listingPrice      │
│ - getCurrentId()│       │ - MarketItem struct │
└─────────────────┘       │ - mapping items     │
                          │ - createMarketItem()│
                          │ - createMarketSale()│
                          │ - fetch functions   │
                          └─────────────────────┘
```

## Phân tích chi tiết từng contract

### 1. NFT.sol - ERC721 Token Contract

#### Kế thừa và Import
```solidity
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
```

**Lý do lựa chọn:**
- `ERC721URIStorage`: Cho phép lưu trữ metadata URI cho từng token
- `Counters`: Cung cấp counter an toàn cho token IDs
- Sử dụng OpenZeppelin để đảm bảo security standards

#### State Variables
```solidity
Counters.Counter private _tokenIds;
address contractAddress;
```

**Phân tích:**
- `_tokenIds`: Counter để track unique token IDs, bắt đầu từ 0
- `contractAddress`: Địa chỉ marketplace được pre-approve để transfer tokens

#### Constructor Logic
```solidity
constructor(address marketplaceAddress) ERC721("Metaverse", "MTVS") {
    contractAddress = marketplaceAddress;
}
```

**Tại sao cần marketplaceAddress trong constructor:**
- Thiết lập mối quan hệ tight coupling giữa NFT và Marketplace
- Cho phép pre-approval tự động trong hàm `createToken()`

#### Function Analysis

**createToken()**
```solidity
function createToken(string memory tokenURI) public returns (uint) {
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();
    
    _mint(msg.sender, newItemId);
    _setTokenURI(newItemId, tokenURI);
    setApprovalForAll(contractAddress, true);
    return newItemId;
}
```

**Logic flow:**
1. Increment counter để tạo unique ID
2. Mint token cho msg.sender
3. Set metadata URI
4. **Quan trọng**: Auto-approve marketplace contract
5. Return token ID để caller có thể sử dụng

**Security considerations:**
- Bất kỳ ai cũng có thể mint token (có thể cần access control)
- Auto-approval có thể gây risk nếu marketplace bị compromise

### 2. NFTMarketplace.sol - Marketplace Contract

#### Security Imports
```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
```
**Tại sao cần ReentrancyGuard:**
- Ngăn chặn reentrancy attacks trong payment flows
- Đặc biệt quan trọng cho functions có external calls và value transfers

#### State Variables
```solidity
Counters.Counter private _itemIds;
Counters.Counter private _itemsSold;
address payable owner;
uint256 listingPrice = 0.025 ether;
```

**Business logic:**
- `_itemIds`: Track tổng số items đã list
- `_itemsSold`: Track số items đã bán (để tính unsold items)
- `listingPrice`: Phí platform cố định 0.025 ETH

#### MarketItem Struct
```solidity
struct MarketItem {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
}
```

**Design patterns:**
- `owner = address(0)` khi item đang được list
- `owner = buyer_address` khi item đã sold
- `sold` boolean để double-check trạng thái

#### Key Functions Analysis

**createMarketItem()**
```solidity
function createMarketItem(
    address nftContract,
    uint256 tokenId,
    uint256 price
) public payable nonReentrant {
    require(price > 0, "Price must be at least 1 wei");
    require(msg.value == listingPrice, "Price must be equal to listing price");
    
    _itemIds.increment();
    uint256 itemId = _itemIds.current();
    
    idToMarketItem[itemId] = MarketItem(
        itemId,
        nftContract,
        tokenId,
        payable(msg.sender),
        payable(address(0)),
        price,
        false
    );
    
    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
    
    emit MarketItemCreated(itemId, nftContract, tokenId, msg.sender, address(0), price, false);
}
```

**Critical points:**
1. **Payment validation**: Exact listing fee required
2. **Escrow pattern**: Marketplace holds NFT until sale
3. **Event emission**: Cho off-chain indexing
4. **State management**: owner = address(0) cho unsold items

**createMarketSale()**
```solidity
function createMarketSale(
    address nftContract,
    uint256 itemId
) public payable nonReentrant {
    uint price = idToMarketItem[itemId].price;
    uint tokenId = idToMarketItem[itemId].tokenId;
    require(msg.value == price, "Please submit the asking price");
    
    idToMarketItem[itemId].seller.transfer(msg.value);
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    idToMarketItem[itemId].owner = payable(msg.sender);
    idToMarketItem[itemId].sold = true;
    _itemsSold.increment();
    payable(owner).transfer(listingPrice);
}
```

**Payment flow:**
1. Buyer pays exact price
2. Seller receives full sale price
3. NFT transfers to buyer
4. Platform owner receives listing fee
5. State updates (owner, sold status)

## Flow Diagram chi tiết

### Complete User Journey

```
┌─────────────┐
│   Creator   │ (NFT Artist/Creator)
│   (Alice)   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│ BƯỚC 1: TẠO NFT                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ NFT.createToken(tokenURI)                   │ │
│ │ ├─ _tokenIds.increment() // 0 → 1           │ │
│ │ ├─ _mint(alice, tokenId=1)                  │ │
│ │ ├─ _setTokenURI(1, "ipfs://...")            │ │
│ │ └─ setApprovalForAll(marketplace, true)     │ │
│ └─────────────────────────────────────────────┘ │
│ Result: Alice owns NFT #1, Marketplace approved │
└─────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│ BƯỚC 2: LIST NFT LÊN MARKETPLACE                │
│ ┌─────────────────────────────────────────────┐ │
│ │ NFTMarketplace.createMarketItem(            │ │
│ │   nftContract,                              │ │
│ │   tokenId=1,                                │ │
│ │   price=1 ETH                               │ │
│ │ ) + 0.025 ETH listing fee                   │ │
│ │ ├─ _itemIds.increment() // 0 → 1            │ │
│ │ ├─ Create MarketItem struct                 │ │
│ │ ├─ transferFrom(alice → marketplace)        │ │
│ │ └─ emit MarketItemCreated()                 │ │
│ └─────────────────────────────────────────────┘ │
│ Result: Marketplace holds NFT, Item listed      │
└─────────────────────────────────────────────────┘
       │
       ▼
┌─────────────┐
│   Buyer     │ (NFT Collector)
│   (Bob)     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│ BƯỚC 3: BROWSE & DISCOVER                       │
│ ┌─────────────────────────────────────────────┐ │
│ │ NFTMarketplace.fetchMarketItems()           │ │
│ │ └─ Returns: [MarketItem{                    │ │
│ │      itemId: 1,                             │ │
│ │      price: 1 ETH,                          │ │
│ │      owner: address(0), // Chưa bán         │ │
│ │      sold: false                            │ │
│ │    }]                                       │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│ BƯỚC 4: MUA NFT                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ NFTMarketplace.createMarketSale(            │ │
│ │   nftContract,                              │ │
│ │   itemId=1                                  │ │
│ │ ) + 1 ETH purchase price                    │ │
│ │ ├─ alice.transfer(1 ETH) // Payment         │ │
│ │ ├─ transferFrom(marketplace → bob)          │ │
│ │ ├─ Update: owner=bob, sold=true             │ │
│ │ ├─ _itemsSold.increment() // 0 → 1          │ │
│ │ └─ owner.transfer(0.025 ETH) // Platform    │ │
│ └─────────────────────────────────────────────┘ │
│ Result: Bob owns NFT, Alice gets paid           │
└─────────────────────────────────────────────────┘
```

### Contract Interaction Sequence

```
Timeline: Creator → Marketplace → NFT Contract → Buyer

┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────┐
│ Creator │    │ Marketplace │    │ NFT Contract│    │  Buyer  │
└────┬────┘    └──────┬──────┘    └──────┬──────┘    └────┬────┘
     │                │                  │                │
     │ 1. createToken("ipfs://metadata") │                │
     │ ─────────────────────────────────▶│                │
     │                │          ┌───────┴─────────┐      │
     │                │          │ • increment ID  │      │
     │                │          │ • mint to creator│     │
     │                │          │ • set tokenURI   │     │
     │                │          │ • approve all    │     │
     │                │          └───────┬─────────┘      │
     │ ◀─────────────────────────────────│ return tokenId │
     │                │                  │                │
     │ 2. createMarketItem(nftAddr, 1, 1ETH) + 0.025ETH   │
     │ ─────────────▶  │                  │                │
     │                │ 3. transferFrom(creator, marketplace, 1)
     │                │ ─────────────────▶│                │
     │                │ ◀─────────────────│ NFT escrowed   │
     │                │                  │                │
     │                │ 4. fetchMarketItems()              │
     │                │ ◀──────────────────────────────────│
     │                │ ─────────────────────────────────▶ │
     │                │          [Available Items]         │
     │                │                  │                │
     │                │ 5. createMarketSale(nftAddr, 1) + 1ETH
     │                │ ◀──────────────────────────────────│
     │ ◀──────────────│ Payment: 1 ETH   │                │
     │   💰 Received  │                  │                │
     │                │ 6. transferFrom(marketplace, buyer, 1)
     │                │ ─────────────────▶│                │
     │                │                  │ ──────────────▶│
     │                │                  │    🖼️ NFT       │
     │                │                  │                │
     └────────────────┼──────────────────┴────────────────┘
                      │ 💰 Platform fee: 0.025 ETH
                      ▼
            ┌─────────────────┐
            │ Platform Owner  │
            │   (Marketplace) │
            └─────────────────┘
```

## State Management & Data Flow

### NFT Contract State Changes
```
_tokenIds Counter:
Initial: 0
After createToken(): 1, 2, 3, ...

Token Ownership:
Initial: N/A
After mint: Creator owns token
After listing: Marketplace holds token (via transferFrom)
After sale: Buyer owns token

Approval Status:
setApprovalForAll(marketplace, true) → Marketplace can transfer all tokens
```

### Marketplace Contract State Changes
```
_itemIds Counter:
Initial: 0
After each listing: 1, 2, 3, ...

_itemsSold Counter:
Initial: 0
After each sale: 1, 2, 3, ...

MarketItem State Transitions:
┌─────────────┐  createMarketItem  ┌─────────────┐  createMarketSale  ┌─────────────┐
│   INITIAL   │ ─────────────────▶ │   LISTED    │ ─────────────────▶ │    SOLD     │
│             │                    │             │                    │             │
│ • Not exist │                    │ • owner: 0x0│                    │ • owner: buyer
│             │                    │ • sold: false│                   │ • sold: true
│             │                    │ • In escrow  │                    │ • Transferred
└─────────────┘                    └─────────────┘                    └─────────────┘
```

## Security Analysis

### Vulnerabilities đã được handle

1. **Reentrancy Attacks**
   ```solidity
   // ✅ Protected by nonReentrant modifier
   function createMarketSale(...) public payable nonReentrant {
       // Safe từ reentrancy attacks
   }
   ```

2. **Integer Overflow/Underflow**
   ```solidity
   // ✅ Sử dụng OpenZeppelin Counters
   using Counters for Counters.Counter;
   ```

3. **Access Control**
   ```solidity
   // ✅ Proper ownership checks
   require(msg.value == price, "Exact payment required");
   ```

### Potential Security Concerns

1. **Centralization Risk**
   - Platform owner có thể thay đổi listing price
   - Không có governance mechanism

2. **NFT Contract Trust**
   - Auto-approval cho marketplace có thể risky
   - Nếu marketplace bị compromise, tất cả NFT có thể bị steal

3. **Price Manipulation**
   - Listing price cố định, không linh hoạt
   - Không có minimum/maximum price validation

## Gas Optimization Analysis

### Efficient Patterns Used

1. **Storage vs Memory**
   ```solidity
   // ✅ Sử dụng storage reference khi cần
   MarketItem storage currentItem = idToMarketItem[currentId];
   ```

2. **Counter Management**
   ```solidity
   // ✅ Separate counters cho different metrics
   Counters.Counter private _itemIds;      // Total items listed
   Counters.Counter private _itemsSold;    // Items sold
   ```

3. **Batch Operations**
   ```solidity
   // ✅ Return arrays thay vì multiple calls
   function fetchMarketItems() public view returns (MarketItem[] memory)
   ```

### Optimization Opportunities

1. **Pack Struct Variables**
   ```solidity
   // Current: ~7 storage slots
   struct MarketItem {
       uint itemId;        // 32 bytes
       address nftContract; // 20 bytes
       uint256 tokenId;    // 32 bytes
       address payable seller; // 20 bytes
       address payable owner;  // 20 bytes
       uint256 price;      // 32 bytes
       bool sold;          // 1 byte
   }
   
   // Optimized: ~5 storage slots
   struct MarketItem {
       uint128 itemId;     // 16 bytes
       uint128 price;      // 16 bytes  } Slot 1
       address nftContract; // 20 bytes
       uint96 tokenId;     // 12 bytes  } Slot 2
       address seller;     // 20 bytes
       address owner;      // 20 bytes  } Slot 3
       bool sold;          // 1 byte    } Slot 4 (có thể pack thêm)
   }
   ```

2. **Reduce External Calls**
   ```solidity
   // Thay vì multiple transferFrom calls
   // Có thể batch operations
   ```

## Deployment Strategy

### Constructor Parameters
```solidity
// 1. Deploy NFTMarketplace first
NFTMarketplace marketplace = new NFTMarketplace();

// 2. Deploy NFT với marketplace address
NFT nft = new NFT(address(marketplace));
```

### Environment Variables Required
```
MARKETPLACE_OWNER_ADDRESS=0x...
LISTING_PRICE_ETH=0.025
NFT_NAME="Metaverse"
NFT_SYMBOL="MTVS"
```

## Usage Examples

### Tạo và bán NFT
```javascript
// 1. Mint NFT
const tokenURI = "ipfs://QmYourMetadataHash";
const tx1 = await nftContract.createToken(tokenURI);
const receipt1 = await tx1.wait();
const tokenId = receipt1.events[0].args.tokenId;

// 2. List for sale
const listingPrice = await marketplaceContract.getListingPrice();
const price = ethers.utils.parseEther("1.0"); // 1 ETH

const tx2 = await marketplaceContract.createMarketItem(
    nftContract.address,
    tokenId,
    price,
    { value: listingPrice }
);

// 3. Buy NFT (from different account)
const tx3 = await marketplaceContract.connect(buyer).createMarketSale(
    nftContract.address,
    1, // itemId
    { value: price }
);
```

### Query Functions
```javascript
// Lấy tất cả items đang bán
const marketItems = await marketplaceContract.fetchMarketItems();

// Lấy NFT của user
const myNFTs = await marketplaceContract.fetchMyNFTs();

// Lấy items đã tạo
const createdItems = await marketplaceContract.fetchItemsCreated();
```

## Testing Strategy

### Unit Tests cần cover
1. **NFT Contract**
   - Token creation và metadata
   - Approval mechanism
   - Token ID increment

2. **Marketplace Contract**
   - Listing với correct payment
   - Sale transaction flow
   - State updates
   - Query functions accuracy

3. **Integration Tests**
   - End-to-end user journey
   - Contract interaction
   - Event emissions

4. **Security Tests**
   - Reentrancy protection
   - Payment validation
   - Access control

## Kết luận

Hệ thống NFT Marketplace này cung cấp một foundation solid cho việc trade NFT với:

**Ưu điểm:**
- Architecture rõ ràng và modular
- Security best practices với ReentrancyGuard
- Comprehensive query functions
- Event-driven design cho off-chain integration

**Cải thiện có thể:**
- Thêm access control cho admin functions
- Implement royalty system cho creators
- Add auction mechanism
- Optimize gas với struct packing
- Add governance cho platform parameters

Đây là một implementation tốt cho MVP của NFT marketplace, có thể được extend với nhiều features advanced hơn. 

1. Mở terminal, chạy node Hardhat local:
   npx hardhat node

2. Mở terminal khác, deploy contracts:
   npx hardhat run scripts/deploy.js --network localhost 