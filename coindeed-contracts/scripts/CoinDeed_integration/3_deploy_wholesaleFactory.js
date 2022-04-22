const hre = require("hardhat");
const { ethers, upgrades } = hre;
const { getContracts, saveContract } = require('./utils');

async function main() {
    const network = hre.network.name;
    const contracts = await getContracts(network)[network];

    const CoinDeedAddressesProvider = await hre.ethers.getContractFactory("CoinDeedAddressesProvider");
    // const coinDeedAddressesProvider = await CoinDeedAddressesProvider.deploy();
    const coinDeedAddressesProvider = await CoinDeedAddressesProvider.attach(contracts.coinDeedAddressesProvider);

    await coinDeedAddressesProvider.deployed();
    await saveContract(network, 'coinDeedAddressesProvider', coinDeedAddressesProvider.address);
    console.log("CoinDeedAddressesProvider deployed to:", contracts.coinDeedAddressesProvider);
    // await hre.run("verify:verify", {
    //     address: coinDeedAddressesProvider.address,
    //     constructorArguments: [],
    // });

    const WholesaleFactory = await hre.ethers.getContractFactory(
        "WholesaleFactory"
    );
    const wholesaleFactory = await upgrades.deployProxy(WholesaleFactory, [contracts.coinDeedAddressesProvider]);
    // const wholesaleFactory = await upgrades.upgradeProxy(contracts.wholesaleFactory, WholesaleFactory);
    await wholesaleFactory.deployed();
    await saveContract(network, 'wholesaleFactory', wholesaleFactory.address);
    console.log("Wholesale Factory deployed to:", wholesaleFactory.address);

    console.log('Completed!');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
