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

describe("LendingPool Integration Test", async function () {
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

  it("CreatePool", async () => {
    await pool.createPool(busd.address);
    await expectRevert(pool.createPool(busd.address), "Coindeed: pool exists");
  });

  it("addNewDeed", async () => {
    await pool.addNewDeed(bob.address);
    const deed = await pool.deedInfo(bob.address);
    expect(deed.isValid).to.be.eq(true);
  });

  it("BorrowRate - SupplyRate", async () => {
    //borrow 0%
    expect(await pool.getBorrowRate(ether100, ether0, ether0)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.025")
    );
    expect(await pool.getSupplyRate(ether100, ether0, ether0, ether0)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0")
    );
    //borrow 80%
    expect(await pool.getBorrowRate(ether20, ether80, ether0)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.185")
    );
    expect(await pool.getSupplyRate(ether20, ether80, ether0, ether0)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.148")
    );
    //borrow 50%
    expect(await pool.getBorrowRate(ether50, ether50, ether0)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.125")
    );
    expect(await pool.getSupplyRate(ether50, ether50, ether0, ether0)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.0625")
    );
    //borrow 10%
    expect(await pool.getBorrowRate(ether90, ether10, ether0)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.045")
    );
    expect(await pool.getSupplyRate(ether90, ether10, ether0, ether0)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.0045")
    );
    //borrow 100% (don't happen)
    expect(await pool.getBorrowRate(ether0, ether100, ether0)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.225")
    );
    expect(await pool.getSupplyRate(ether0, ether100, ether0, ether0)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.225")
    );
  });

  it("deposit ETH and withdraw ETH", async () => {
    await pool
      .connect(bob)
      .deposit(ZERO_ADDRESS, ethersJS.ethers.utils.parseEther("100"), {
        value: ethersJS.ethers.utils.parseEther("100"),
      });
    // deposit  2 ETH
    await pool.deposit(ZERO_ADDRESS, ethersJS.ethers.utils.parseEther("2"), {
      value: ethersJS.ethers.utils.parseEther("2"),
    });
    let userAssetInfo = await pool.userAssetInfo(owner.address, ZERO_ADDRESS);
    expect(userAssetInfo.amount).to.be.eq(
      ethersJS.ethers.utils.parseEther("2")
    );
    await pool.withdraw(ZERO_ADDRESS, ethersJS.ethers.utils.parseEther("2"));
    userAssetInfo = await pool.userAssetInfo(owner.address, ZERO_ADDRESS);
    expect(userAssetInfo.amount).to.be.eq(0);
  });

  it("Deposit - Borrow - Repay - Repay -WithDraw ETH", async () => {
    let poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    // ------------- DEPOSIT 1000 ETH------------------------
    await pool.deposit(ZERO_ADDRESS, ethersJS.ethers.utils.parseEther("1000"), {
      value: ethersJS.ethers.utils.parseEther("1000"),
    });
    poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    let userAssetInfo = await pool.userAssetInfo(owner.address, ZERO_ADDRESS);
    expect(userAssetInfo.amount).to.be.eq(
      ethersJS.ethers.utils.parseEther("1000")
    );
    expect(poolInfo.totalBorrows).to.be.eq(
      ethersJS.ethers.utils.parseEther("0")
    );
    expect(poolInfo.supplyIndex).to.be.eq(
      ethersJS.ethers.utils.parseEther("1")
    ); // supplyIndex = (blockDelta*supplyRatePerblock) * supplyIndexOld + supplyIndexOld (When starting, supplyIndex = 1)
    expect(poolInfo.borrowIndex).to.be.eq(
      ethersJS.ethers.utils.parseEther("1")
    ); // borrowIndex = (blockDelta*borrowRatePerblock) * borrowIndexOld + borrowIndexOld (When starting, borrowIndex = 1)
    // supllyRate = 0 => supplyRatePerblock = 0
    // borrrowRate = 0.025 => borrowRatePerblock = 0.0.00000001189117199

    //check pending
    expect(await pool.pendingToken(ZERO_ADDRESS, owner.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0")
    );
    expect(await pool.totalBorrowBalance(ZERO_ADDRESS, deedA.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0")
    );
    expect(await pool.pendingDToken(ZERO_ADDRESS, owner.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0")
    );
    expect(
      await pool.totalDepositBalance(ZERO_ADDRESS, owner.address)
    ).to.be.eq(ethersJS.ethers.utils.parseEther("1000"));

    // ------------- BORROW 500 ETH------------------------
    await pool
      .connect(deedA)
      .borrow(ZERO_ADDRESS, ethersJS.ethers.utils.parseEther("500"));
    let deedInfoA = await pool.deedInfo(deedA.address);
    poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    expect(deedInfoA.borrow).to.be.eq(ethersJS.ethers.utils.parseEther("500"));

    expect(deedInfoA.totalBorrow).to.be.eq(
      ethersJS.ethers.utils.parseEther("500")
    );

    expect(poolInfo.totalBorrows).to.be.eq(
      ethersJS.ethers.utils.parseEther("500")
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
      ethersJS.ethers.utils.parseEther("0.007417118531008")
    );
    expect(await pool.totalBorrowBalance(ZERO_ADDRESS, deedA.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("500.0148342370622655")
    );
    expect(await pool.pendingDToken(ZERO_ADDRESS, owner.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("240.3146404046592")
    );
    expect(
      await pool.totalDepositBalance(ZERO_ADDRESS, owner.address)
    ).to.be.eq(ethersJS.ethers.utils.parseEther("1000.007417118531008"));

    // ------------- REPAY 300 ETH------------------------
    await pool
      .connect(deedA)
      .repay(ZERO_ADDRESS, ethersJS.ethers.utils.parseEther("300"), {
        value: ethersJS.ethers.utils.parseEther("300"),
      });
    deedInfoA = await pool.deedInfo(deedA.address);
    poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    expect(deedInfoA.borrow).to.be.eq(ethersJS.ethers.utils.parseEther("200")); // 500-300
    expect(poolInfo.supplyIndex).to.be.eq(
      ethersJS.ethers.utils.parseEther("1.000014863964992")
    ); // supplyIndex = (blockDelta*supplyRatePerblock) * supplyIndexOld + supplyIndexOld (When starting, supplyIndex = 1)
    expect(poolInfo.borrowIndex).to.be.eq(
      ethersJS.ethers.utils.parseEther("1.0000297279299845")
    ); // borrowIndex = (blockDelta*borrowRatePerblock) * borrowIndexOld + borrowIndexOld (When starting, borrowIndex = 1)
    expect(deedInfoA.totalBorrow).to.be.eq(
      ethersJS.ethers.utils.parseEther("200.01486396499225")
    ); // (500-300) + 500* borrowIndex
    expect(poolInfo.totalBorrows).to.be.eq(
      ethersJS.ethers.utils.parseEther("200.01486396499225")
    ); // (500-300) + 0.01486396499(interest)

    // supllyRate = 0.01300156076 => supplyRatePerblock = 0.000000006184151808
    // borrrowRate = 0.06500297279 => borrowRatePerblock = 0.00000003091846118

    // increase 2000 block
    for (let i = 1; i < time2000; i++) {
      await hre.network.provider.send("evm_mine", []);
    }

    //check pending
    expect(await pool.pendingToken(ZERO_ADDRESS, owner.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.0136129856881885")
    );
    expect(await pool.totalBorrowBalance(ZERO_ADDRESS, deedA.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("200.027225971377251612")
    );
    expect(await pool.pendingDToken(ZERO_ADDRESS, owner.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("441.0607362973074")
    );
    expect(
      await pool.totalDepositBalance(ZERO_ADDRESS, owner.address)
    ).to.be.eq(ethersJS.ethers.utils.parseEther("1000.0136129856881885"));

    // ------------- REPAY 200 ETH------------------------
    await pool
      .connect(deedA)
      .repay(ZERO_ADDRESS, ethersJS.ethers.utils.parseEther("200"), {
        value: ethersJS.ethers.utils.parseEther("200"),
      });
    deedInfoA = await pool.deedInfo(deedA.address);
    poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    expect(deedInfoA.borrow).to.be.eq(ethersJS.ethers.utils.parseEther("0")); // 200-200
    expect(poolInfo.supplyIndex).to.be.eq(
      ethersJS.ethers.utils.parseEther("1.000027232155471617")
    ); // supplyIndex = (blockDelta*supplyRatePerblock) * supplyIndexOld + supplyIndexOld (When starting, supplyIndex = 1)
    expect(poolInfo.borrowIndex).to.be.eq(
      ethersJS.ethers.utils.parseEther("1.000091566124985383")
    ); // borrowIndex = (blockDelta*borrowRatePerblock) * borrowIndexOld + borrowIndexOld (When starting, borrowIndex = 1)
    expect(deedInfoA.totalBorrow).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.027232155472491645")
    ); // 200.03322017537482577 - 200
    expect(poolInfo.totalBorrows).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.027232155472491742")
    ); // 200.027261886145610505 - 200

    //check pending
    expect(await pool.pendingToken(ZERO_ADDRESS, owner.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.0136160777358085") //
    );
    expect(await pool.totalBorrowBalance(ZERO_ADDRESS, deedA.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.027232155472491645")
    );
    expect(await pool.pendingDToken(ZERO_ADDRESS, owner.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("441.1609186401954")
    );
    expect(
      await pool.totalDepositBalance(ZERO_ADDRESS, owner.address)
    ).to.be.eq(ethersJS.ethers.utils.parseEther("1000.0136160777358085"));

    // ------------- WITHDRAW 500 ETH ------------------------
    await pool.withdraw(ZERO_ADDRESS, ethersJS.ethers.utils.parseEther("500"));
    deedInfoA = await pool.deedInfo(deedA.address);
    poolInfo = await pool.poolInfo(ZERO_ADDRESS);
    userAssetInfo = await pool.userAssetInfo(owner.address, ZERO_ADDRESS);

    //check pending
    expect(await pool.pendingToken(ZERO_ADDRESS, owner.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0")
    );
    expect(await pool.totalBorrowBalance(ZERO_ADDRESS, deedA.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.027232155796384435")
    );
    expect(await pool.pendingDToken(ZERO_ADDRESS, owner.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0")
    );
    //checkDtoken
    expect(await dToken.balanceOf(owner.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("441.1609238873106")
    );
    expect(
      await pool.totalDepositBalance(ZERO_ADDRESS, owner.address)
    ).to.be.eq(ethersJS.ethers.utils.parseEther("500"));

    expect(userAssetInfo.amount).to.be.eq(
      ethersJS.ethers.utils.parseEther("500")
    ); // 1000 - 500

    //claimDtoken
    await pool.claimDToken(ZERO_ADDRESS);
    expect(await dToken.balanceOf(owner.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("441.1609291356489")
    );

    expect(await pool.pendingDToken(ZERO_ADDRESS, owner.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0")
    );
  });

  it("Deposit USD and withdraw USD", async () => {
    await pool
      .connect(alice)
      .deposit(usdt.address, ethersJS.ethers.utils.parseUnits("1000", 6));
    await pool
      .connect(bob)
      .deposit(usdt.address, ethersJS.ethers.utils.parseUnits("2000", 6));
    let userAssetInfo = await pool.userAssetInfo(alice.address, usdt.address);
    expect(userAssetInfo.amount).to.be.eq(
      ethersJS.ethers.utils.parseUnits("1000", 6)
    );
    await pool
      .connect(alice)
      .withdraw(usdt.address, ethersJS.ethers.utils.parseUnits("1000", 6));
    userAssetInfo = await pool.userAssetInfo(alice.address, usdt.address);
    expect(userAssetInfo.amount).to.be.eq("0");
  });

  it("Deposit - Deposit - Borrow - Repay - Repay - WithDraw USD", async () => {
    let poolInfo = await pool.poolInfo(usdt.address);

    // ------------- ALICE DEPOSIT 1000 USD------------------------
    await pool
      .connect(alice)
      .deposit(usdt.address, ethersJS.ethers.utils.parseUnits("1000", 6));
    poolInfo = await pool.poolInfo(usdt.address);
    let aliceAsset = await pool.userAssetInfo(alice.address, usdt.address);
    expect(aliceAsset.amount).to.be.eq(
      ethersJS.ethers.utils.parseUnits("1000", 6)
    );
    expect(poolInfo.totalBorrows).to.be.eq(
      ethersJS.ethers.utils.parseUnits("0", 6)
    );
    expect(poolInfo.supplyIndex).to.be.eq(
      ethersJS.ethers.utils.parseUnits("1", 6)
    ); // supplyIndex = (blockDelta*supplyRatePerblock) * supplyIndexOld + supplyIndexOld (When starting, supplyIndex = 1)
    expect(poolInfo.borrowIndex).to.be.eq(
      ethersJS.ethers.utils.parseUnits("1", 6)
    ); // borrowIndex = (blockDelta*borrowRatePerblock) * borrowIndexOld + borrowIndexOld (When starting, borrowIndex = 1)
    // supllyRate = 0 => supplyRatePerblock = 0
    // borrrowRate = 0.025 => borrowRatePerblock = 0.0.00000001189117199

    // ------------- BOB DEPOSIT 500 USD------------------------
    await pool
      .connect(bob)
      .deposit(usdt.address, ethersJS.ethers.utils.parseUnits("500", 6));
    poolInfo = await pool.poolInfo(usdt.address);
    let bobAsset = await pool.userAssetInfo(bob.address, usdt.address);
    expect(bobAsset.amount).to.be.eq(
      ethersJS.ethers.utils.parseUnits("500", 6)
    );
    expect(poolInfo.totalBorrows).to.be.eq(
      ethersJS.ethers.utils.parseUnits("0", 6)
    );
    expect(poolInfo.supplyIndex).to.be.eq(
      ethersJS.ethers.utils.parseUnits("1", 6)
    ); // supplyIndex = (blockDelta*supplyRatePerblock) * supplyIndexOld + supplyIndexOld (When starting, supplyIndex = 1)
    expect(poolInfo.borrowIndex).to.be.eq(
      ethersJS.ethers.utils.parseUnits("1", 6)
    ); // borrowIndex = (blockDelta*borrowRatePerblock) * borrowIndexOld + borrowIndexOld (When starting, borrowIndex = 1)
    // supllyRate = 0 => supplyRatePerblock = 0
    // borrrowRate = 0.025 => borrowRatePerblock = 0.0.00000001189117199

    // increase 500 block
    for (let i = 1; i < time500; i++) {
      await hre.network.provider.send("evm_mine", []);
    }
    //check pending
    expect(await pool.pendingToken(usdt.address, alice.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0")
    );
    expect(await pool.totalBorrowBalance(usdt.address, deedA.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0")
    );

    // ------------- BORROW 500 USD------------------------
    await pool
      .connect(deedA)
      .borrow(usdt.address, ethersJS.ethers.utils.parseUnits("500", 6));
    let deedInfoA = await pool.deedInfo(deedA.address);
    poolInfo = await pool.poolInfo(usdt.address);
    expect(deedInfoA.borrow).to.be.eq(
      ethersJS.ethers.utils.parseUnits("500", 6)
    );

    expect(deedInfoA.totalBorrow).to.be.eq(
      ethersJS.ethers.utils.parseUnits("500", 6)
    );

    expect(poolInfo.totalBorrows).to.be.eq(
      ethersJS.ethers.utils.parseUnits("500", 6)
    );

    expect(poolInfo.supplyIndex).to.be.eq(
      ethersJS.ethers.utils.parseUnits("1", 6)
    ); // supplyIndex = (blockDelta*supplyRatePerblock) * supplyIndexOld + supplyIndexOld (When starting, supplyIndex = 1)

    expect(poolInfo.borrowIndex).to.be.eq(
      ethersJS.ethers.utils.parseUnits("1", 6)
    ); // borrowIndex = (blockDelta*borrowRatePerblock) * borrowIndexOld + borrowIndexOld (When starting, borrowIndex = 1)

    // supllyRate = 0.03055555556 => supplyRatePerblock = 0.00000001453365466
    // borrrowRate = 0.09166666667 => borrowRatePerblock = 0.00000004360096398

    // increase 2000 block
    for (let i = 1; i < time2000; i++) {
      await hre.network.provider.send("evm_mine", []);
    }

    //check pending
    expect(await pool.pendingToken(usdt.address, alice.address)).to.be.eq(
      ethersJS.ethers.utils.parseUnits("0.014500", 6)
    );
    expect(await pool.pendingToken(usdt.address, bob.address)).to.be.eq(
      ethersJS.ethers.utils.parseUnits("0.007250", 6)
    );
    expect(await pool.totalBorrowBalance(usdt.address, deedA.address)).to.be.eq(
      ethersJS.ethers.utils.parseUnits("500.0435", 6)
    );

    //approve
    expect(await usdt.balanceOf(deedA.address)).to.be.eq(
      ethersJS.ethers.utils.parseUnits("500", 6)
    );
    await usdt
      .connect(deedA)
      .approve(pool.address, "1000000000000000000000000000000");

    // ------------- REPAY 300 USD------------------------
    await pool
      .connect(deedA)
      .repay(usdt.address, ethersJS.ethers.utils.parseUnits("300", 6));
    deedInfoA = await pool.deedInfo(deedA.address);
    poolInfo = await pool.poolInfo(usdt.address);
    expect(deedInfoA.borrow).to.be.eq(
      ethersJS.ethers.utils.parseUnits("200", 6)
    ); // 500-300
    expect(poolInfo.supplyIndex).to.be.eq(
      ethersJS.ethers.utils.parseUnits("1.000029", 6)
    ); // supplyIndex = (blockDelta*supplyRatePerblock) * supplyIndexOld + supplyIndexOld (When starting, supplyIndex = 1)
    expect(poolInfo.borrowIndex).to.be.eq(
      ethersJS.ethers.utils.parseUnits("1.000087", 6)
    ); // borrowIndex = (blockDelta*borrowRatePerblock) * borrowIndexOld + borrowIndexOld (When starting, borrowIndex = 1)
    expect(deedInfoA.totalBorrow).to.be.eq(
      ethersJS.ethers.utils.parseUnits("200.043500", 6)
    ); // (500-300) + 500* borrowIndex
    expect(poolInfo.totalBorrows).to.be.eq(
      ethersJS.ethers.utils.parseUnits("200.043622", 6)
    ); // (500-300) + 0.01486396499(interest)

    // supllyRate = 0.01300156076 => supplyRatePerblock = 0.000000006184151808
    // borrrowRate = 0.06500297279 => borrowRatePerblock = 0.00000003091846118

    // increase 1000 block
    for (let i = 1; i < time1000; i++) {
      await hre.network.provider.send("evm_mine", []);
    }

    //check pending
    expect(await pool.pendingToken(usdt.address, alice.address)).to.be.eq(
      ethersJS.ethers.utils.parseUnits("0.016", 6)
    );
    expect(await pool.pendingToken(usdt.address, bob.address)).to.be.eq(
      ethersJS.ethers.utils.parseUnits("0.008", 6)
    );
    expect(await pool.totalBorrowBalance(usdt.address, deedA.address)).to.be.eq(
      ethersJS.ethers.utils.parseUnits("200.048300", 6)
    );

    // ------------- REPAY 200 USD------------------------
    await pool
      .connect(deedA)
      .repay(usdt.address, ethersJS.ethers.utils.parseUnits("200", 6));
    deedInfoA = await pool.deedInfo(deedA.address);
    poolInfo = await pool.poolInfo(usdt.address);
    expect(deedInfoA.borrow).to.be.eq(ethersJS.ethers.utils.parseUnits("0", 6)); // 200-200
    expect(poolInfo.supplyIndex).to.be.eq(
      ethersJS.ethers.utils.parseUnits("1.000032", 6)
    ); // supplyIndex = (blockDelta*supplyRatePerblock) * supplyIndexOld + supplyIndexOld (When starting, supplyIndex = 1)
    expect(poolInfo.borrowIndex).to.be.eq(
      ethersJS.ethers.utils.parseUnits("1.000111", 6)
    ); // borrowIndex = (blockDelta*borrowRatePerblock) * borrowIndexOld + borrowIndexOld (When starting, borrowIndex = 1)
    expect(deedInfoA.totalBorrow).to.be.eq(
      ethersJS.ethers.utils.parseUnits("0.048300", 6)
    ); // (500-300) + 500* borrowIndex
    expect(poolInfo.totalBorrows).to.be.eq(
      ethersJS.ethers.utils.parseUnits("0.048538", 6)
    ); // (500-300) + 0.01486396499(interest)

    // supllyRate = 0.01300156076 => supplyRatePerblock = 0.000000006184151808
    // borrrowRate = 0.06500297279 => borrowRatePerblock = 0.00000003091846118

    //check pending
    expect(await pool.pendingToken(usdt.address, alice.address)).to.be.eq(
      ethersJS.ethers.utils.parseUnits("0.016", 6)
    );
    expect(await pool.pendingToken(usdt.address, bob.address)).to.be.eq(
      ethersJS.ethers.utils.parseUnits("0.008", 6) // 0.004917418752/3*1
    );
    expect(await pool.totalBorrowBalance(usdt.address, deedA.address)).to.be.eq(
      ethersJS.ethers.utils.parseUnits("0.048300", 6)
    );

    // -------------ALICE WITHDRAW 500 USD ------------------------
    await pool
      .connect(alice)
      .withdraw(usdt.address, ethersJS.ethers.utils.parseUnits("500", 6));
    deedInfoA = await pool.deedInfo(deedA.address);
    poolInfo = await pool.poolInfo(usdt.address);
    userAssetInfo = await pool.userAssetInfo(alice.address, usdt.address);

    //check pending
    expect(await pool.pendingToken(usdt.address, alice.address)).to.be.eq(
      ethersJS.ethers.utils.parseUnits("0", 6)
    );
    expect(await pool.pendingToken(usdt.address, bob.address)).to.be.eq(
      ethersJS.ethers.utils.parseUnits("0.008", 6)
    );
    expect(await pool.totalBorrowBalance(usdt.address, deedA.address)).to.be.eq(
      ethersJS.ethers.utils.parseUnits("0.048300", 6)
    );

    expect(userAssetInfo.amount).to.be.eq(
      ethersJS.ethers.utils.parseUnits("500", 6)
    ); // 1000 - 500
    expect(await pool.pendingDToken(usdt.address, alice.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0")
    );

    expect(await dToken.balanceOf(alice.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.128")
    );
    //claimDtoken alice
    await pool.connect(alice).claimDToken(usdt.address);

    expect(await pool.pendingDToken(usdt.address, alice.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0")
    );

    expect(await pool.pendingDToken(usdt.address, bob.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.000000000000064")
    );
    //claimDtoken bob
    await pool.connect(bob).claimDToken(usdt.address);
    expect(await dToken.balanceOf(bob.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0.064")
    );
    expect(await pool.pendingToken(usdt.address, bob.address)).to.be.eq(
      ethersJS.ethers.utils.parseUnits("0", 6)
    );
    // increase 2000 block
    for (let i = 1; i < time2000; i++) {
      await hre.network.provider.send("evm_mine", []);
    }
    expect(await pool.pendingDToken(usdt.address, alice.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0")
    );
    expect(await pool.pendingDToken(usdt.address, bob.address)).to.be.eq(
      ethersJS.ethers.utils.parseEther("0")
    );
    expect(await pool.pendingToken(usdt.address, bob.address)).to.be.eq(
      ethersJS.ethers.utils.parseUnits("0", 6)
    );
  });
});
