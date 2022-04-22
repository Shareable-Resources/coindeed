const hre = require("hardhat");
const { ethers, upgrades } = hre;
const { getContracts, saveContract } = require('./utils');

async function main() {
    const network = hre.network.name;
    const contracts = await getContracts(network)[network];

    const CoinDeedTreasury = await hre.ethers.getContractFactory(
        "CoinDeedTreasury"
    );
    // const coinDeedTreasury = await upgrades.deployProxy(CoinDeedTreasury, []);
    // const coinDeedTreasury = await upgrades.upgradeProxy(contracts.coinDeedTreasury, CoinDeedTreasury);
    const coinDeedTreasury = await CoinDeedTreasury.attach(contracts.coinDeedTreasury);
    await coinDeedTreasury.deployed();
    await saveContract(network, 'coinDeedTreasury', coinDeedTreasury.address);
    console.log("CoinDeedTreasury deployed to:", coinDeedTreasury.address);

    console.log("Completed !");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
