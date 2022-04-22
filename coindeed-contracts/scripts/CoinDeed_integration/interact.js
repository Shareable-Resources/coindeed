const hre = require("hardhat");

async function main() {
    const CoinDeedUtils = await hre.ethers.getContractFactory("CoinDeedUtils");
    const utils = await CoinDeedUtils.attach("0x4E765eD25c577AB426685d70EFb36157DeB0Fd51");

    console.log(await utils.withdrawStakeCheck(
        "ICoinDeed.DeedState.CLOSED",
        {"recruitingEndTimestamp":"1640227841","buyTimestamp":"1640227904","sellTimestamp":"1640228027"},
        300000000000000000000,
        true
    ));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
