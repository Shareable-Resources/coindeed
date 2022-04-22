const hre = require("hardhat");
const { ethers, upgrades } = hre;
const { getContracts, saveContract } = require('./utils');

async function main() {
    const network = hre.network.name;
    const contracts = await getContracts(network)[network];

    const CoinDeedVault = await hre.ethers.getContractFactory(
        "CoinDeedVault"
    );
    const coinDeedVault = await upgrades.deployProxy(CoinDeedVault, [contracts.dToken]);
    // const coinDeedVault = await upgrades.upgradeProxy(contracts.coinDeedVault, CoinDeedVault);
    // const coinDeedVault = await CoinDeedVault.attach(contracts.coinDeedVault);
    await coinDeedVault.deployed();
    await saveContract(network, 'coinDeedVault', coinDeedVault.address);
    console.log("coinDeedVault deployed to:", coinDeedVault.address);

    console.log("Completed !");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
