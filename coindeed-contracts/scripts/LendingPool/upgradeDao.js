const hre = require('hardhat');
const { ethers, upgrades } = hre;

const { getContracts, saveContract } = require('./utils')

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  // impl next
  const Dao = await ethers.getContractFactory("Dao");
  const dao = await upgrades.upgradeProxy(contracts.coindeedDao, Dao);
  await dao.deployed();
  console.log(`Deployed Dao to ${dao.address}`);

  console.log('Completed!');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });