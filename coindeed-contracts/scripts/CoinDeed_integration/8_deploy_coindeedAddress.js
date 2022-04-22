const hre = require("hardhat");
const { ethers, upgrades } = hre;
const { getContracts, saveContract } = require('./utils');

async function main() {
    const network = hre.network.name;
    const contracts = await getContracts(network)[network];

    const CoinDeedAddressesProvider = await hre.ethers.getContractFactory("CoinDeedAddressesProvider");
    const coinDeeedAddressesProvider = await upgrades.deployProxy(CoinDeedAddressesProvider, []);
    await coinDeeedAddressesProvider.deployed();
    await saveContract(network, 'coinDeedAddressesProvider', coinDeeedAddressesProvider.address);
    console.log("CoinDeedAddressesProvider deployed to:", coinDeeedAddressesProvider.address);
    console.log('Completed!');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
