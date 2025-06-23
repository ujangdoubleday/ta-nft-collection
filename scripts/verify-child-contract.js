const hre = require("hardhat");
require("dotenv").config();

async function main() {
  // Mengambil alamat dari environment variable
  const collectionAddress = process.env.CONTRACT_ADDRESS;
  
  if (!collectionAddress) {
    console.error("Please provide the NFTCollection contract address via CONTRACT_ADDRESS environment variable");
    console.log("Usage: CONTRACT_ADDRESS=0xYourAddress npx hardhat run scripts/verify-child-contract.js --network sepolia");
    process.exit(1);
  }
  
  console.log(`Verifying NFTCollection at address: ${collectionAddress}`);
  
  try {
    // Coba verifikasi kontrak NFTCollection
    // Jangan sertakan constructor arguments karena kontrak dibuat oleh factory
    await hre.run("verify:verify", {
      address: collectionAddress,
      contract: "contracts/NFTCollection.sol:NFTCollection",
    });
    
    console.log("NFTCollection contract successfully verified!");
  } catch (error) {
    console.error("Error during verification:", error.message);
    
    if (error.message.includes("Already Verified")) {
      console.log("Contract is already verified!");
    } else if (error.message.includes("missing constructor arguments")) {
      console.log("Try verifying with constructor arguments...");
      
      // Jika terjadi error, coba untuk mendapatkan informasi kontrak secara manual
      console.log("Please check the contract on Etherscan and provide constructor arguments manually.");
      console.log("You may need to retrieve the constructor arguments from the blockchain.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Verification error:", error);
    process.exit(1);
  }); 