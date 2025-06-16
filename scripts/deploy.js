const hre = require("hardhat");

async function main() {
  const NFTFactory = await hre.ethers.getContractFactory("NFTFactory");
  const nftFactory = await NFTFactory.deploy();

  await nftFactory.waitForDeployment();
  const address = await nftFactory.getAddress();
  
  // Wait for confirmations silently
  await new Promise(r => setTimeout(r, 30000));
}

main()
  .then(() => process.exit(0))
  .catch(() => {
    process.exit(1);
  }); 