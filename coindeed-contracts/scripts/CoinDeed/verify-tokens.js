// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const tokens = require("./tokens");
const hre = require("hardhat");

async function main() {
  const promises = [];
  for (var i = 0; i < tokens.length; i++) {
    try {
      if (i == 0) {
        promises.push(
          hre.run("verify:verify", {
            address: tokens[i],
            constructorArguments: [`Deed Token`, `DEED`],
          })
        );
      } else {
        promises.push(
          hre.run("verify:verify", {
            address: tokens[i],
            constructorArguments: [`Token-${i}`, `TKN${i}`],
          })
        );
      }
    } catch (err) {
      console.log(err);
    }
  }

  Promise.all(promises);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
