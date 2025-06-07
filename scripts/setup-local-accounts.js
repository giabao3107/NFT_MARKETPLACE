const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Setting up local development accounts...");
  
  // Get the default accounts
  const [deployer, addr1, addr2, ...addrs] = await ethers.getSigners();
  const allAccounts = [deployer, addr1, addr2, ...addrs];
  
  console.log("\n📋 Available Accounts:");
  console.log("====================");
  
  // Pre-defined private keys from the deterministic mnemonic
  const privateKeys = [
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
    "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
    "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"
  ];
  
  // Display first 5 accounts with their balances and private keys
  for (let i = 0; i < Math.min(5, allAccounts.length); i++) {
    const account = allAccounts[i];
    const balance = await account.getBalance();
    const balanceInEth = ethers.utils.formatEther(balance);
    
    console.log(`Account ${i}: ${account.address}`);
    console.log(`Balance: ${balanceInEth} ETH`);
    console.log(`Private Key: ${privateKeys[i]}`);
    console.log("---");
  }
  
  console.log("\n💡 Instructions:");
  console.log("1. Copy any private key above");
  console.log("2. In MetaMask: Click profile icon → Import Account → Private Key");
  console.log("3. Paste the private key");
  console.log("4. Add localhost network if not already added");
  console.log("5. Switch between accounts to test the application");
  
  console.log("\n🔗 Network Details for MetaMask:");
  console.log("- Network Name: Hardhat Local");
  console.log("- RPC URL: http://localhost:8545");
  console.log("- Chain ID: 1337");
  console.log("- Currency Symbol: ETH");
  console.log("- Block Explorer: (leave empty)");
  
  console.log("\n🎯 Quick Start:");
  console.log("1. Use Account 0 private key for initial testing");
  console.log("2. This account was used to deploy contracts");
  console.log("3. It has slightly less ETH due to deployment gas costs");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 