const hre = require('hardhat');
const { ethers, upgrades } = hre;

const { getContracts, saveContract } = require('./utils')

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  // impl next
  const LendingPool = await ethers.getContractFactory("LendingPool");
  const pool = await upgrades.upgradeProxy(contracts.pool, LendingPool);
  await pool.deployed();
  console.log(`Deployed LendingPool to ${pool.address}`);

  console.log('Completed!');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });