// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const tokens = require("./tokens");
const { ethers } = require("hardhat");
const uniswapV2RouterAddress = "0xf164fC0Ec4E93095b804a4795bBe1e041497b92a";
const address = "0xf164fC0Ec4E93095b804a4795bBe1e041497b92a";

async function main() {
  const Token = await hre.ethers.getContractFactory("Token");
  const amount = "100000000000000000000";
  const accounts = await ethers.getSigners();
  const account = accounts[0].address;
  const uniswapV2Router01 = await hre.ethers.getContractAt(
    "IUniswapV2Router01",
    uniswapV2RouterAddress
  );

  for (var i = 0; i < tokens.length - 1; i++) {
    const token0 = await Token.attach(tokens[i]);
    for (var j = i + 1; j < tokens.length; j++) {
      try {
        await token0.mint(account, amount, { gasLimit: "5000000" });
        await token0.approve(uniswapV2RouterAddress, amount, {
          gasLimit: "5000000",
        });
        console.log("Token 0 approved");

        const token1 = await Token.attach(tokens[j]);
        await token1.mint(account, amount, { gasLimit: "5000000" });
        await token1.approve(uniswapV2RouterAddress, amount, {
          gasLimit: "5000000",
        });
        console.log("Token 1 approved");
        await uniswapV2Router01.addLiquidity(
          token0.address,
          token1.address,
          amount,
          amount,
          0,
          0,
          address,
          1684523308,
          { gasLimit: "5000000" }
        );

        console.log(`Pair funded: ${token0.address} - ${token1.address}`);
      } catch (err) {
        console.log(err);
      }
    }
    await token0.mint(account, ethers.utils.parseEther("1000"), {
      gasLimit: "5000000",
    });
    await token0.approve(
      uniswapV2Router01.address,
      ethers.utils.parseEther("1000"),
      { gasLimit: "5000000" }
    );
    await uniswapV2Router01.addLiquidityETH(
      token0.address,
      ethers.utils.parseEther("1000"),
      0,
      ethers.utils.parseEther("0.01"),
      account,
      1684523308,
      { gasLimit: "5000000", value: ethers.utils.parseEther("0.01") }
    );

    console.log(`Pair funded: ${token0.address} - ETH`);
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
