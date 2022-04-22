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

describe("Utilization Unit Test", async function () {
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

  // CASE 1: SUPPLY 100%, BORROW 0%
  it("Deposit 100 ETH", async () => {
    let poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    // ------------- DEPOSIT 100 ETH------------------------
    await pool.deposit(ZERO_ADDRESS, ethersJS.ethers.utils.parseEther("100"), {
      value: ethersJS.ethers.utils.parseEther("100"),
    });
    poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    //check Ua
    let currentBalanceOfPool = await pool.getBalance();
    expect(
      await pool.utilizationRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0"));
    //check BorrowRate
    expect(
      await pool.getBorrowRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.025"));
    //check SupplyRate
    expect(
      await pool.getSupplyRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves,
        await pool.RESERVE_FACTOR_MANTISSA()
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0"));
  });

  it("Deposit 100 USD", async () => {
    let poolInfo = await pool.poolInfo(usdt.address);
    // ------------- DEPOSIT 100 USD------------------------
    await pool
      .connect(alice)
      .deposit(usdt.address, ethersJS.ethers.utils.parseUnits("100", 6));
    poolInfo = await pool.poolInfo(usdt.address);
    let currentBalanceOfPool = await usdt.balanceOf(pool.address);

    //check Ua
    expect(
      await pool.utilizationRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0"));
    //check BorrowRate
    expect(
      await pool.getBorrowRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.025"));
    //check SupplyRate
    expect(
      await pool.getSupplyRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves,
        await pool.RESERVE_FACTOR_MANTISSA()
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0"));
  });

  // CASE 2: SUPPLY 100%, BORROW 50%
  it("Deposit 100 ETH -  Borrow 50 ETH", async () => {
    let poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    // ------------- DEPOSIT 100 ETH------------------------
    await pool.deposit(ZERO_ADDRESS, ethersJS.ethers.utils.parseEther("100"), {
      value: ethersJS.ethers.utils.parseEther("100"),
    });
    // ------------- BORROW 50 ETH------------------------
    await pool
      .connect(deedA)
      .borrow(ZERO_ADDRESS, ethersJS.ethers.utils.parseEther("50"));
    poolInfo = await pool.poolInfo(ZERO_ADDRESS);

    //check Ua
    let currentBalanceOfPool = await pool.getBalance();
    expect(
      await pool.utilizationRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.5"));
    //check BorrowRate
    expect(
      await pool.getBorrowRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.125"));
    //check SupplyRate
    expect(
      await pool.getSupplyRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves,
        await pool.RESERVE_FACTOR_MANTISSA()
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.0625"));
  });

  it("Deposit 100 USD -  Borrow 50 USD", async () => {
    let poolInfo = await pool.poolInfo(usdt.address);
    // ------------- DEPOSIT 100 USD------------------------
    await pool
      .connect(alice)
      .deposit(usdt.address, ethersJS.ethers.utils.parseUnits("100", 6));
    // ------------- BORROW 50 USD------------------------
    await pool
      .connect(deedA)
      .borrow(usdt.address, ethersJS.ethers.utils.parseUnits("50", 6));
    poolInfo = await pool.poolInfo(usdt.address);
    let currentBalanceOfPool = await usdt.balanceOf(pool.address);

    //check Ua
    expect(
      await pool.utilizationRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.5"));
    //check BorrowRate
    expect(
      await pool.getBorrowRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.125"));
    //check SupplyRate
    expect(
      await pool.getSupplyRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves,
        await pool.RESERVE_FACTOR_MANTISSA()
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.0625"));
  });

  // CASE 3: SUPPLY 100%, BORROW 80%
  it("Deposit 100 ETH -  Borrow 80 ETH", async () => {
    let poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    // ------------- DEPOSIT 100 ETH------------------------
    await pool.deposit(ZERO_ADDRESS, ethersJS.ethers.utils.parseEther("100"), {
      value: ethersJS.ethers.utils.parseEther("100"),
    });
    // ------------- BORROW 50 ETH------------------------
    await pool
      .connect(deedA)
      .borrow(ZERO_ADDRESS, ethersJS.ethers.utils.parseEther("80"));
    poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    let currentBalanceOfPool = await pool.getBalance();

    //check Ua
    expect(
      await pool.utilizationRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.8"));
    //check BorrowRate
    expect(
      await pool.getBorrowRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.185"));
    //check SupplyRate
    expect(
      await pool.getSupplyRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves,
        await pool.RESERVE_FACTOR_MANTISSA()
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.148"));
  });

  it("Deposit 100 USD -  Borrow 80 USD", async () => {
    let poolInfo = await pool.poolInfo(usdt.address);
    // ------------- DEPOSIT 100 USD------------------------
    await pool
      .connect(alice)
      .deposit(usdt.address, ethersJS.ethers.utils.parseUnits("100", 6));
    // ------------- BORROW 80 USD------------------------
    await pool
      .connect(deedA)
      .borrow(usdt.address, ethersJS.ethers.utils.parseUnits("80", 6));
    poolInfo = await pool.poolInfo(usdt.address);
    let currentBalanceOfPool = await usdt.balanceOf(pool.address);

    //check Ua
    expect(
      await pool.utilizationRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.8"));
    //check BorrowRate
    expect(
      await pool.getBorrowRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.185"));
    //check SupplyRate
    expect(
      await pool.getSupplyRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves,
        await pool.RESERVE_FACTOR_MANTISSA()
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.148"));
  });

  // CASE 4: SUPPLY 100%, BORROW 10%
  it("Deposit 100 ETH -  Borrow 80 ETH", async () => {
    let poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    // ------------- DEPOSIT 100 ETH------------------------
    await pool.deposit(ZERO_ADDRESS, ethersJS.ethers.utils.parseEther("100"), {
      value: ethersJS.ethers.utils.parseEther("100"),
    });
    // ------------- BORROW 10 ETH------------------------
    await pool
      .connect(deedA)
      .borrow(ZERO_ADDRESS, ethersJS.ethers.utils.parseEther("10"));
    poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    let currentBalanceOfPool = await pool.getBalance();

    //check Ua
    expect(
      await pool.utilizationRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.1"));
    //check BorrowRate
    expect(
      await pool.getBorrowRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.045"));
    //check SupplyRate
    expect(
      await pool.getSupplyRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves,
        await pool.RESERVE_FACTOR_MANTISSA()
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.0045"));
  });

  it("Deposit 100 USD -  Borrow 10 USD", async () => {
    let poolInfo = await pool.poolInfo(usdt.address);
    // ------------- DEPOSIT 100 USD------------------------
    await pool
      .connect(alice)
      .deposit(usdt.address, ethersJS.ethers.utils.parseUnits("100", 6));
    // ------------- BORROW 10 USD------------------------
    await pool
      .connect(deedA)
      .borrow(usdt.address, ethersJS.ethers.utils.parseUnits("10", 6));
    poolInfo = await pool.poolInfo(usdt.address);
    let currentBalanceOfPool = await usdt.balanceOf(pool.address);

    //check Ua
    expect(
      await pool.utilizationRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.1"));
    //check BorrowRate
    expect(
      await pool.getBorrowRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.045"));
    //check SupplyRate
    expect(
      await pool.getSupplyRate(
        currentBalanceOfPool,
        poolInfo.totalBorrows,
        poolInfo.totalReserves,
        await pool.RESERVE_FACTOR_MANTISSA()
      )
    ).to.be.eq(ethersJS.ethers.utils.parseEther("0.0045"));
  });

  // CASE 5: expectRevert BORROW
  it("Deposit 100 ETH -  Borrow 81 ETH", async () => {
    // ------------- DEPOSIT 100 ETH------------------------
    await pool.deposit(ZERO_ADDRESS, ethersJS.ethers.utils.parseEther("100"), {
      value: ethersJS.ethers.utils.parseEther("100"),
    });
    // ------------- BORROW 10 ETH------------------------
    await expectRevert(
      pool
        .connect(deedA)
        .borrow(ZERO_ADDRESS, ethersJS.ethers.utils.parseEther("81")),
      "Coindeed: not enough liquidity"
    );
  });

  it("Deposit 100 USD -  Borrow 90 USD", async () => {
    // ------------- DEPOSIT 100 USD------------------------
    await pool
      .connect(alice)
      .deposit(usdt.address, ethersJS.ethers.utils.parseUnits("100", 6));
    // ------------- BORROW 90 USD------------------------
    await expectRevert(
      pool
        .connect(deedA)
        .borrow(usdt.address, ethersJS.ethers.utils.parseUnits("90", 6)),
      "Coindeed: not enough liquidity"
    );
  });
});
