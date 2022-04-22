const hre = require('hardhat');
const { ethers, upgrades } = hre;

const { getContracts, saveContract } = require('./utils')

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  // impl next
  const LendingPool = await ethers.getContractFactory("LendingPool");
  const pool = await LendingPool.attach(contracts.pool);

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

  // console.log(await pool.deposit(ZERO_ADDRESS, "100000000000000000", {value: "100000000000000000"}));

  let userAssetInfo = await pool.userAssetInfo("0x1bab8030249382a887f967fcaa7fe0be7b390728", ZERO_ADDRESS);
  console.log(userAssetInfo);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });