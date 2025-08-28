require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: "auto",
      timeout: 1000000
    },
    routescan: {
      url: 'https://ethereum-sepolia-rpc.publicnode.com',
      accounts: [process.env.PRIVATE_KEY]
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  sourcify: {
    enabled: true,
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
      routescan: "routescan",
    },
    customChains: [
      {
        network: "routescan",
        chainId: 11155111,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/testnet/evm/11155111/etherscan",
          browserURL: "https://testnet.routescan.io/"
        }
      }
    ]
  },
  paths: {
    artifacts: "./hardhat/artifacts",
    cache: "./hardhat/cache",
    sources: "./hardhat/contracts",
    tests: "./hardhat/test",
  },
};
