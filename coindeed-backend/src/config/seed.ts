import { PrismaClient } from '@prisma/client';
import { hexGenerator, typeGenerator, numberGenerator, dateGenerator, booleanGenerator } from '../helpers/dataGenerators';
const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 50; i++) {
    await prisma.deed.create({
      data: {
        deedAddress: hexGenerator(42),
        deedManager: hexGenerator(42),
        status: typeGenerator('statusType'),
        type: typeGenerator('deedType'),
        swapType: typeGenerator('swapType'),
        actionType: typeGenerator('actionType'),
        wholesaleAddress: hexGenerator(42),
        coinA: hexGenerator(42),
        coinAName: typeGenerator('coinType'),
        coinB: hexGenerator(42),
        coinBName: typeGenerator('coinType'),
        loanLeverage: numberGenerator(100),
        size: numberGenerator(100000000),
        sizeConsumed: numberGenerator(20),
        managementFee: numberGenerator(100) / 100,
        recruitingEndDate: dateGenerator(new Date('2021-11-12T01:57:45.271Z'), new Date('2021-11-25T01:57:45.271Z')),
        escrowEndDate: dateGenerator(new Date('2021-11-12T01:57:45.271Z'), new Date('2021-11-25T01:57:45.271Z')),
        deedEndDate: dateGenerator(new Date('2021-11-12T01:57:45.271Z'), new Date('2021-11-25T01:57:45.271Z')),
        systemTriggeredAssetPriceDrop: numberGenerator(100) / 100,
        systemTriggeredLeveragedAdjustment: numberGenerator(25),
        systemTriggeredDeedCompletionAssetPriceDrop: numberGenerator(100) / 100,
        allowBrokers: booleanGenerator(),
        minimumBrokerStakingAmount: 0.0,
        published: dateGenerator(new Date('2021-11-12T01:57:45.271Z'), new Date('2021-11-25T01:57:45.271Z')),
        updated: dateGenerator(new Date('2021-11-12T01:57:45.271Z'), new Date('2021-11-25T01:57:45.271Z')),
        progress: numberGenerator(100) / 100,
        profit: numberGenerator(10000) / 100,
        allOrMy: typeGenerator('allOrMyType'),
      },
    });
  }

  for (let i = 0; i < 100; i++) {
    await prisma.wholesale.create({
      data: {
        status: typeGenerator('wholesaleStatusType'),
        wholesaleAddress: hexGenerator(42),
        size: numberGenerator(30),
        managementFee: numberGenerator(100) / 100,
        recruitingEndDate: dateGenerator(new Date('2021-11-12T01:57:45.271Z'), new Date('2021-11-25T01:57:45.271Z')),
        escrowEndDate: dateGenerator(new Date('2021-11-12T01:57:45.271Z'), new Date('2021-11-25T01:57:45.271Z')),
        wholesaleEndDate: dateGenerator(new Date('2021-11-12T01:57:45.271Z'), new Date('2021-11-25T01:57:45.271Z')),
        wholesaleManager: hexGenerator(42),

        systemTriggeredAssetPriceDrop: numberGenerator(100) / 100,
        systemTriggeredLeveragedAdjustment: numberGenerator(25),
        systemTriggeredDeedCompletionAssetPriceDrop: numberGenerator(100) / 100,
        allowBrokers: booleanGenerator(),
        minimumBrokerStakingAmount: 0.0,
        manuallyTriggeredAssetPriceDrop: 0.0,
        manuallyTriggeredLeverageAdjustment: 1,
        published: dateGenerator(new Date('2021-11-12T01:57:45.271Z'), new Date('2021-11-25T01:57:45.271Z')),
        updated: dateGenerator(new Date('2021-11-12T01:57:45.271Z'), new Date('2021-11-25T01:57:45.271Z')),

        deedAddress: hexGenerator(42),
        token: typeGenerator('coinType'),
        pricePerToken: numberGenerator(10000000),
        type: typeGenerator('wholesaleType'),
        minimumDeedRequirement: numberGenerator(10),
        transactionFee: numberGenerator(2000),
        profit: numberGenerator(10000) / 100,

        // /* MIGHT NEED THESE? */
        // loanLeverage Float
        // managementFee Float @default(0.00)
        // recruitingEndDate DateTime
        // manuallyTriggeredAssetPriceDrop Float @default(0.00)
        // manuallyTriggeredLeverageAdjustment Int
        // systemTriggeredAssetPriceDrop Float @default(0.00)
        // systemTriggeredLeveragedAdjustment Int
        // systemTriggeredDeedCompletionAssetPriceDrop Float
        // allowBrokers Boolean
        // minimumBrokerStakingAmount Float
        // published DateTime @default(now())
        // updated DateTime @default(now())
      },
    });
  }

  await prisma.lendingPool.createMany({
    data: [
      {
        name: 'ETH',
        decimals: 18,
        tokenAddress: '0x0000000000000000000000000000000000000000',
        oracelTokenAddress: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
      },
      {
        name: 'BNB',
        decimals: 18,
        tokenAddress: '0x730129b9aE5A6B3Fa6a674a5dC33a84Cb1711D07',
        oracelTokenAddress: '0xcf0f51ca2cDAecb464eeE4227f5295F2384F84ED',
      },
      {
        name: 'USDC',
        decimals: 6,
        tokenAddress: '0x248E7Fa5fB6De623d339c837299692fFB4ea5971',
        oracelTokenAddress: '0xa24de01df22b63d23Ebc1882a5E3d4ec0d907bFB',
      },
      {
        name: 'DAI',
        decimals: 18,
        tokenAddress: '0xDFEe9D9e9aC61980f4F43dD12B8F62Ade3D0B28B',
        oracelTokenAddress: '0x2bA49Aaa16E6afD2a993473cfB70Fa8559B523cF',
      },
      {
        name: 'USDT',
        decimals: 6,
        tokenAddress: '0xd35d2e839d888d1cDBAdef7dE118b87DfefeD20e',
        oracelTokenAddress: '0xa24de01df22b63d23Ebc1882a5E3d4ec0d907bFB',
      },
      {
        name: 'TKN1',
        decimals: 18,
        tokenAddress: '0x0196674A7Ec59F821023F8eE03326d6d3907E656',
        oracelTokenAddress: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
      },
      {
        name: 'TKN2',
        decimals: 18,
        tokenAddress: '0xED18CD520eF5a46f358b555365912759FE54fE0A',
        oracelTokenAddress: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
      },
    ],
  });
  await prisma.purchaseToken.createMany({
    data: [
      { name: 'USDT', decimals: 6, address: '0xd35d2e839d888d1cDBAdef7dE118b87DfefeD20e' },
      { name: 'USDC', decimals: 6, address: '0x248E7Fa5fB6De623d339c837299692fFB4ea5971' },
      { name: 'BNB', decimals: 18, address: '0x730129b9aE5A6B3Fa6a674a5dC33a84Cb1711D07' },
      { name: 'DAI', decimals: 18, address: '0xDFEe9D9e9aC61980f4F43dD12B8F62Ade3D0B28B' },
    ],
  });

  await prisma.depositToken.createMany({
    data: [
      {
        name: 'ETH',
        decimals: 18,
        address: '0x0000000000000000000000000000000000000000',
      },
      { name: 'USDT', decimals: 6, address: '0xd35d2e839d888d1cDBAdef7dE118b87DfefeD20e' },
      { name: 'USDC', decimals: 6, address: '0x248E7Fa5fB6De623d339c837299692fFB4ea5971' },
      { name: 'BNB', decimals: 18, address: '0x730129b9aE5A6B3Fa6a674a5dC33a84Cb1711D07' },
      { name: 'DAI', decimals: 18, address: '0xDFEe9D9e9aC61980f4F43dD12B8F62Ade3D0B28B' },
    ],
  });
}
// run npx prisma db seed to seed the db
main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
