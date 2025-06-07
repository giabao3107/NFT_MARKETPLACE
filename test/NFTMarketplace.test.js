const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", function () {
  let nftMarketplace;
  let nft;
  let owner;
  let buyer;
  let seller;

  beforeEach(async function () {
    [owner, buyer, seller] = await ethers.getSigners();

    // Deploy NFTMarketplace
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplace.deploy();
    await nftMarketplace.deployed();

    // Deploy NFT
    const NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy(nftMarketplace.address);
    await nft.deployed();
  });

  it("Should create and execute market sales", async function () {
    const listingPrice = await nftMarketplace.getListingPrice();
    const auctionPrice = ethers.utils.parseUnits("1", "ether");

    // Create NFT
    await nft.connect(seller).createToken("https://www.mytokenlocation.com");
    
    // List NFT for sale
    await nftMarketplace
      .connect(seller)
      .createMarketItem(nft.address, 1, auctionPrice, { value: listingPrice });

    // Buy NFT
    await nftMarketplace
      .connect(buyer)
      .buyNFT(nft.address, 1, { value: auctionPrice });

    // Check if buyer owns the NFT
    const items = await nftMarketplace.connect(buyer).fetchMyNFTs();
    expect(items.length).to.equal(1);
    expect(items[0].owner).to.equal(buyer.address);
  });

  it("Should fetch market items", async function () {
    const listingPrice = await nftMarketplace.getListingPrice();
    const auctionPrice = ethers.utils.parseUnits("1", "ether");

    // Create and list multiple NFTs
    await nft.connect(seller).createToken("https://www.mytokenlocation.com");
    await nft.connect(seller).createToken("https://www.mytokenlocation2.com");

    await nftMarketplace
      .connect(seller)
      .createMarketItem(nft.address, 1, auctionPrice, { value: listingPrice });
    
    await nftMarketplace
      .connect(seller)
      .createMarketItem(nft.address, 2, auctionPrice, { value: listingPrice });

    const items = await nftMarketplace.fetchMarketItems();
    expect(items.length).to.equal(2);
  });
}); 