const fs = require('fs');
const path = require('path');

// Create ABI directory if it doesn't exist
const abiDir = path.join(__dirname, '../lib/blockchain/abi');
if (!fs.existsSync(abiDir)) {
  fs.mkdirSync(abiDir, { recursive: true });
}

// Contract names to extract ABIs for
const contracts = ['NFTCollection', 'NFTFactory'];

// Extract ABIs
contracts.forEach(contractName => {
  // Path to the compiled contract JSON
  const artifactPath = path.join(
    __dirname, 
    `../artifacts/contracts/${contractName}.sol/${contractName}.json`
  );
  
  // Check if the artifact exists
  if (fs.existsSync(artifactPath)) {
    // Read the artifact
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    // Extract the ABI
    const abi = artifact.abi;
    
    // Save the ABI to a new file
    const abiPath = path.join(abiDir, `${contractName}.json`);
    fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
    
    console.log(`Extracted ABI for ${contractName} to ${abiPath}`);
  } else {
    console.error(`Artifact not found for ${contractName}`);
  }
});

// Also extract events ABI for NFTFactory
const factoryPath = path.join(
  __dirname, 
  '../artifacts/contracts/NFTFactory.sol/NFTFactory.json'
);

if (fs.existsSync(factoryPath)) {
  const factoryArtifact = JSON.parse(fs.readFileSync(factoryPath, 'utf8'));
  const eventsAbi = factoryArtifact.abi.filter(item => item.type === 'event');
  
  const eventsAbiPath = path.join(abiDir, 'NFTFactoryEvents.json');
  fs.writeFileSync(eventsAbiPath, JSON.stringify(eventsAbi, null, 2));
  
  console.log(`Extracted events ABI for NFTFactory to ${eventsAbiPath}`);
}

console.log('ABI extraction complete'); 