const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting localhost deployment...");
  
  const network = await hre.ethers.provider.getNetwork();
  console.log(`📡 Deploying to network: ${network.name} (Chain ID: ${network.chainId})`);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deploying with account: ${deployer.address}`);
  
  const balance = await deployer.getBalance();
  console.log(`💰 Account balance: ${hre.ethers.utils.formatEther(balance)} ETH`);

  console.log("\n📋 Step 1: Deploying NFTMarketplace...");
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.deployed();
  console.log(`✅ NFTMarketplace deployed to: ${nftMarketplace.address}`);

  console.log("\n📋 Step 2: Deploying NFT...");
  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(nftMarketplace.address);
  await nft.deployed();
  console.log(`✅ NFT deployed to: ${nft.address}`);

  console.log("\n📋 Step 3: Testing contract connections...");
  try {
    const listingPrice = await nftMarketplace.getListingPrice();
    console.log(`💰 Listing Price: ${hre.ethers.utils.formatEther(listingPrice)} ETH`);
    console.log("✅ Contract calls working properly");
  } catch (error) {
    console.error("❌ Contract test failed:", error);
  }

  console.log("\n📋 Step 4: Updating frontend configuration...");
  const configPath = path.join(__dirname, '../src/config.js');
  const configContent = `export const nftaddress = "${nft.address}";
export const nftmarketaddress = "${nftMarketplace.address}";

export const networkInfo = {
  name: "${network.name}",
  chainId: ${network.chainId},
  deployer: "${deployer.address}",
  deployedAt: "${new Date().toISOString()}"
};
`;

  try {
    fs.writeFileSync(configPath, configContent);
    console.log(`✅ Config updated at: ${configPath}`);
  } catch (error) {
    console.error(`❌ Failed to update config: ${error.message}`);
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Contract Addresses:");
  console.log(`   NFTMarketplace: ${nftMarketplace.address}`);
  console.log(`   NFT: ${nft.address}`);
  console.log("\n💡 Next steps:");
  console.log("1. Make sure your MetaMask is connected to localhost:8545");
  console.log("2. Import one of the Hardhat accounts using private key");
  console.log("3. Start your React app with 'npm start'");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 