const hre = require("hardhat");
const { ethers, upgrades } = hre;

const { getContracts } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  // impl next
  const CoinDeedAddressProvider = await ethers.getContractFactory("CoinDeedAddressProvider");
  const coinDeedAddressProvider = await upgrades.upgradeProxy(
    contracts.coinDeedAddressProvider,
    CoinDeedAddressProvider
  );
  await coinDeedAddressProvider.deployed();
  console.log(`Deployed coinDeedAddressProvider to ${coinDeedAddressProvider.address}`);
  console.log("Completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
