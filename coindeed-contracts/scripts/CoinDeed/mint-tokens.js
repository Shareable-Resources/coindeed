// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const tokens = require('./tokens');
async function main() {
  const address = '0x7E85d848f32d46593A8ce1fB93aa6827F2e9C101';
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Token = await hre.ethers.getContractFactory("Token");
  for (var i=0; i<tokens.length; i++) {
    const token = await Token.attach(
      tokens[i],
    );
    const tx = await token.mint(address, "10000000000000000000000000");
    await tx.wait();
    console.log(`minted: ${tokens[i]} for ${address}`);
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
