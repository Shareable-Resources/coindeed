const hre = require('hardhat')
const { ethers, upgrades } = hre
const { getContracts, saveContract } = require('./utils')

async function main() {
  const network = hre.network.name
  const contracts = await getContracts(network)[network]

  const CoinDeedAddressesProviderUtils = await hre.ethers.getContractFactory(
    'CoinDeedAddressesProviderUtils'
  )
  const coinDeedAddressesProviderUtils = await CoinDeedAddressesProviderUtils.deploy();
  // const coinDeedAddressesProviderUtils =
  //   await CoinDeedAddressesProviderUtils.attach(
  //     contracts.coinDeedAddressesProviderUtils
  //   )

  await coinDeedAddressesProviderUtils.deployed()
  await saveContract(
    network,
    'coinDeedAddressesProviderUtils',
    coinDeedAddressesProviderUtils.address
  )
  console.log(
    'CoinDeedAddressesProviderUtils deployed to:',
    contracts.coinDeedAddressesProviderUtils
  )

  const CoinDeedUtils = await hre.ethers.getContractFactory('CoinDeedUtils')
  // const coinDeedUtils = await CoinDeedUtils.deploy();
  const coinDeedUtils = await CoinDeedUtils.attach(contracts.coinDeedUtils)

  await coinDeedUtils.deployed()
  await saveContract(network, 'coinDeedUtils', coinDeedUtils.address)
  console.log('CoinDeedUtils deployed to:', contracts.coinDeedUtils)

  const CoinDeedDeployer = await hre.ethers.getContractFactory(
    'CoinDeedDeployer',
    {
      libraries: {
        CoinDeedAddressesProviderUtils: coinDeedAddressesProviderUtils.address,
        CoinDeedUtils: coinDeedUtils.address,
      },
    }
  )
  const coinDeedDeployer = await CoinDeedDeployer.deploy();
  // const coinDeedDeployer = await CoinDeedDeployer.attach(
  //   contracts.coinDeedDeployer
  // )
  await coinDeedDeployer.deployed()
  await saveContract(network, 'coinDeedDeployer', coinDeedDeployer.address)
  console.log('CoinDeedDeployer deployed to:', coinDeedDeployer.address)

  // Verify coindeed provider utils contract
  await hre.run("verify:verify", {
      address: coinDeedAddressesProviderUtils.address,
      constructorArguments: [],
  });

  // Verify coindeed utils contract
  // await hre.run("verify:verify", {
  //     address: coinDeedUtils.address,
  //     constructorArguments: [],
  // });

  // Verify coindeed deployer contract
  await hre.run('verify:verify', {
    address: coinDeedDeployer.address,
    constructorArguments: [],
  })

  console.log('Completed!')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
