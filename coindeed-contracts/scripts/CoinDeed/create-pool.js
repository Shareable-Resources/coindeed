// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const tokens = require("./tokens");

async function main() {
  const lendingPoolAddress = "0x4d2f78e074f21dD53eEcE5789bd7c2570907B96A";
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const MockOracle = await hre.ethers.getContractFactory("MockOracle");
  const LendingPool = await hre.ethers.getContractFactory("LendingPool");

  for (var i = 0; i < tokens.length; i++) {
    const oracle = await MockOracle.deploy(100000000); // 1$
    await oracle.deployed();
    const lendingPool = await LendingPool.attach(lendingPoolAddress);
    await lendingPool.createPool(tokens[i], oracle.address, 18, {
      gasLimit: 5000000,
    });
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
