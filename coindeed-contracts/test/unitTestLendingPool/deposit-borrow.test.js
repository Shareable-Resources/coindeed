const { ethers } = require("hardhat");
const { expect } = require("chai");
const { BigNumber } = require("@ethersproject/bignumber");
const ethersJS = require("ethers");
const { expectRevert } = require("@openzeppelin/test-helpers");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const quoteUsd = "0x0000000000000000000000000000000000000348";
const MAX_UINT = BigNumber.from("9999999999999999999999999999999");
const ether100 = ethersJS.ethers.utils.parseEther("100");
const ether90 = ethersJS.ethers.utils.parseEther("90");
const ether80 = ethersJS.ethers.utils.parseEther("80");
const ether50 = ethersJS.ethers.utils.parseEther("50");
const ether20 = ethersJS.ethers.utils.parseEther("20");
const ether10 = ethersJS.ethers.utils.parseEther("10");
const ether0 = ethersJS.ethers.utils.parseEther("0");
const time500 = 500;
const time1000 = 1000;
const time2000 = 2000;

describe("Deposit-Borrow Unit Test", async function () {
  let usdt,
    busd,
    pool,
    dToken,
    owner,
    alice,
    bob,
    carol,
    coinDeedDao,
    deedA,
    deedB,
    deedAdressesProvider,
    mockFeedRegistry;
  beforeEach(async function () {
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const MockDToken = await ethers.getContractFactory("MockDToken");
    const MockCoinDeedAddressesProvider = await ethers.getContractFactory(
      "MockCoinDeedAddressesProvider"
    );
    const LendingPool = await ethers.getContractFactory("LendingPool");
    const CoinDeedDao = await ethers.getContractFactory("CoinDeedDao");
    [owner, alice, bob, carol, deedA, deedB] = await ethers.getSigners();
    usdt = await MockERC20.deploy(
      "Tether Token",
      "USDT",
      1_000_000_000_000_000,
      6
    );
    busd = await MockERC20.deploy("BUSD Token", "BUSD", 1_000_000_000, 6);

    pool = await LendingPool.deploy();
    dToken = await MockDToken.deploy("Deed Token", "DToken");
    coinDeedDao = await CoinDeedDao.deploy();
    deedAdressesProvider = await MockCoinDeedAddressesProvider.deploy();
    const MockFeedRegistry = await ethers.getContractFactory(
      "MockFeedRegistry"
    );
    mockFeedRegistry = await MockFeedRegistry.deploy();

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

    await usdt.transfer(alice.address, "2000000000");
    await usdt.transfer(bob.address, "2000000000");
    expect(await usdt.balanceOf(alice.address)).to.be.eq("2000000000");
    await usdt
      .connect(alice)
      .approve(pool.address, "1000000000000000000000000000000");
    await usdt
      .connect(bob)
      .approve(pool.address, "1000000000000000000000000000000");
  });

  it("Ua = 0: Deposit 100 ETH - Borrow 0 ETH After 500 Block", async () => {
    // ------------- DEPOSIT 1000 ETH------------------------
    await pool.deposit(ZERO_ADDRESS, ether100, {
      value: ether100,
    });
    let poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    let userAssetInfo = await pool.userAssetInfo(owner.address, ZERO_ADDRESS);
    expect(userAssetInfo.amount).to.be.eq(
      ether100
    );

    // increase 500 block
    for (let i = 1; i < time500; i++) {
      await hre.network.provider.send("evm_mine", []);
    }

    //check pending
    expect(await pool.pendingToken(ZERO_ADDRESS, owner.address)).to.be.eq(
      ether0
    );
    expect(await pool.totalBorrowBalance(ZERO_ADDRESS, deedA.address)).to.be.eq(
      ether0
    );
    expect(await pool.pendingDToken(ZERO_ADDRESS, owner.address)).to.be.eq(
      ether0
    );
    expect(
      await pool.totalDepositBalance(ZERO_ADDRESS, owner.address)
    ).to.be.eq(ether100);
  });

  it("Ua=0.5: Deposit 100 ETH - Borrow 50 ETH After 500 Block", async () => {
    let poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    // ------------- DEPOSIT 100 ETH------------------------
    await pool.deposit(ZERO_ADDRESS, ether100, {
      value: ether100,
    });
    poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    let userAssetInfo = await pool.userAssetInfo(owner.address, ZERO_ADDRESS);
    expect(userAssetInfo.amount).to.be.eq(
      ether100
    );

    // ------------- BORROW 50 ETH------------------------
    await pool
      .connect(deedA)
      .borrow(ZERO_ADDRESS, ether50);
    let deedInfoA = await pool.deedInfo(deedA.address);
    poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    expect(deedInfoA.borrow).to.be.eq(ether50);

    expect(deedInfoA.totalBorrow).to.be.eq(
      ether50
    );

    expect(poolInfo.totalBorrows).to.be.eq(
      ether50
    );

    expect(poolInfo.supplyIndex).to.be.eq(
      ethersJS.ethers.utils.parseEther("1")
    ); // supplyIndex = (blockDelta*supplyRatePerblock) * supplyIndexOld + supplyIndexOld (When starting, supplyIndex = 1)

    expect(poolInfo.borrowIndex).to.be.eq(
      ethersJS.ethers.utils.parseEther("1")
    ); // borrowIndex = (blockDelta*borrowRatePerblock) * borrowIndexOld + borrowIndexOld (When starting, borrowIndex = 1)

    // supllyRate = 0.0625 => supplyRatePerblock = 0.00000002972792998
    // borrrowRate = 0.125 => borrowRatePerblock = 0.00000005945585997

    // increase 5000 block
    for (let i = 1; i < time500; i++) {
      await hre.network.provider.send("evm_mine", []);
    }

    //check pending
    expect(await pool.pendingToken(ZERO_ADDRESS, owner.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.0007417118531008")
    );
    expect(await pool.totalBorrowBalance(ZERO_ADDRESS, deedA.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("50.00148342370622655")
    );
    expect(await pool.pendingDToken(ZERO_ADDRESS, owner.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("24.03146404046592")
    );
    expect(
      await pool.totalDepositBalance(ZERO_ADDRESS, owner.address)
    ).to.be.eq(ethersJS.ethers.utils.parseEther("100.0007417118531008"));
  });

  it("Ua=0.8: Deposit 100 ETH - Borrow 80 ETH After 1000 Block", async () => {
    let poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    // ------------- DEPOSIT 100 ETH------------------------
    await pool.deposit(ZERO_ADDRESS, ether100, {
      value: ether100,
    });
    poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    let userAssetInfo = await pool.userAssetInfo(owner.address, ZERO_ADDRESS);
    expect(userAssetInfo.amount).to.be.eq(
      ether100
    );

    // ------------- BORROW 80 ETH------------------------
    await pool
      .connect(deedA)
      .borrow(ZERO_ADDRESS, ether80);
    let deedInfoA = await pool.deedInfo(deedA.address);
    poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    expect(deedInfoA.borrow).to.be.eq(ether80);

    expect(deedInfoA.totalBorrow).to.be.eq(
      ether80
    );

    expect(poolInfo.totalBorrows).to.be.eq(
      ether80
    );

    expect(poolInfo.supplyIndex).to.be.eq(
      ethersJS.ethers.utils.parseEther("1")
    ); // supplyIndex = (blockDelta*supplyRatePerblock) * supplyIndexOld + supplyIndexOld (When starting, supplyIndex = 1)

    expect(poolInfo.borrowIndex).to.be.eq(
      ethersJS.ethers.utils.parseEther("1")
    ); // borrowIndex = (blockDelta*borrowRatePerblock) * borrowIndexOld + borrowIndexOld (When starting, borrowIndex = 1)

    // supllyRate = 0.0625 => supplyRatePerblock = 0.00000002972792998
    // borrrowRate = 0.125 => borrowRatePerblock = 0.00000005945585997

    // increase 1000 block
    for (let i = 1; i < time1000; i++) {
      await hre.network.provider.send("evm_mine", []);
    }

    //check pending
    expect(await pool.pendingToken(ZERO_ADDRESS, owner.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.00351626712323985")
    );
    expect(await pool.totalBorrowBalance(ZERO_ADDRESS, deedA.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("80.00703253424649968")
    );
    expect(await pool.pendingDToken(ZERO_ADDRESS, owner.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("113.92705479297114")
    );
    expect(
      await pool.totalDepositBalance(ZERO_ADDRESS, owner.address)
    ).to.be.eq(ethersJS.ethers.utils.parseEther("100.00351626712323985"));
  });

  it("Ua=0.1: Deposit 100 ETH - Borrow 10 ETH After 2000 Block", async () => {
    let poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    // ------------- DEPOSIT 100 ETH------------------------
    await pool.deposit(ZERO_ADDRESS, ether100, {
      value: ether100,
    });
    poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    let userAssetInfo = await pool.userAssetInfo(owner.address, ZERO_ADDRESS);
    expect(userAssetInfo.amount).to.be.eq(
      ether100
    );

    // ------------- BORROW 10 ETH------------------------
    await pool
      .connect(deedA)
      .borrow(ZERO_ADDRESS, ether10);
    let deedInfoA = await pool.deedInfo(deedA.address);
    poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    expect(deedInfoA.borrow).to.be.eq(ether10);

    expect(deedInfoA.totalBorrow).to.be.eq(
      ether10
    );

    expect(poolInfo.totalBorrows).to.be.eq(
      ether10
    );

    expect(poolInfo.supplyIndex).to.be.eq(
      ethersJS.ethers.utils.parseEther("1")
    ); // supplyIndex = (blockDelta*supplyRatePerblock) * supplyIndexOld + supplyIndexOld (When starting, supplyIndex = 1)

    expect(poolInfo.borrowIndex).to.be.eq(
      ethersJS.ethers.utils.parseEther("1")
    ); // borrowIndex = (blockDelta*borrowRatePerblock) * borrowIndexOld + borrowIndexOld (When starting, borrowIndex = 1)

    // supllyRate = 0.0625 => supplyRatePerblock = 0.00000002972792998
    // borrrowRate = 0.125 => borrowRatePerblock = 0.00000005945585997

    // increase 2000 block
    for (let i = 1; i < time2000; i++) {
      await hre.network.provider.send("evm_mine", []);
    }

    //check pending
    expect(await pool.pendingToken(ZERO_ADDRESS, owner.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.0002139340752521")
    );
    expect(await pool.totalBorrowBalance(ZERO_ADDRESS, deedA.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("10.00042786815068411")
    );
    expect(await pool.pendingDToken(ZERO_ADDRESS, owner.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("6.93146403816804")
    );
    expect(
      await pool.totalDepositBalance(ZERO_ADDRESS, owner.address)
    ).to.be.eq(ethersJS.ethers.utils.parseEther("100.0002139340752521"));
  });
});
