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

describe("NFTMarketplace - Optimized Events", function () {
  let nftMarketplace;
  let nft;
  let owner;
  let seller;
  let buyer;
  let listingPrice;

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    // Deploy NFTMarketplace
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplace.deploy();
    await nftMarketplace.deployed();

    // Deploy NFT
    const NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy(nftMarketplace.address);
    await nft.deployed();

    listingPrice = await nftMarketplace.getListingPrice();
  });

  describe("Optimized Event Testing", function () {
    it("Should emit NFTCreated event when creating NFT", async function () {
      const tokenURI = "https://example.com/metadata.json";
      
      await expect(nft.connect(seller).createToken(tokenURI))
        .to.emit(nft, "NFTCreated")
        .withArgs(
          seller.address,
          1,
          tokenURI,
          "CREATE_TOKEN",
          "NFT Created Successfully"
        );
    });

    it("Should emit MarketItemCreated event when listing NFT", async function () {
      // First create an NFT
      await nft.connect(seller).createToken("https://example.com/metadata.json");
      
      // Then list it
      const price = ethers.utils.parseEther("1");
      
      await expect(
        nftMarketplace.connect(seller).createMarketItem(
          nft.address,
          1,
          price,
          { value: listingPrice }
        )
      )
        .to.emit(nftMarketplace, "MarketItemCreated")
        .withArgs(
          1,
          nft.address,
          1,
          seller.address,
          ethers.constants.AddressZero,
          price,
          false
        );
    });

    it("Should emit consolidated events when buying NFT", async function () {
      // Create and list NFT
      await nft.connect(seller).createToken("https://example.com/metadata.json");
      const price = ethers.utils.parseEther("1");
      await nftMarketplace.connect(seller).createMarketItem(
        nft.address,
        1,
        price,
        { value: listingPrice }
      );

      // Buy NFT and check for consolidated events
      const tx = await nftMarketplace.connect(buyer).buyNFT(
        nft.address,
        1,
        { value: price }
      );

      const receipt = await tx.wait();
      
      // Check for PaymentProcessed events
      const paymentEvents = receipt.events.filter(e => e.event === "PaymentProcessed");
      expect(paymentEvents.length).to.equal(2); // One for seller, one for marketplace
      
      // Check seller payment event
      const sellerPaymentEvent = paymentEvents.find(e => e.args.eventType === "SELLER_PAYMENT");
      expect(sellerPaymentEvent.args.recipient).to.equal(seller.address);
      expect(sellerPaymentEvent.args.itemId).to.equal(1);
      
      // Check marketplace fee event
      const marketplaceFeeEvent = paymentEvents.find(e => e.args.eventType === "MARKETPLACE_FEE");
      expect(marketplaceFeeEvent.args.recipient).to.equal(owner.address);
      expect(marketplaceFeeEvent.args.amount).to.equal(listingPrice);

      // Check MarketItemSold event
      const soldEvent = receipt.events.find(e => e.event === "MarketItemSold");
      expect(soldEvent.args.itemId).to.equal(1);
      expect(soldEvent.args.buyer).to.equal(buyer.address);
      expect(soldEvent.args.seller).to.equal(seller.address);
    });

    it("Should emit PaymentProcessed event when withdrawing", async function () {
      // Create, list and sell NFT first
      await nft.connect(seller).createToken("https://example.com/metadata.json");
      const price = ethers.utils.parseEther("1");
      await nftMarketplace.connect(seller).createMarketItem(
        nft.address,
        1,
        price,
        { value: listingPrice }
      );
      await nftMarketplace.connect(buyer).buyNFT(nft.address, 1, { value: price });

      // Now withdraw payment
      await expect(nftMarketplace.connect(seller).withdrawPayment())
        .to.emit(nftMarketplace, "PaymentProcessed")
        .withArgs(seller.address, 0, price.sub(listingPrice), "WITHDRAWAL");
    });

    it("Should emit PaymentProcessed event when claiming payment", async function () {
      // Create, list and sell NFT first
      await nft.connect(seller).createToken("https://example.com/metadata.json");
      const price = ethers.utils.parseEther("1");
      await nftMarketplace.connect(seller).createMarketItem(
        nft.address,
        1,
        price,
        { value: listingPrice }
      );
      await nftMarketplace.connect(buyer).buyNFT(nft.address, 1, { value: price });

      // Now claim payment
      await expect(nftMarketplace.connect(seller).claimPayment())
        .to.emit(nftMarketplace, "PaymentProcessed")
        .withArgs(seller.address, 0, price.sub(listingPrice), "CLAIM");
    });

    it("Should emit PaymentProcessed event when claiming revenue", async function () {
      // Create, list and sell NFT first
      await nft.connect(seller).createToken("https://example.com/metadata.json");
      const price = ethers.utils.parseEther("1");
      await nftMarketplace.connect(seller).createMarketItem(
        nft.address,
        1,
        price,
        { value: listingPrice }
      );
      await nftMarketplace.connect(buyer).buyNFT(nft.address, 1, { value: price });

      // Now claim revenue
      await expect(nftMarketplace.connect(seller).claimRevenue())
        .to.emit(nftMarketplace, "PaymentProcessed")
        .withArgs(seller.address, 0, price.sub(listingPrice), "REVENUE_CLAIM");
    });
  });
}); 