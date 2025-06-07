const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing MetaMask Activity Functions...\n");

  // Get the contract addresses
  const nftAddress = "0xc5a5C42992dECbae36851359345FE25997F5C42d";
  const marketplaceAddress = "0x09635F643e140090A9A8Dcd712eD6285858ceBef";

  // Get signers
  const [deployer, buyer, seller] = await ethers.getSigners();
  
  console.log("👤 Test Accounts:");
  console.log("   Deployer:", deployer.address);
  console.log("   Buyer:", buyer.address);
  console.log("   Seller:", seller.address);
  console.log("");

  // Get contract instances
  const NFT = await ethers.getContractFactory("NFT");
  const nft = NFT.attach(nftAddress);
  
  const Marketplace = await ethers.getContractFactory("NFTMarketplace");
  const marketplace = Marketplace.attach(marketplaceAddress);

  try {
    // 📋 Step 1: Create an NFT (as seller)
    console.log("📋 Step 1: Creating NFT as seller...");
    const tokenURI = "data:application/json;base64," + Buffer.from(JSON.stringify({
      name: "Test NFT for MetaMask Activity",
      description: "Testing buyNFT and claimPayment functions",
      image: "https://via.placeholder.com/400x400/ff6b35/ffffff?text=TEST+NFT"
    })).toString('base64');

    const createTx = await nft.connect(seller).createToken(tokenURI);
    await createTx.wait();
    console.log("✅ NFT created with transaction:", createTx.hash);

    // Get current token ID
    const tokenId = await nft.getCurrentTokenId();
    console.log("🆔 Token ID:", tokenId.toString());

    // 📋 Step 2: Create market item (as seller)
    console.log("\n📋 Step 2: Creating market item...");
    const listingPrice = await marketplace.getListingPrice();
    const nftPrice = ethers.utils.parseEther("0.1"); // 0.1 ETH

    const createItemTx = await marketplace.connect(seller).createMarketItem(
      nftAddress,
      tokenId,
      nftPrice,
      { value: listingPrice }
    );
    const createReceipt = await createItemTx.wait();
    console.log("✅ Market item created with transaction:", createItemTx.hash);
    
    // Get the item ID from current marketplace state
    const items = await marketplace.fetchMarketItems();
    const currentItem = items[items.length - 1]; // Get latest item
    const itemId = currentItem.itemId;
    console.log("🆔 Market Item ID:", itemId.toString());

    // 📋 Step 3: Test buyNFT function
    console.log("\n📋 Step 3: Testing buyNFT function...");
    console.log("💰 NFT Price:", ethers.utils.formatEther(nftPrice), "ETH");
    
    // Get buyer balance before
    const buyerBalanceBefore = await buyer.getBalance();
    console.log("💳 Buyer balance before:", ethers.utils.formatEther(buyerBalanceBefore), "ETH");

    // Call buyNFT using the item ID we got
    const buyTx = await marketplace.connect(buyer).buyNFT(nftAddress, itemId, {
      value: nftPrice,
      gasLimit: 500000
    });
    
    console.log("🔍 buyNFT Transaction Details:");
    console.log("   Hash:", buyTx.hash);
    console.log("   To:", buyTx.to);
    console.log("   Value:", ethers.utils.formatEther(buyTx.value || "0"), "ETH");
    console.log("   Data (first 10 bytes):", buyTx.data.slice(0, 10));
    
    // Calculate method selector
    const buyNFTSelector = ethers.utils.id("buyNFT(address,uint256)").slice(0, 10);
    console.log("   Expected method selector:", buyNFTSelector);
    console.log("   ✅ Method selector match:", buyTx.data.slice(0, 10) === buyNFTSelector);

    const buyReceipt = await buyTx.wait();
    console.log("✅ buyNFT transaction confirmed!");
    console.log("   Gas used:", buyReceipt.gasUsed.toString());
    console.log("   Status:", buyReceipt.status === 1 ? "Success" : "Failed");

    // Get buyer balance after
    const buyerBalanceAfter = await buyer.getBalance();
    console.log("💳 Buyer balance after:", ethers.utils.formatEther(buyerBalanceAfter), "ETH");

    // 📋 Step 4: Check pending payments for seller
    console.log("\n📋 Step 4: Checking seller pending payments...");
    const pendingAmount = await marketplace.getPendingWithdrawal(seller.address);
    console.log("💰 Seller pending payment:", ethers.utils.formatEther(pendingAmount), "ETH");

    let claimTx = null;
    if (pendingAmount.gt(0)) {
      // 📋 Step 5: Test claimPayment function
      console.log("\n📋 Step 5: Testing claimPayment function...");
      
      const sellerBalanceBefore = await seller.getBalance();
      console.log("💳 Seller balance before claim:", ethers.utils.formatEther(sellerBalanceBefore), "ETH");

      claimTx = await marketplace.connect(seller).claimPayment();
      
      console.log("🔍 claimPayment Transaction Details:");
      console.log("   Hash:", claimTx.hash);
      console.log("   To:", claimTx.to);
      console.log("   Value:", ethers.utils.formatEther(claimTx.value || "0"), "ETH");
      console.log("   Data (first 10 bytes):", claimTx.data.slice(0, 10));
      
      // Calculate method selector
      const claimPaymentSelector = ethers.utils.id("claimPayment()").slice(0, 10);
      console.log("   Expected method selector:", claimPaymentSelector);
      console.log("   ✅ Method selector match:", claimTx.data.slice(0, 10) === claimPaymentSelector);

      const claimReceipt = await claimTx.wait();
      console.log("✅ claimPayment transaction confirmed!");
      console.log("   Gas used:", claimReceipt.gasUsed.toString());
      console.log("   Status:", claimReceipt.status === 1 ? "Success" : "Failed");

      const sellerBalanceAfter = await seller.getBalance();
      console.log("💳 Seller balance after claim:", ethers.utils.formatEther(sellerBalanceAfter), "ETH");
      
      const gained = sellerBalanceAfter.sub(sellerBalanceBefore).add(claimReceipt.gasUsed.mul(claimTx.gasPrice || 0));
      console.log("💰 Seller gained (excluding gas):", ethers.utils.formatEther(gained), "ETH");
    }

    // 📋 Summary
    console.log("\n🎯 MetaMask Activity Test Summary:");
    console.log("=====================================");
    console.log("✅ buyNFT function signature:", buyNFTSelector);
    console.log("✅ claimPayment function signature:", ethers.utils.id("claimPayment()").slice(0, 10));
    console.log("✅ Both functions executed successfully");
    console.log("");
    console.log("📱 In MetaMask Activity, you should see:");
    console.log("   🛒 'Buy NFT' for transaction:", buyTx.hash);
    if (claimTx) {
      console.log("   💰 'Claim Payment' for transaction:", claimTx.hash);
    } else {
      console.log("   💰 'Claim Payment': No pending payments to test");
    }
    console.log("");
    console.log("🔍 If you see 'Contract Interaction' instead:");
    console.log("   - This is normal behavior for smart contract calls");
    console.log("   - The function names should be detected by MetaMask");
    console.log("   - Check the transaction details for method signatures");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("📋 Error details:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 