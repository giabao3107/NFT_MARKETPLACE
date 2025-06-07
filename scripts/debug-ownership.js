const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Debugging NFT Ownership...\n");

  const nftAddress = "0xc5a5C42992dECbae36851359345FE25997F5C42d";
  const marketplaceAddress = "0x09635F643e140090A9A8Dcd712eD6285858ceBef";

  const [deployer, buyer, seller] = await ethers.getSigners();
  
  console.log("👤 Accounts:");
  console.log("   Deployer:", deployer.address);
  console.log("   Buyer:", buyer.address);  
  console.log("   Seller:", seller.address);
  console.log("");

  const NFT = await ethers.getContractFactory("NFT");
  const nft = NFT.attach(nftAddress);

  // 1. Create NFT with seller
  console.log("📋 Creating NFT as seller...");
  const tokenURI = "data:application/json;base64," + Buffer.from(JSON.stringify({
    name: "Debug NFT", 
    description: "Testing ownership",
    image: "https://via.placeholder.com/400x400/ff0000/ffffff?text=DEBUG"
  })).toString('base64');

  const createTx = await nft.connect(seller).createToken(tokenURI);
  await createTx.wait();
  console.log("✅ NFT created");

  const tokenId = await nft.getCurrentTokenId();
  console.log("🆔 Token ID:", tokenId.toString());

  // 2. Check ownership
  console.log("\n🔍 Checking ownership and approvals...");
  try {
    const owner = await nft.ownerOf(tokenId);
    console.log("👤 Token owner:", owner);
    console.log("📋 Seller address:", seller.address);
    console.log("✅ Owner matches seller:", owner.toLowerCase() === seller.address.toLowerCase());

    // Check if marketplace is approved
    const isApproved = await nft.isApprovedForAll(seller.address, marketplaceAddress);
    console.log("✅ Marketplace approved for all:", isApproved);

    const approvedFor = await nft.getApproved(tokenId);
    console.log("👤 Approved for token:", approvedFor);

  } catch (error) {
    console.error("❌ Error checking ownership:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 