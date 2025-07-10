const fs = require('fs');
const path = require('path');
const hre = require("hardhat");

async function main() {
  const contractName = process.argv[2] || "NFTCollection";
  
  console.log(`Flattening ${contractName}.sol...`);
  
  try {
    const outputFile = path.join(__dirname, '..', `${contractName}.flattened.sol`);
    const flattenedCode = await hre.run("flatten:get-flattened-sources", {
      files: [`hardhat/contracts/${contractName}.sol`],
    });
    
    const fixedCode = flattenedCode.replace(
      /\/\/ SPDX-License-Identifier: .+\n/g,
      (match, index) => (index === 0 ? match : "")
    );
    
    fs.writeFileSync(outputFile, fixedCode);
    console.log(`Flattened contract written to ${outputFile}`);
    
    console.log("\nTo manually verify on Etherscan:");
    console.log("1. Go to Etherscan's contract verification page");
    console.log("2. Select 'Solidity (Single file)' for compiler type");
    console.log("3. Set compiler version to match your hardhat.config.js");
    console.log("4. Set optimization to match your hardhat.config.js");
    console.log("5. Copy the entire content of the flattened file as contract source code");
    console.log("6. If needed, add constructor arguments in ABI-encoded format");
  } catch (error) {
    console.error("Error flattening contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
  }); 