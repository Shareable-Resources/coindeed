const hre = require("hardhat");
const { ethers, upgrades } = hre;

const { getContracts, saveContract } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  // impl next
  const Dao = await ethers.getContractFactory("Dao");
  console.log("contracts.DToken:", contracts.DToken);
  console.log("contracts.ethOracle:", contracts.ethOracle);
  const dao = await upgrades.deployProxy(Dao, [
    contracts.DToken, // Dtoken
    contracts.ethOracle, // ethOracle
    8
  ]);
  await dao.deployed();
  await saveContract(network, "dao", dao.address);
  console.log(`Deployed Dao to ${dao.address}`);

  console.log("Completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
