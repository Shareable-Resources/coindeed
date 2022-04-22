const hre = require('hardhat')
const { ethers, upgrades } = hre
const { getContracts, saveContract } = require('./utils')

async function main() {
  const network = hre.network.name
  const contracts = await getContracts(network)[network]

  const CoinDeedFactory = await hre.ethers.getContractFactory('CoinDeedFactory')
  const coinDeedFactory = await CoinDeedFactory.deploy(
      contracts.coinDeedAddressesProvider,
      contracts.platformFee,
      contracts.stakingMultiplier
  );
  // const coinDeedFactory = await CoinDeedFactory.attach(
  //   contracts.coinDeedFactory
  // )
  await coinDeedFactory.deployed()
  await saveContract(network, 'coinDeedFactory', coinDeedFactory.address)
  console.log('CoinDeedFactory deployed to:', coinDeedFactory.address)
  await hre.run("verify:verify", {
      address: coinDeedFactory.address,
      constructorArguments: [
          contracts.coinDeedAddressesProvider,
          contracts.platformFee,
          contracts.stakingMultiplier
      ],
  });

  await coinDeedFactory.grantRole(
    '0x0000000000000000000000000000000000000000000000000000000000000000',
    '0x7E85d848f32d46593A8ce1fB93aa6827F2e9C101'
  )
  console.log(
    'Grant Role DEFAULT_ADMIN_ROLE succeed to: 0x7E85d848f32d46593A8ce1fB93aa6827F2e9C101'
  )

  await coinDeedFactory.permitToken(
    '0x0196674A7Ec59F821023F8eE03326d6d3907E656'
  )
  await coinDeedFactory.permitToken(
    '0xED18CD520eF5a46f358b555365912759FE54fE0A'
  )
  await coinDeedFactory.permitToken(
    '0x9dec1bf22848b27f22b00e412fc0d181faf57370'
  )
  await coinDeedFactory.permitToken(
    '0x0000000000000000000000000000000000000000'
  )
  await coinDeedFactory.permitToken(
    '0xd35d2e839d888d1cDBAdef7dE118b87DfefeD20e'
  )
  await coinDeedFactory.permitToken(
    '0x730129b9aE5A6B3Fa6a674a5dC33a84Cb1711D07'
  )
  await coinDeedFactory.permitToken(
    '0xDFEe9D9e9aC61980f4F43dD12B8F62Ade3D0B28B'
  )
  await coinDeedFactory.permitToken(
    '0x248E7Fa5fB6De623d339c837299692fFB4ea5971'
  )
  await coinDeedFactory.permitToken(
    '0xc36e25b6e3692a3310e173cb94bdd14662d5bf6a'
  )
  await coinDeedFactory.permitToken(
    '0xc778417e063141139fce010982780140aa0cd5ab'
  )
  await coinDeedFactory.permitToken(
    '0x819242E08d84fC6C05389B84b85913B828439c90'
  )

  console.log('Permit token succeed')

  console.log('Completed !')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
