const hre = require('hardhat')
const { ethers, upgrades } = hre
const { getContracts, saveContract } = require('./utils')

async function main() {
  const network = hre.network.name
  const contracts = await getContracts(network)[network]

  const CoinDeedAddressesProvider = await hre.ethers.getContractFactory(
    'CoinDeedAddressesProvider'
  )
  const coinDeedAddressesProvider = await CoinDeedAddressesProvider.attach(
    contracts.coinDeedAddressesProvider
  )

  await coinDeedAddressesProvider.setFeedRegistry(contracts.feedRegistry)
  await coinDeedAddressesProvider.setSwapRouter(contracts.swapRouter)
  await coinDeedAddressesProvider.setLendingPool(contracts.lendingPool)
  await coinDeedAddressesProvider.setCoinDeedFactory(contracts.coinDeedFactory)
  await coinDeedAddressesProvider.setWholesaleFactory(
    contracts.wholesaleFactory
  )
  await coinDeedAddressesProvider.setDeedToken(contracts.dToken)
  await coinDeedAddressesProvider.setCoinDeedDeployer(
    contracts.coinDeedDeployer
  )
  await coinDeedAddressesProvider.setTreasury(contracts.coinDeedTreasury)
  await coinDeedAddressesProvider.setVault(contracts.coinDeedVault)
  await coinDeedAddressesProvider.setCoinDeedDao(contracts.coinDeedDao)
  console.log('CoinDeedAddressesProvider setting address succeed')

  console.log('Completed !')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
