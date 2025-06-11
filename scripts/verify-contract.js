const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.error("Please provide CONTRACT_ADDRESS env variable");
    process.exit(1);
  }

  // Contract constructor arguments - these should match what was used during deployment
  const name = process.env.NAME || "My NFT Collection";
  const symbol = process.env.SYMBOL || "MNFT";
  const owner = process.env.OWNER_ADDRESS;
  const collectionURI = process.env.COLLECTION_URI || "https://example.com/collection";

  if (!owner) {
    console.error("Please provide OWNER_ADDRESS env variable");
    process.exit(1);
  }

  console.log(`Verifying contract at address: ${contractAddress}`);
  console.log(`With arguments: ${name}, ${symbol}, ${owner}, ${collectionURI}`);

  try {
    // Verify the contract
    await hre.run("verify:verify", {
      address: contractAddress,
      contract: "contracts/NFTCollection.sol:NFTCollection",
      constructorArguments: [name, symbol, owner, collectionURI],
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