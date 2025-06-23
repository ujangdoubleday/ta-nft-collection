const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const network = await hre.ethers.provider.getNetwork();
  console.log("Deploying NFTFactory contract to network:", network.name);
  
  // Default values
  const factoryOwner = process.env.FACTORY_OWNER || (await hre.ethers.getSigners())[0].address;
  const creationFee = process.env.CREATION_FEE || hre.ethers.parseEther("0.001"); // Default 0.001 ETH
  
  console.log(`Factory Owner: ${factoryOwner}`);
  console.log(`Creation Fee: ${creationFee} wei`);

  // Deploy NFTFactory contract
  const NFTFactory = await hre.ethers.getContractFactory("NFTFactory");
  const nftFactory = await NFTFactory.deploy(factoryOwner, creationFee);

  await nftFactory.waitForDeployment();
  
  const nftFactoryAddress = await nftFactory.getAddress();
  console.log(`NFTFactory deployed to: ${nftFactoryAddress}`);

  // Wait for a few block confirmations for Etherscan verification
  console.log("Waiting for block confirmations...");
  await nftFactory.deploymentTransaction().wait(5);
  
  // Verify contract on Etherscan if API key is available
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: nftFactoryAddress,
        constructorArguments: [factoryOwner, creationFee],
      });
      console.log("Contract verified on Etherscan!");
    } catch (error) {
      console.error("Error verifying contract:", error.message);
    }
  } else {
    console.log("Skipping Etherscan verification (no API key provided)");
  }
  
  console.log("Deployment complete!");
  return { nftFactoryAddress, factoryOwner, creationFee };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  }); 