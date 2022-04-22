const hre = require("hardhat");
const { ethers, upgrades } = hre;

const { getContracts } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  // impl next
  const CoinDeedDao = await ethers.getContractFactory("CoinDeedDao");
  console.log("contracts.dToken:", contracts.dToken);
  console.log(
    "contracts.coinDeedAddressesProvider:",
    contracts.coinDeedAddressesProvider
  );
  const coinDeedDao = await upgrades.deployProxy(CoinDeedDao, [
    contracts.dToken, // Dtoken
    contracts.coinDeedAddressesProvider //coinDeedAddressesProvider
  ]);
  await coinDeedDao.deployed();
  await saveContract(network, 'coinDeedDao', coinDeedDao.address);
  console.log(`Deployed Dao to ${coinDeedDao.address}`);
  console.log("Completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
