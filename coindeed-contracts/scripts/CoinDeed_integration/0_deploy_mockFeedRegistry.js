const hre = require("hardhat");
const { ethers, upgrades } = hre;
const { getContracts, saveContract } = require('./utils');

async function main() {
    const network = hre.network.name;
    const contracts = await getContracts(network)[network];

    const MockFeedRegistry = await hre.ethers.getContractFactory("MockFeedRegistry");
    // const mockFeedRegistry = await MockFeedRegistry.deploy();
    const mockFeedRegistry = await MockFeedRegistry.attach(contracts.feedRegistry);

    await mockFeedRegistry.deployed();
    await saveContract(network, 'feedRegistry', mockFeedRegistry.address);
    console.log("MockFeedRegistry deployed to:", contracts.feedRegistry);
    await hre.run("verify:verify", {
        address: mockFeedRegistry.address,
        constructorArguments: [],
    });

    console.log('Completed!');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
