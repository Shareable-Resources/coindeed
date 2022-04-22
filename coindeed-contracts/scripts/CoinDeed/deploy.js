// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const tokens = require("./tokens");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const gasData = await hre.ethers.provider.getFeeData();

  const WholesaleFactory = await hre.ethers.getContractFactory(
    "WholesaleFactory"
  );
  const wholesaleFactory = await WholesaleFactory.deploy();
  await wholesaleFactory.deployed();
  console.log("Wholesale Factory deployed to:", wholesaleFactory.address);

  const CoinDeedDeployer = await hre.ethers.getContractFactory(
    "CoinDeedDeployer"
  );
  const coinDeedDeployer = await CoinDeedDeployer.deploy();
  await coinDeedDeployer.deployed();
  console.log("CoinDeedDeployer deployed to:", coinDeedDeployer.address);

  const CoinDeedFactory = await hre.ethers.getContractFactory(
    "CoinDeedFactory"
  );
  const lendingPoolAddress = "0x4d2f78e074f21dD53eEcE5789bd7c2570907B96A";

  const coinDeedFactory = await CoinDeedFactory.deploy(
    tokens[0],
    wholesaleFactory.address,
    lendingPoolAddress,
    coinDeedDeployer.address,
    200,
    4000
  );
  await coinDeedFactory.deployed();
  console.log("Coin Deed Factory deployed to:", coinDeedFactory.address);

  for (const token of tokens) {
    await coinDeedFactory.permitToken(token, {
      gasLimit: "5000000",
      maxFeePerGas: gasData.maxFeePerGas.mul(2),
      maxPriorityFeePerGas: gasData.maxPriorityFeePerGas.mul(2),
      type: 2,
    });
  }

  console.log(
    `hardhat verify --network rinkeby ${coinDeedFactory.address} ${tokens[0]} ${wholesaleFactory.address}  ${lendingPoolAddress} ${coinDeedDeployer.address}  200 4000`
  );

  console.log(`hardhat verify --network rinkeby ${wholesaleFactory.address}`);

  // await hre.run("verify:verify", {
  //   address: coinDeedFactory.address,
  //   constructorArguments: [
  //     tokens[0],
  //     wholesaleFactory.address,
  //     coinDeedDeployer.address,
  //     "0xa645e94c17ef1054bfd55e472a11d22c6c215ffd",
  //     200,
  //   ],
  // });
  //
  // await hre.run("verify:verify", {
  //   address: wholesaleFactory.address,
  // });
  //
  // await hre.run("verify:verify", {
  //   address: coinDeedDeployer.address,
  //   constructorArguments: [],
  // });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
