const hre = require("hardhat");
const { ethers, upgrades } = hre;
const ethersJS = require("ethers");

const { getContracts, saveContract } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  // impl next
  const LendingPool = await ethers.getContractFactory("LendingPool");
  console.log("contracts.coinDeedAddressesProvider:", contracts.coinDeedAddressesProvider);
  const pool = await upgrades.deployProxy(LendingPool, [
    contracts.coinDeedAddressesProvider, // coinDeedAddressesProvider
    ethersJS.ethers.utils.parseEther("420480"), // multiplierPerYear
    ethersJS.ethers.utils.parseEther("52560"), // baseRatePerYear
  ]);
  await pool.deployed();
  await saveContract(network, 'lendingPool', pool.address);
  console.log(`Deployed LendingPool to ${pool.address}`);
  console.log("Completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
