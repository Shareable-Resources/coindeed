require("dotenv").config();

require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("hardhat-abi-exporter");
require("hardhat-contract-sizer");
require("@nomiclabs/hardhat-web3");

module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
  networks: {
    hardhat: {
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
      forking: {
        url: process.env.ALCHEMY_KEY !== undefined ? 
        `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}` : 
        `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
        blockNumber: 14000000 
      },
    },
    local: {
      url: process.env.LOCAL_URL || "http://127.0.0.1:8545",
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 2000000000,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  abiExporter: {
    path: "./build",
    clear: true,
    flat: true,
    spacing: 2,
    pretty: true,
  },
  mocha: {
    timeout: 50000,
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
};
