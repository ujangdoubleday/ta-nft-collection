const hre = require("hardhat");
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  // Mengambil alamat dari environment variable
  const factoryAddress = process.env.CONTRACT_ADDRESS;
  
  if (!factoryAddress) {
    console.error("Please provide the NFTFactory contract address via CONTRACT_ADDRESS environment variable");
    console.log("Usage: CONTRACT_ADDRESS=0xYourAddress npx hardhat run scripts/verify-factory.js --network sepolia");
    process.exit(1);
  }
  
  console.log(`Preparing to verify NFTFactory at address: ${factoryAddress}`);
  
  try {
    // Mendapatkan parameter konstruktor dari .env atau default
    const factoryOwner = process.env.FACTORY_OWNER || (await ethers.getSigners())[0].address;
    const creationFee = process.env.CREATION_FEE || ethers.parseEther("0.001");
    
    console.log("Using constructor arguments:");
    console.log(`- Factory Owner: ${factoryOwner}`);
    console.log(`- Creation Fee: ${creationFee}`);
    
    // Verifikasi kontrak NFTFactory
    console.log("\nVerifying contract with parameters...");
    await hre.run("verify:verify", {
      address: factoryAddress,
      contract: "contracts/NFTFactory.sol:NFTFactory",
      constructorArguments: [
        factoryOwner,
        creationFee
      ],
    });
    
    console.log("\nNFTFactory contract successfully verified!");
  } catch (error) {
    console.error("\nError during verification:", error.message);
    
    if (error.message.includes("Already Verified")) {
      console.log("Contract is already verified!");
    } else {
      console.log("\nVerification failed. Please check the error message above.");
      console.log("You may need to adjust the constructor arguments or check if the contract is already verified.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
  }); 