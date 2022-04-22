const hre = require("hardhat");
const { ethers, upgrades } = hre;
const { getContracts, saveContract } = require('./utils');

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  const CoinDeed = await hre.ethers.getContractFactory(
    "CoinDeed",
    {
        libraries: {
            "CoinDeedAddressesProviderUtils": contracts.coinDeedAddressesProviderUtils,
            "CoinDeedUtils": contracts.coinDeedUtils,
        }
    }
  );

  const coinDeed = await CoinDeed.attach("0x0403410BE7f04996c8AB0C24323A2deAc8A05E7a");
  console.log("Coin Deed deployed to:", coinDeed.address);
  await hre.run("verify:verify", {
    address: coinDeed.address,
    constructorArguments: [
      "0x7e85d848f32d46593a8ce1fb93aa6827f2e9c101", // manager
      contracts.coinDeedAddressesProvider,
      "0", // staking Amount,
      {"tokenA": "0xd35d2e839d888d1cDBAdef7dE118b87DfefeD20e","tokenB": "0x730129b9aE5A6B3Fa6a674a5dC33a84Cb1711D07"}, // pair
      {"deedSize": "1000000", "leverage": 1, "managementFee": 100, "minimumBuy": 100, "minimumJoin": "0"}, // deed params
      {"recruitingEndTimestamp": 1646136000, "buyTimestamp": 1646139600, "sellTimestamp": 1646143200  }, // executionTime
      {"trigger": 200, "secondTrigger": 300, "leverage": 1}, // risk mitigation
      {"allowed": false} // broker config
    ],
    contract: "contracts/CoinDeed.sol:CoinDeed"
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
