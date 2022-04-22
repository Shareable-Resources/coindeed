const hre = require("hardhat");
const { ethers, upgrades } = hre;

const { getContracts } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  // impl next
  const CoinDeedDao = await ethers.getContractFactory("CoinDeedDao");
  const coinDeedDao = await upgrades.upgradeProxy(
    contracts.coinDeedDao,
    CoinDeedDao
  );
  await coinDeedDao.deployed();
  console.log(`Deployed coinDeedDao to ${coinDeedDao.address}`);
  console.log("Completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
