const hre = require("hardhat");
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const collectionAddress = process.env.CONTRACT_ADDRESS;
  
  if (!collectionAddress) {
    console.error("Please provide the NFTCollection contract address via CONTRACT_ADDRESS environment variable");
    console.log("Usage: CONTRACT_ADDRESS=0xYourAddress npx hardhat run scripts/verify-collection.js --network sepolia");
    process.exit(1);
  }
  
  console.log(`Preparing to verify NFTCollection at address: ${collectionAddress}`);
  
  try {
    const nftCollection = await ethers.getContractAt("NFTCollection", collectionAddress);
    
    console.log("Retrieving contract parameters...");
    const name = await nftCollection.name();
    const symbol = await nftCollection.symbol();
    const owner = await nftCollection.owner();
    const contractURI = await nftCollection.contractURI();
    const maxSupply = await nftCollection.maxSupply();
    
    console.log("Found constructor parameters:");
    console.log(`- Name: ${name}`);
    console.log(`- Symbol: ${symbol}`);
    console.log(`- Owner: ${owner}`);
    console.log(`- Contract URI: ${contractURI}`);
    console.log(`- Max Supply: ${maxSupply}`);
    
    console.log("\nVerifying contract with retrieved parameters...");
    await hre.run("verify:verify", {
      address: collectionAddress,
      contract: "hardhat/contracts/NFTCollection.sol:NFTCollection",
      constructorArguments: [
        name,
        symbol,
        owner,
        contractURI,
        maxSupply
      ],
    });
    
    console.log("\nNFTCollection contract successfully verified!");
  } catch (error) {
    console.error("\nError during verification:", error.message);
    
    if (error.message.includes("Already Verified")) {
      console.log("Contract is already verified!");
    } else {
      console.log("\nFallback to standard verification without arguments...");
      try {
        await hre.run("verify:verify", {
          address: collectionAddress,
          contract: "hardhat/contracts/NFTCollection.sol:NFTCollection",
        });
        console.log("NFTCollection contract successfully verified without arguments!");
      } catch (fallbackError) {
        console.error("Fallback verification also failed:", fallbackError.message);
        console.log("\nManual verification may be required. Steps to manually verify:");
        console.log("1. Go to Etherscan and find your contract");
        console.log("2. Click 'Verify and Publish'");
        console.log("3. Select 'Solidity (Standard-Json-Input)'");
        console.log("4. Use flattened source code or upload source files");
        console.log("5. Enter constructor arguments in ABI-encoded format");
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
  }); 