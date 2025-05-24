const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting testnet deployment...");
  
  const network = await ethers.provider.getNetwork();
  console.log(`📡 Deploying to network: ${network.name} (Chain ID: ${network.chainId})`);
  
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deploying with account: ${deployer.address}`);
  
  const balance = await deployer.getBalance();
  console.log(`💰 Account balance: ${ethers.utils.formatEther(balance)} ETH`);
  
  if (balance.lt(ethers.utils.parseEther("0.1"))) {
    console.warn("⚠️  Warning: Low balance. You may need testnet ETH from a faucet.");
  }

  console.log("\n📋 Step 1: Deploying NFTMarketplace...");
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.deployed();
  console.log(`✅ NFTMarketplace deployed to: ${nftMarketplace.address}`);

  console.log("\n📋 Step 2: Deploying NFT...");
  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(nftMarketplace.address);
  await nft.deployed();
  console.log(`✅ NFT deployed to: ${nft.address}`);

  console.log("\n📋 Step 3: Updating frontend configuration...");
  
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
  console.log("\n📊 Deployment Summary:");
  console.log("=" * 50);
  console.log(`Network: ${network.name} (${network.chainId})`);
  console.log(`NFT Contract: ${nft.address}`);
  console.log(`Marketplace Contract: ${nftMarketplace.address}`);
  console.log(`Deployer: ${deployer.address}`);
  
  const listingPrice = await nftMarketplace.getListingPrice();
  console.log(`Listing Price: ${ethers.utils.formatEther(listingPrice)} ETH`);
  
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    nftAddress: nft.address,
    marketplaceAddress: nftMarketplace.address,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    listingPrice: ethers.utils.formatEther(listingPrice)
  };
  
  const deploymentPath = path.join(__dirname, `../deployments/${network.name}-deployment.json`);
  const deploymentsDir = path.dirname(deploymentPath);
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment info saved to: ${deploymentPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 