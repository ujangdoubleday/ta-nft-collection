const fs = require('fs');
const path = require('path');

const abiDir = path.join(__dirname, '../lib/blockchain/abi');
if (!fs.existsSync(abiDir)) {
  fs.mkdirSync(abiDir, { recursive: true });
  console.log(`Created directory: ${abiDir}`);
}

const contracts = ['NFTCollection', 'NFTFactory'];

const extractedContracts = [];

contracts.forEach(contractName => {
  try {
    const artifactPath = path.join(
      __dirname, 
      `../hardhat/artifacts/contracts/${contractName}.sol/${contractName}.json`
    );
    
    if (!fs.existsSync(artifactPath)) {
      console.error(`Artifact not found for ${contractName} at ${artifactPath}`);
      console.error(`Make sure you've compiled your contracts with 'npx hardhat compile' first`);
      return;
    }
    
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    const abi = artifact.abi;
    
    const abiPath = path.join(abiDir, `${contractName}.json`);
    fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
    
    console.log(`Extracted ABI for ${contractName} to ${abiPath}`);
    extractedContracts.push(contractName);
  } catch (error) {
    console.error(`Error extracting ABI for ${contractName}:`, error.message);
  }
});

try {
  const factoryPath = path.join(
    __dirname, 
    '../hardhat/artifacts/contracts/NFTFactory.sol/NFTFactory.json'
  );

  if (!fs.existsSync(factoryPath)) {
    console.error(`NFTFactory artifact not found at ${factoryPath}`);
  } else {
    const factoryArtifact = JSON.parse(fs.readFileSync(factoryPath, 'utf8'));
    const eventsAbi = factoryArtifact.abi.filter(item => item.type === 'event');
    
    const eventsAbiPath = path.join(abiDir, 'NFTFactoryEvents.json');
    fs.writeFileSync(eventsAbiPath, JSON.stringify(eventsAbi, null, 2));
    
    console.log(`Extracted events ABI for NFTFactory to ${eventsAbiPath}`);
    extractedContracts.push('NFTFactoryEvents');
  }
} catch (error) {
  console.error('Error extracting events ABI for NFTFactory:', error.message);
}

if (extractedContracts.length > 0) {
  try {
    let indexContent = '';
    
    extractedContracts.forEach(contractName => {
      const exportName = contractName === 'NFTCollection' 
        ? 'NFT_COLLECTION_ABI' 
        : contractName === 'NFTFactory' 
          ? 'NFT_FACTORY_ABI' 
          : 'NFT_FACTORY_EVENTS_ABI';
      
      indexContent += `// @ts-ignore - These will be imported properly as JSON\n`;
      indexContent += `import ${exportName} from './${contractName}.json';\n`;
    });
    
    indexContent += '\nexport { ';
    indexContent += extractedContracts.map(contractName => {
      return contractName === 'NFTCollection' 
        ? 'NFT_COLLECTION_ABI' 
        : contractName === 'NFTFactory' 
          ? 'NFT_FACTORY_ABI' 
          : 'NFT_FACTORY_EVENTS_ABI';
    }).join(', ');
    indexContent += ' };\n';
    
    const indexPath = path.join(abiDir, 'index.ts');
    fs.writeFileSync(indexPath, indexContent);
    
    console.log(`Generated index.ts file at ${indexPath}`);
  } catch (error) {
    console.error('Error generating index.ts file:', error.message);
  }
}

console.log('ABI extraction complete'); 