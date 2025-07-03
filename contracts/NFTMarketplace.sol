// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarketplace is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 listingPrice = 0.01 ether;

    constructor() {
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;
    mapping(address => uint256) private pendingWithdrawals;

    // Optimized Events - Consolidated from multiple similar events
    event MarketItemCreated (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    event MarketItemSold (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address buyer,
        address seller,
        uint256 price,
        uint256 marketplaceFee,
        uint256 sellerPayment
    );

    // Consolidated payment event - covers all payment scenarios
    event PaymentProcessed (
        address indexed recipient,
        uint256 indexed itemId,
        uint256 amount,
        string eventType // "SELLER_PAYMENT", "MARKETPLACE_FEE", "WITHDRAWAL", "CLAIM"
    );

    /* Returns the listing price of the contract */
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    /* Helper function to get market item details */
    function getMarketItem(uint256 itemId) public view returns (MarketItem memory) {
        return idToMarketItem[itemId];
    }

    /* Get contract balance for debugging */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /* Get seller balance for a specific item (for debugging) */
    function getSellerForItem(uint256 itemId) public view returns (address) {
        return idToMarketItem[itemId].seller;
    }

    /* Get pending withdrawal amount for seller */
    function getPendingWithdrawal(address seller) public view returns (uint256) {
        return pendingWithdrawals[seller];
    }

    /* Withdraw pending payments (shows in seller's MetaMask activity) */
    function withdrawPayment() public nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No pending withdrawals");
        
        pendingWithdrawals[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit PaymentProcessed(msg.sender, 0, amount, "WITHDRAWAL");
    }

    /* Claim payment directly (shows + ETH in MetaMask Activity) */
    function claimPayment() public nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No payment to claim");
        
        pendingWithdrawals[msg.sender] = 0;
        
        // Direct transfer creates + ETH in seller's MetaMask Activity
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Payment claim failed");
        
        emit PaymentProcessed(msg.sender, 0, amount, "CLAIM");
    }

    /* Claim revenue with custom message (shows "Received Revenue" in MetaMask) */
    function claimRevenue() public nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No revenue to claim");
        
        pendingWithdrawals[msg.sender] = 0;
        
        // Create transaction that shows in MetaMask Activity
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Revenue claim failed");
        
        emit PaymentProcessed(msg.sender, 0, amount, "REVENUE_CLAIM");
    }

    /* Auto-claim revenue after purchase (immediate + ETH for seller) */
    function enableAutoClaim() public pure returns (bool) {
        // This could be a setting, for now return true
        return true;
    }

    /* Withdraw specific amount (for partial withdrawals) */
    function withdrawAmount(uint256 amount) public nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(pendingWithdrawals[msg.sender] >= amount, "Insufficient pending balance");
        
        pendingWithdrawals[msg.sender] -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit PaymentProcessed(msg.sender, 0, amount, "PARTIAL_WITHDRAWAL");
    }

    /* Places an item for sale on the marketplace */
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == listingPrice, "Price must be equal to listing price");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] =  MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    /* Creates the sale of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    function buyNFT(
        address nftContract,
        uint256 itemId
    ) public payable nonReentrant {
        uint price = idToMarketItem[itemId].price;
        uint tokenId = idToMarketItem[itemId].tokenId;
        address payable seller = idToMarketItem[itemId].seller;
        
        require(msg.value == price, "Please submit the asking price in order to complete the purchase");
        require(!idToMarketItem[itemId].sold, "This item has already been sold");
        require(seller != msg.sender, "You cannot buy your own NFT");
        
        // Calculate payments
        uint marketplaceFee = listingPrice;
        uint sellerPayment = msg.value - marketplaceFee;
        
        // Ensure we have enough to pay both seller and marketplace
        require(msg.value >= marketplaceFee, "Insufficient payment for marketplace fee");
        require(sellerPayment > 0, "Invalid seller payment amount");
        
        // Update item status BEFORE transfers to prevent reentrancy
        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        
        // Transfer NFT to buyer first
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        
        // Store payment for seller to withdraw/claim
        pendingWithdrawals[seller] += sellerPayment;
        
        // Transfer marketplace fee to owner
        (bool ownerSuccess, ) = owner.call{value: marketplaceFee}("");
        require(ownerSuccess, "Transfer to marketplace owner failed");
        
        // Emit consolidated events
        emit PaymentProcessed(seller, itemId, sellerPayment, "SELLER_PAYMENT");
        emit PaymentProcessed(owner, itemId, marketplaceFee, "MARKETPLACE_FEE");

        emit MarketItemSold(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            seller,
            price,
            marketplaceFee,
            sellerPayment
        );
    }

    /* Alias for backward compatibility */
    function createMarketSale(
        address nftContract,
        uint256 itemId
    ) public payable {
        buyNFT(nftContract, itemId);
    }

    /* Returns all unsold market items */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint itemCount = _itemIds.current();
        uint unsoldItemCount = itemCount - _itemsSold.current();
        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0)) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Returns only items that a user has purchased */
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Returns only items a user has created */
    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
} 