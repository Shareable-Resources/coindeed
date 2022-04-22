const { ethers } = require("hardhat");
const { expect } = require("chai");
const { BigNumber } = require("@ethersproject/bignumber");
const ethersJS = require("ethers");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const coinDeedFactory = "0xd350b9ac63712e7b2f3520ccbae9e58da0e3cad7";
const quoteUsd = "0x0000000000000000000000000000000000000348";

describe("CoinDeedDao Integration Test", async function () {
  let usdt,
    busd,
    pool,
    dToken,
    coinDeedDao,
    deedA,
    deedB,
    deedAdressesProvider,
    mockFeedRegistry;
  beforeEach(async function () {
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const MockDToken = await ethers.getContractFactory("MockDToken");
    const MockCoinDeedFactory = await ethers.getContractFactory(
      "MockCoinDeedFactory"
    );
    const MockCoinDeedAddressesProvider = await ethers.getContractFactory(
      "MockCoinDeedAddressesProvider"
    );
    const LendingPool = await ethers.getContractFactory("LendingPool");
    const CoinDeedDao = await ethers.getContractFactory("CoinDeedDao");
    [deedA, deedB] = await ethers.getSigners();
    deedAdressesProvider = await MockCoinDeedAddressesProvider.deploy();
    const MockFeedRegistry = await ethers.getContractFactory(
      "MockFeedRegistry"
    );
    mockFeedRegistry = await MockFeedRegistry.deploy();
    usdt = await MockERC20.deploy(
      "Tether Token",
      "USDT",
      ethersJS.ethers.utils.parseUnits("1000000000", 6),
      6
    );
    busd = await MockERC20.deploy("BUSD Token", "BUSD", 1_000_000_000, 6);

    pool = await LendingPool.deploy();
    dToken = await MockDToken.deploy("Deed Token", "DToken");
    coinDeedDao = await CoinDeedDao.deploy();

    await dToken.grantRole(dToken.MINTER_ROLE(), coinDeedDao.address);
    await pool.initialize(
      deedAdressesProvider.address,
      ethersJS.ethers.utils.parseEther("420480"), // multiplierPerYear
      ethersJS.ethers.utils.parseEther("52560") // baseRatePerYear
    );

    await coinDeedDao.initialize(dToken.address, deedAdressesProvider.address);

    pool.addNewDeed(deedA.address);
    pool.addNewDeed(deedB.address);
    // create ERC20 pool
    await pool.createPool(usdt.address);
    await pool.createPool(busd.address);
    // set price FeedRegistry
    await mockFeedRegistry.setAnswer(ZERO_ADDRESS, quoteUsd, 4050000000000000);
    await mockFeedRegistry.setDecimals(ZERO_ADDRESS, quoteUsd, 12);
    await mockFeedRegistry.setAnswer(usdt.address, quoteUsd, 1000000);
    await mockFeedRegistry.setDecimals(usdt.address, quoteUsd, 6);
    await mockFeedRegistry.setAnswer(busd.address, quoteUsd, 990000);
    await mockFeedRegistry.setDecimals(busd.address, quoteUsd, 6);

    // setup CoinDeedAddressesProvider
    await deedAdressesProvider.setLendingPool(pool.address);
    await deedAdressesProvider.setCoinDeedDao(coinDeedDao.address);
    await deedAdressesProvider.setFeedRegistry(mockFeedRegistry.address);
  });

  it("Price FeedRegistry", async () => {
    expect(
      await mockFeedRegistry.latestAnswer(ZERO_ADDRESS, quoteUsd)
    ).to.be.eq(4050000000000000);
    expect(
      await mockFeedRegistry.latestAnswer(usdt.address, quoteUsd)
    ).to.be.eq(1000000);
    expect(
      await mockFeedRegistry.latestAnswer(busd.address, quoteUsd)
    ).to.be.eq(990000);
  });

  it("setCoinDeedAddressesProvider", async () => {
    await coinDeedDao.setCoinDeedAddressesProvider(
      deedAdressesProvider.address
    );
  });

  it("exchangRewardToken", async () => {
    expect(await coinDeedDao.exchangRewardToken(ZERO_ADDRESS, 1)).to.be.eq(
      32400
    ); // 4050*10*0.8
  });

  it("getCoinDeedManagementFee", async () => {
    expect(
      await coinDeedDao.getCoinDeedManagementFee(ZERO_ADDRESS, 1)
    ).to.be.eq(40500);
  });
});
