const hre = require("hardhat");

async function main() {
  console.log("Deploying NFTFactory contract...");

  // Deploy the NFTFactory contract
  const NFTFactory = await hre.ethers.getContractFactory("NFTFactory");
  const nftFactory = await NFTFactory.deploy();

  await nftFactory.waitForDeployment();

  const address = await nftFactory.getAddress();
  console.log(`NFTFactory deployed to: ${address}`);
  
  console.log("Waiting for block confirmations...");
  // Wait for some confirmations to ensure the contract is mined
  await new Promise(r => setTimeout(r, 30000));
  
  console.log("Verifying contract on Etherscan...");
  // Verify the contract on Etherscan
  try {
    await hre.run("verify:verify", {
      address: address,
      contract: "contracts/NFTFactory.sol:NFTFactory",
      constructorArguments: [],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 