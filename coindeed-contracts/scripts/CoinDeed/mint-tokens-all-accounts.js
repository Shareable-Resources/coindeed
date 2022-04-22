// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const tokens = require("./tokens");
const { ethers } = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();

  const Token = await hre.ethers.getContractFactory("Token");
  for (var i = 0; i < tokens.length; i++) {
    const token = await Token.attach(tokens[i]);
    for (const account of accounts) {
      await token.mint(
        account.address,
        "10000000000000000000000000"
      );
      console.log(`minted: ${tokens[i]} for ${account.address}`);
    }
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
