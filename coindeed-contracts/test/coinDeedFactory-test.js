const { BigNumber } = require("ethers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  expectEvent,
  expectRevert,
  time,
} = require("@openzeppelin/test-helpers");
const { UnicodeNormalizationForm } = require("@ethersproject/strings");
const {
  createDeed,
  createWholesale,
  addPool,
  deployCoinDeedFactory,
  seedLiquidity,
  seedLiquidityETH,
} = require("../helpers/helpers");

let lendingPool;
let coinDeedUtils;
let coinDeedAddressesProviderUtils;
let CoinDeed;
let CoinDeedFactory;
describe("CoinDeedFactory", function () {
  let coinDeedDeployer;
  let coinDeedAddressesProvider;
  let deedCoinToken;
  let tokenA;
  let tokenB;
  let tokenC;
  let wholesaleFactory;
  let uniswapV2Router01;
  let coinDeedFactory;
  let mockFeedRegistry;
  let admin;
  let signer1;
  let signer2;
  let treasury;
  let coinDeedDao;

  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const FEED_REGISTRY_ADDRESS = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
  const DEFAULT_PLATFORM_FEE = 200;
  const DEFAULT_STAKING_MULTIPLIER = 10000;
  const DEFAULT_DEED_SIZE = ethers.utils.parseEther("50");
  const DEFAULT_LEVERAGE = 10;
  const DEFAULT_MANAGEMENT_FEE = 250;
  const DEFAULT_MINIMUM_BUY = 10000;

  before(async function () {
    [admin, signer1, signer2, signer3, owner, treasury] =
      await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const CoinDeedUtils = await ethers.getContractFactory("CoinDeedUtils");
    coinDeedUtils = await CoinDeedUtils.deploy();
    const CoinDeedAddressesProviderUtils = await ethers.getContractFactory(
      "CoinDeedAddressesProviderUtils"
    );
    coinDeedAddressesProviderUtils =
      await CoinDeedAddressesProviderUtils.deploy();
    const CoinDeedAddressesProvider = await ethers.getContractFactory(
      "CoinDeedAddressesProvider"
    );
    coinDeedAddressesProvider = await CoinDeedAddressesProvider.deploy();
    const CoinDeedDao = await ethers.getContractFactory("CoinDeedDao");
    coinDeedDao = await CoinDeedDao.deploy();

    const CoinDeedDeployer = await ethers.getContractFactory(
      "CoinDeedDeployer",
      {
        libraries: {
          CoinDeedUtils: coinDeedUtils.address,
          CoinDeedAddressesProviderUtils:
            coinDeedAddressesProviderUtils.address,
        },
      }
    );
    coinDeedDeployer = await CoinDeedDeployer.deploy();

    const WholesaleFactory = await ethers.getContractFactory(
      "WholesaleFactory"
    );
    wholesaleFactory = await WholesaleFactory.deploy();

    const MockFeedRegistry = await ethers.getContractFactory(
      "MockFeedRegistry"
    );
    mockFeedRegistry = await MockFeedRegistry.deploy();

    const LendingPool = await ethers.getContractFactory("LendingPool");
    lendingPool = await LendingPool.deploy();

    deedCoinToken = await Token.deploy("DeedCoin", "DC");

    await coinDeedAddressesProvider.setCoinDeedDeployer(
      coinDeedDeployer.address
    );
    await coinDeedAddressesProvider.setWholesaleFactory(
      wholesaleFactory.address
    );
    await coinDeedAddressesProvider.setFeedRegistry(mockFeedRegistry.address);
    await coinDeedAddressesProvider.setLendingPool(lendingPool.address);
    await coinDeedAddressesProvider.setDeedToken(deedCoinToken.address);
    await coinDeedAddressesProvider.setTreasury(treasury.address);

    const minterRole = await deedCoinToken.MINTER();
    await deedCoinToken.grantRole(minterRole, lendingPool.address);
    await Promise.all([
      coinDeedDeployer.deployed(),
      wholesaleFactory.deployed(),
      lendingPool.initialize(coinDeedDao.address, 200000, 20000),
    ]);
    console.log("lendingPool initialized.");
    await lendingPool.deposit(zeroAddress, ethers.utils.parseEther("1000"), {
      value: ethers.utils.parseEther("1000"),
    });
    console.log("lendingPool deposit.");
    uniswapV2Router01 = await ethers.getContractAt(
      "IUniswapV2Router01",
      "0xf164fC0Ec4E93095b804a4795bBe1e041497b92a",
      admin
    );

    const poolPromisses = [];

    deedCoinToken.mint(admin.address, ethers.utils.parseEther("1000000"));
    poolPromisses.push(addPool(admin, lendingPool, deedCoinToken, 100000000));

    tokenA = await Token.deploy("tokenA", "TA");
    await tokenA.mint(admin.address, ethers.utils.parseEther("1000000"));
    poolPromisses.push(addPool(admin, lendingPool, tokenA, 200000000));

    tokenB = await Token.deploy("tokenB", "TB");
    tokenB.mint(admin.address, ethers.utils.parseEther("1000000"));
    poolPromisses.push(addPool(admin, lendingPool, tokenB, 300000000));

    tokenC = await Token.deploy("tokenC", "TC");
    tokenC.mint(admin.address, ethers.utils.parseEther("1000000"));
    poolPromisses.push(addPool(admin, lendingPool, tokenC, 300000000));

    await Promise.all(poolPromisses);
    console.log("Tokens are created.");

    await seedLiquidityETH(
      admin,
      deedCoinToken,
      (to = admin),
      (router = uniswapV2Router01)
    );
    await seedLiquidityETH(
      admin,
      tokenA,
      (to = admin),
      (router = uniswapV2Router01)
    );
    await seedLiquidity(
      admin,
      tokenB,
      tokenA,
      (to = admin),
      (router = uniswapV2Router01)
    );
    await seedLiquidity(
      admin,
      deedCoinToken,
      tokenA,
      (to = admin),
      (router = uniswapV2Router01)
    );
    await seedLiquidity(
      admin,
      deedCoinToken,
      tokenB,
      (to = admin),
      (router = uniswapV2Router01)
    );

    console.log("Liquidity added.");
  });

  beforeEach(async function () {
    coinDeedFactory = await deployCoinDeedFactory(
      admin,
      coinDeedAddressesProvider.address
    );
    await coinDeedAddressesProvider.setCoinDeedFactory(coinDeedFactory.address);
  });

  describe("Deploy", function () {
    it("Should be able to deploy", async function () {
      expect(await coinDeedFactory.coinDeedAdmin()).to.equal(admin.address);
    });
  });

  describe("Change Config", function () {
    it("Should be able to change maxLeverage", async function () {
      await coinDeedFactory.setMaxLeverage(5);
      expect(await coinDeedFactory.maxLeverage()).to.equal(5);
    });

    it("Only admin should be able to change maxLeverage", async function () {
      await expectRevert(
        coinDeedFactory.connect(signer1).setMaxLeverage(5),
        `AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000`
      );
    });

    it("Should be able to add to permissioned token list", async function () {
      await coinDeedFactory.permitToken(tokenA.address);
      expect(await coinDeedFactory.tokenPermissions(tokenA.address)).to.equal(
        true
      );
    });

    it("Only admin should be able to add to permitted tokens", async function () {
      await expectRevert(
        coinDeedFactory.connect(signer1).permitToken(tokenA.address),
        `AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000`
      );
    });

    it("Only admin should be able to remove from permitted tokens", async function () {
      await coinDeedFactory.permitToken(tokenA.address);
      await expectRevert(
        coinDeedFactory.connect(signer1).unpermitToken(tokenA.address),
        `AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000`
      );
      expect(await coinDeedFactory.tokenPermissions(tokenA.address)).to.equal(
        true
      );
    });

    it("Unpermitting tokens should remove permissions", async function () {
      await coinDeedFactory.permitToken(tokenA.address);
      expect(await coinDeedFactory.tokenPermissions(tokenA.address)).to.equal(
        true
      );
      await coinDeedFactory.unpermitToken(tokenA.address);
      expect(await coinDeedFactory.tokenPermissions(tokenA.address)).to.equal(
        false
      );
    });

    it("admin should be able to change DEFAULT_PLATFORM_FEE", async function () {
      await coinDeedFactory.setPlatformFee(300);
      expect(await coinDeedFactory.platformFee()).to.equal(300);
    });

    it("Only admin should be able to change platform fee", async function () {
      await expectRevert(
        coinDeedFactory.connect(signer1).setPlatformFee(300),
        `AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000`
      );
    });

    it("admin should be able to change staking multiplier", async function () {
      await coinDeedFactory.setStakingMultiplier(5000);
      expect(await coinDeedFactory.stakingMultiplier()).to.equal(5000);
    });

    it("Only admin should be able to change staking multiplier", async function () {
      await expectRevert(
        coinDeedFactory.connect(signer1).setStakingMultiplier(5000),
        `AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000`
      );
    });
  });

  describe("CoinDeed", function () {
    let eventArgs;
    let coinDeed;

    beforeEach(async function () {
      coinDeedFactory = await deployCoinDeedFactory(
        admin,
        coinDeedAddressesProvider.address
      );
      await coinDeedAddressesProvider.setCoinDeedFactory(
        coinDeedFactory.address
      );
      await coinDeedFactory.permitToken(tokenA.address);
      await coinDeedFactory.permitToken(tokenB.address);
      eventArgs = await createDeed(
        admin,
        coinDeedFactory,
        tokenA,
        tokenB,
        deedCoinToken
      );

      CoinDeed = await ethers.getContractFactory("CoinDeed", {
        libraries: {
          CoinDeedUtils: coinDeedUtils.address,
          CoinDeedAddressesProviderUtils:
            coinDeedAddressesProviderUtils.address,
        },
      });
      coinDeed = await CoinDeed.attach(eventArgs.address);
    });

    describe("Create Deed", function () {
      it("Should be able to create a deed", async function () {
        expect(eventArgs.manager).to.equal(admin.address);
      });

      it("Should not be able to create a deed with an unpermitted token in token A", async function () {
        await expectRevert(
          createDeed(admin, coinDeedFactory, tokenC, tokenB, deedCoinToken),
          "Not on permissioned token list"
        );
      });

      it("Should not be able to create a deed with an unpermitted token in token B", async function () {
        await expectRevert(
          createDeed(admin, coinDeedFactory, tokenA, tokenC, deedCoinToken),
          "Not on permissioned token list"
        );
      });

      it("Should be able to create a deed with a wholesale reserve", async function () {
        const offerredAmount = ethers.utils.parseEther("10");
        await tokenB.mint(admin.address, offerredAmount);
        await tokenB
          .connect(admin)
          .approve(wholesaleFactory.address, offerredAmount);

        const result = await createWholesale(
          admin,
          wholesaleFactory,
          tokenB,
          tokenA,
          offerredAmount,
          ethers.utils.parseEther("10"),
          1000,
          1000000,
          zeroAddress
        );
        const event = result.events.find((it) => {
          return it.event === "WholesaleCreated";
        });
        const wholesaleId = event.args.saleId.toNumber();
        console.log(wholesaleId);
        eventArgs = await createDeed(
          admin,
          coinDeedFactory,
          tokenA,
          tokenB,
          deedCoinToken,
          true,
          wholesaleId,
        );
        expect(eventArgs.manager).to.equal(admin.address);

        const wholesale = await wholesaleFactory.getWholesale(wholesaleId);
        expect(wholesale.reservedTo).to.equal(eventArgs.address);
      });
    });

    describe("Stake Deed", function () {
      it("Manager should be able to add new stake.", async function () {
        const firstStake = BigNumber.from(
          await coinDeed.stakes(signer1.address)
        );

        const stakeAmount = ethers.utils.parseEther("1");
        await deedCoinToken.mint(signer1.address, stakeAmount);
        await deedCoinToken
          .connect(signer1)
          .approve(eventArgs.address, stakeAmount);

        await coinDeed.connect(signer1).stake(stakeAmount);

        const stakeOnContract = await coinDeed.stakes(signer1.address);

        expect(stakeOnContract.toString()).to.equal(
          firstStake.add(stakeAmount).toString()
        );
      });

      it("Broker should be able to add stake.", async function () {
        const stakeAmount = ethers.utils.parseEther("1");
        await deedCoinToken.mint(signer2.address, stakeAmount);
        await deedCoinToken
          .connect(signer2)
          .approve(eventArgs.address, stakeAmount);

        await coinDeed.connect(signer2).stake(stakeAmount);

        const stakeOnContract = await coinDeed.stakes(signer2.address);

        expect(stakeOnContract.toString()).to.equal(stakeAmount.toString());
      });

      it("Broker should not be able to add stake if brokers are not allowed.", async function () {
        const deedSize = (await coinDeed.deedParameters())["deedSize"];
        const totalStake = await coinDeed.totalStake();
        const stakeAmount = BigNumber.from(deedSize).sub(totalStake);

        const brokerConfig = {
          allowed: false
        };
        coinDeed.editBrokerConfig(brokerConfig);

        await deedCoinToken.mint(signer2.address, stakeAmount);
        await deedCoinToken
          .connect(signer1)
          .approve(eventArgs.address, stakeAmount);

        await expectRevert(
          coinDeed.connect(signer1).stake(stakeAmount),
          "NO_BROKERS"
        );
      });

      it("Broker can add a stake to make deed READY.", async function () {
        const deedSize = (await coinDeed.deedParameters())["deedSize"];

        const stakeAmount = BigNumber.from(deedSize);
        await coinDeedFactory.setStakingMultiplier(10000);

        await deedCoinToken.mint(signer1.address, stakeAmount);
        await deedCoinToken
          .connect(signer1)
          .approve(eventArgs.address, stakeAmount);
        await coinDeed.connect(signer1).stake(stakeAmount);
        await coinDeed.ready();
        const state = await coinDeed.state();
        expect(state).to.equal(1);
      });

      it("Manager can add a second stake to make deed READY.", async function () {
        const deedSize = (await coinDeed.deedParameters())["deedSize"];

        const stakeAmount = BigNumber.from(deedSize).sub(BigNumber.from("10000"));

        await deedCoinToken.mint(signer1.address, stakeAmount);
        await deedCoinToken
          .connect(signer1)
          .approve(eventArgs.address, stakeAmount);
        await coinDeed.connect(signer1).stake(stakeAmount);
        await coinDeed.ready();
        const state = await coinDeed.state();
        expect(state).to.equal(1);
      });

      it("Manager can add stake to make deed READY. (Half staking requirement)", async function () {
        const deedSize = (await coinDeed.deedParameters())["deedSize"];
        await coinDeedFactory.setStakingMultiplier(5000);

        const stakeAmount = BigNumber.from(deedSize).div(2);

        await deedCoinToken.mint(signer1.address, stakeAmount);
        await deedCoinToken
          .connect(signer1)
          .approve(eventArgs.address, stakeAmount);
        await coinDeed.connect(signer1).stake(stakeAmount);
        await coinDeed.ready();
        const state = await coinDeed.state();
        expect(state).to.equal(1);
      });

      it("Manager adding deedsize amount of stake will not make deed ready. (Double staking requirement)", async function () {
        const deedSize = (await coinDeed.deedParameters())["deedSize"];
        await coinDeedFactory.setStakingMultiplier(20000);

        const stakeAmount = BigNumber.from(deedSize);

        await deedCoinToken.mint(signer1.address, stakeAmount);
        await deedCoinToken
          .connect(signer1)
          .approve(eventArgs.address, stakeAmount);
        await coinDeed.connect(signer1).stake(stakeAmount);
        await coinDeed.ready();
        const state = await coinDeed.state();
        expect(state).to.equal(0);
        await coinDeedFactory.setStakingMultiplier(10000);
      });
    });

    describe("Edit Deed", function () {
      it("Manager should be able to edit BrokerConfig .", async function () {
        const eventArgs = await createDeed(
          admin,
          coinDeedFactory,
          tokenA,
          tokenB,
          deedCoinToken,
          false
        );
        const coinDeed = await CoinDeed.attach(eventArgs.address);

        const brokerConfig = {
          allowed: true
        };
        await coinDeed.connect(admin).editBrokerConfig(brokerConfig);
        const brokerConfigOnChain = await coinDeed.brokerConfig();
        expect(brokerConfigOnChain.allowed).to.equal(brokerConfig.allowed);
      });

      it("Manager should be able to edit RiskMitigation .", async function () {
        const riskMitigation = {
          trigger: 9,
          secondTrigger: 12,
          leverage: 4,
        };
        await coinDeed.connect(admin).editRiskMitigation(riskMitigation);
        const riskMitigationOnChain = await coinDeed.riskMitigation();

        expect(riskMitigationOnChain.trigger).to.equal(riskMitigation.trigger);
        expect(riskMitigationOnChain.leverage).to.equal(
          riskMitigation.leverage
        );
      });

      it("Manager should be able to edit ExecutionTime .", async function () {
        const executionTime = await coinDeed.executionTime();
        executionTime.buyTimestamp = executionTime.buyTimestamp + 10000;
        executionTime.sellTimestamp = executionTime.sellTimestamp + 10000;

        await coinDeed.connect(admin).editExecutionTime(executionTime);

        const executionTimeOnChain = await coinDeed.executionTime();

        expect(executionTimeOnChain.buyTimestamp).to.equal(
          executionTime.buyTimestamp
        );
        expect(executionTimeOnChain.sellTimestamp).to.equal(
          executionTime.sellTimestamp
        );
      });

      it("Manager should not be able to edit ExecutionTime with a later buyTimestamp than sellTimestamp.", async function () {
        const executionTimeCurrent = await coinDeed.executionTime();
        const executionTime = {
          recruitingEndTimestamp: executionTimeCurrent.recruitingEndTimestamp
            .add(2000)
            .toString(),
          sellTimestamp: executionTimeCurrent.sellTimestamp.toString(),
          buyTimestamp: executionTimeCurrent.sellTimestamp.add(2000).toString(),
        };
        await expectRevert(
          coinDeed.connect(admin).editExecutionTime(executionTime),
          "BAD_SELL"
        );
      });

      it("Manager should be able to edit basic Info.", async function () {
        const deedSize = ethers.utils.parseEther("50");
        const leverage = 10;
        const managementFee = 250;
        const minimumBuy = 10000;

        await coinDeed
          .connect(admin)
          .editBasicInfo(deedSize, leverage, managementFee, minimumBuy);

        const deedSizeOnChain = (await coinDeed.deedParameters())["deedSize"];
        const leverageOnChain = (await coinDeed.deedParameters())["leverage"];
        const managementFeeOnChain = (await coinDeed.deedParameters())[
          "managementFee"
        ];
        const minimumBuyOnChain = (await coinDeed.deedParameters())[
          "minimumBuy"
        ];

        expect(deedSizeOnChain).to.equal(deedSize);
        expect(leverageOnChain).to.equal(leverage);
        expect(managementFeeOnChain).to.equal(managementFee);
        expect(minimumBuyOnChain).to.equal(minimumBuy);
      });

      it("Manager should not be able to edit basic Info with a leverage greater than allowed.", async function () {
        const deedSize = ethers.utils.parseEther("50");
        const leverage = 25;
        const managementFee = 250;
        const minimumBuy = 10000;

        await expectRevert(
          coinDeed
            .connect(admin)
            .editBasicInfo(deedSize, leverage, managementFee, minimumBuy),
          `BAD_LEVERAGE`
        );
      });

      it("Manager should not be able to edit basic Info with zero minimum buy.", async function () {
        const deedSize = ethers.utils.parseEther("50");
        const leverage = 5;
        const managementFee = 250;
        const minimumBuy = 0;

        await expectRevert(
          coinDeed
            .connect(admin)
            .editBasicInfo(deedSize, leverage, managementFee, minimumBuy),
          `BAD_MIN_BUY`
        );
      });

      it("Manager should not be able to edit basic Info with minimum buy > 10000.", async function () {
        const deedSize = ethers.utils.parseEther("50");
        const leverage = 5;
        const managementFee = 250;
        const minimumBuy = 10001;

        await expectRevert(
          coinDeed
            .connect(admin)
            .editBasicInfo(deedSize, leverage, managementFee, minimumBuy),
          `BAD_MIN_BUY`
        );
      });

      it("Manager should be able to edit all.", async function () {
        const deedSize = ethers.utils.parseEther("49");
        const leverage = 8;
        const managementFee = 400;
        const minimumBuy = 8000;

        const executionTime = await coinDeed.executionTime();
        executionTime.buyTimestamp = executionTime.buyTimestamp + 10000;
        executionTime.sellTimestamp = executionTime.sellTimestamp + 10000;

        const deedParameters = {
          deedSize: deedSize,
          leverage: leverage,
          managementFee: managementFee,
          minimumBuy: minimumBuy,
        };
        const riskMitigation = {
          trigger: 9,
          secondTrigger: 12,
          leverage: 4,
        };
        const brokerConfig = {
          allowed: true
        };

        await coinDeed
          .connect(admin)
          .edit(deedParameters, executionTime, riskMitigation, brokerConfig, BigNumber.from('0'));

        const deedSizeOnChain = (await coinDeed.deedParameters())["deedSize"];
        const leverageOnChain = (await coinDeed.deedParameters())["leverage"];
        const managementFeeOnChain = (await coinDeed.deedParameters())[
          "managementFee"
        ];
        const minimumBuyOnChain = (await coinDeed.deedParameters())[
          "minimumBuy"
        ];
        expect(deedSizeOnChain).to.equal(deedSize);
        expect(leverageOnChain).to.equal(leverage);
        expect(managementFeeOnChain).to.equal(managementFee);
        expect(minimumBuyOnChain).to.equal(minimumBuy);

        const executionTimeOnChain = await coinDeed.executionTime();

        expect(executionTimeOnChain.buyTimestamp).to.equal(
          executionTime.buyTimestamp
        );
        expect(executionTimeOnChain.sellTimestamp).to.equal(
          executionTime.sellTimestamp
        );
        const riskMitigationOnChain = await coinDeed.riskMitigation();
        expect(riskMitigationOnChain.trigger).to.equal(riskMitigation.trigger);
        expect(riskMitigationOnChain.leverage).to.equal(
          riskMitigation.leverage
        );
        const brokerConfigOnChain = await coinDeed.brokerConfig();
        expect(brokerConfigOnChain.allowed).to.equal(brokerConfig.allowed);
      });
    });

    describe("Cancel Deed", function () {
      it("Only Manager should be able to cancel a deed.", async function () {
        await expectRevert(
          coinDeed.connect(signer2).cancel(),
          `CANT_CANCEL`
        );
      });
      it("Manager should be able to cancel a deed.", async function () {
        const stake = await coinDeed.stakes(admin.address);
        await expect(coinDeed.connect(admin).cancel())
          .to.emit(deedCoinToken, "Transfer")
          .withArgs(coinDeed.address, admin.address, stake);
      });
      it("Anyone should be able to cancel a deed if recruting deadline is passed and deed is still not ready.", async function () {
        const fourDays = 4 * 24 * 60 * 60;
        await ethers.provider.send("evm_increaseTime", [fourDays]);
        coinDeed.connect(signer2).cancel();
      });
      it("Anyone should not be to cancel a deed if recruting deadline is passed and deed is ready.", async function () {
        const deedSize = (await coinDeed.deedParameters())["deedSize"];
        await deedCoinToken.mint(signer1.address, deedSize);
        await deedCoinToken
          .connect(signer1)
          .approve(eventArgs.address, deedSize);
        await coinDeed.connect(signer1).stake(deedSize);
        await coinDeed.ready();
        const state = await coinDeed.state();
        expect(state).to.equal(1);

        const fourDays = 4 * 24 * 60 * 60;
        await ethers.provider.send("evm_increaseTime", [fourDays]);

        await expectRevert(
          coinDeed.connect(signer2).cancel(),
          "Only manager or buy time"
        );
      });
      it("Anyone should be able to cancel a deed if buy deadline is passed and not enough buyers.", async function () {
        const deedSize = (await coinDeed.deedParameters())["deedSize"];

        await deedCoinToken.mint(signer1.address, deedSize);
        await deedCoinToken.approve(eventArgs.address, deedSize);
        await coinDeed.stake(deedSize);
        await coinDeed.ready();
        const state = await coinDeed.state();
        expect(state).to.equal(1);

        const eightDays = 8 * 24 * 60 * 60;
        await ethers.provider.send("evm_increaseTime", [eightDays]);
        coinDeed.connect(signer2).cancel();
      });
    });

    describe("Withdraw Stake", function () {
      it("Broker should be able to withdraw in setup if staking in reached the goal until recruiting date", async function () {
        const stakeAmount = BigNumber.from(
          (await coinDeed.deedParameters())["deedSize"]
        ).div(100);
        await deedCoinToken.mint(signer2.address, stakeAmount);
        await deedCoinToken
          .connect(signer2)
          .approve(eventArgs.address, stakeAmount);

        await coinDeed.connect(signer2).stake(stakeAmount);
        const fourDays = 4 * 24 * 60 * 60;
        await ethers.provider.send("evm_increaseTime", [fourDays]);

        await expect(coinDeed.connect(signer2).withdrawStake())
          .to.emit(deedCoinToken, "Transfer")
          .withArgs(coinDeed.address, signer2.address, stakeAmount);
      });

      it("Broker should not be able to withdraw in setup.", async function () {
        const stakeAmount = BigNumber.from(
          (await coinDeed.deedParameters())["deedSize"]
        ).div(100);
        await deedCoinToken.mint(signer2.address, stakeAmount);
        await deedCoinToken
          .connect(signer2)
          .approve(eventArgs.address, stakeAmount);

        await coinDeed.connect(signer2).stake(stakeAmount);

        await expectRevert(
          coinDeed.connect(signer2).withdrawStake(),
          "Recruiting did not end."
        );
      });

      it("Broker should be able to withdraw in cancel state", async function () {
        const stakeAmount = BigNumber.from("1000000000000000");
        await deedCoinToken.mint(signer1.address, stakeAmount);
        await deedCoinToken
          .connect(signer1)
          .approve(eventArgs.address, stakeAmount);

        await coinDeed.connect(signer1).stake(stakeAmount);

        await coinDeed.connect(admin).cancel();

        await expect(coinDeed.connect(signer1).withdrawStake())
          .to.emit(deedCoinToken, "Transfer")
          .withArgs(coinDeed.address, signer1.address, stakeAmount);
      });
    });

    describe("Buy in", function () {
      it("Buyer can not buy in before deed is READY.", async function () {
        const buyInAmount = 100000000;
        await tokenA.mint(signer2.address, buyInAmount);
        await tokenA.connect(signer2).approve(coinDeed.address, buyInAmount);

        await expectRevert(
          coinDeed.connect(signer2).buyIn(buyInAmount),
          "WRONG_STATE"
        );
      });

      it("Buyer can buy in with tokenA when deed is READY.", async function () {
        const deedSize = (await coinDeed.deedParameters())["deedSize"];
        const totalStake = await coinDeed.totalStake();

        const stakeAmount = BigNumber.from(deedSize).sub(totalStake);

        await deedCoinToken.mint(signer1.address, stakeAmount);
        await deedCoinToken
          .connect(signer1)
          .approve(coinDeed.address, stakeAmount);
        await coinDeed.connect(signer1).stake(stakeAmount);
        const state = await coinDeed.state();
        await coinDeed.ready();
        expect(state).to.equal(1);

        const buyInAmount = deedSize;
        await tokenA.mint(signer2.address, buyInAmount);
        await tokenA.connect(signer2).approve(coinDeed.address, buyInAmount);

        await coinDeed.connect(signer2).buyIn(buyInAmount);
        const buyInContract = await coinDeed.buyIns(signer2.address);
        expect(buyInContract.toNumber()).to.equal(buyInAmount);
      });

      it("Buyer can buy in with Eth when deed is READY.", async function () {
        const deedSize = (await coinDeed.deedParameters())["deedSize"];
        const totalStake = await coinDeed.totalStake();

        const stakeAmount = BigNumber.from(deedSize).sub(totalStake);

        await deedCoinToken.mint(signer1.address, stakeAmount);
        await deedCoinToken
          .connect(signer1)
          .approve(coinDeed.address, stakeAmount);
        await coinDeed.connect(signer1).stake(stakeAmount);
        await coinDeed.ready();
        const state = await coinDeed.state();
        expect(state).to.equal(1);

        const buyInAmount = deedSize;

        await coinDeed.connect(signer2).buyInEth({ value: buyInAmount });
        const buyInContrat = await coinDeed.buyIns(signer2.address);
        expect(buyInContrat.toNumber()).to.gt(0);
      });

      it("Should only allow to buy upto deed size", async function () {
        const deedSize = (await coinDeed.deedParameters())["deedSize"];
        const totalStake = await coinDeed.totalStake();

        const stakeAmount = BigNumber.from(deedSize).sub(totalStake);

        await deedCoinToken.mint(signer1.address, stakeAmount);
        await deedCoinToken
          .connect(signer1)
          .approve(coinDeed.address, stakeAmount);
        await coinDeed.connect(signer1).stake(stakeAmount);
        await coinDeed.ready();
        const state = await coinDeed.state();
        expect(state).to.equal(1);

        const buyInAmount = BigNumber.from(deedSize).mul(2);
        await tokenA.mint(signer2.address, buyInAmount);
        await tokenA.connect(signer2).approve(coinDeed.address, buyInAmount);

        await coinDeed.connect(signer2).buyIn(buyInAmount);
        const buyInContrat = await coinDeed.buyIns(signer2.address);
        // it should only take upto deedSize
        expect(buyInContrat.toString()).to.equal(deedSize.toString()); // deduct commission
      });
    });

    describe("Buy", function () {
      it("should not allow to buy off deed in setup mode", async function () {
        const deedSize = ethers.utils.parseEther("50");
        const leverage = 10;
        const managementFee = 250;
        const minimumBuy = 10000;

        const executionTime = await coinDeed.executionTime();
        executionTime.buyTimestamp = executionTime.buyTimestamp + 10000;
        executionTime.sellTimestamp = executionTime.sellTimestamp + 10000;

        const deedParameters = {
          deedSize: deedSize,
          leverage: leverage,
          managementFee: managementFee,
          minimumBuy: minimumBuy,
        };
        const riskMitigation = {
          trigger: 9,
          secondTrigger: 12,
          leverage: 4,
        };
        const brokerConfig = {
          allowed: true
        };

        await coinDeed
          .connect(admin)
          .edit(deedParameters, executionTime, riskMitigation, brokerConfig);

        await expectRevert(coinDeed.buy(), `WRONG_STATE`);
      });
      /*
                  it("should allow to buy with wholesale once deed is ready", async function () {

                    const offerredAmount = ethers.utils.parseEther("10");
                    await tokenB.mint(admin.address, offerredAmount);
                    await tokenB
                      .connect(admin)
                      .approve(wholesaleFactory.address, offerredAmount);

                    const result = await createWholesale(
                      wholesaleFactory,
                      coinDeedFactory,
                      lendingPool,
                      admin,
                      tokenA,
                      tokenB,
                      true,
                      wholesaleId
                    );
                    expect(eventArgs.manager).to.equal(admin.address);
                    const CoinDeed = await ethers.getContractFactory("CoinDeed");
                    const coinDeed = await CoinDeed.attach(eventArgs.address);
                    const sevenDays = 7 * 24 * 60 * 60;
                    await ethers.provider.send("evm_increaseTime", [sevenDays]);

                    const deedSize = (await coinDeed.deedParameters())['deedSize'] ;
                    const totalStake = await coinDeed.totalStake();

                    const stakeAmount = BigNumber.from(deedSize).sub(totalStake);

                    await deedCoinToken.mint(admin.address, stakeAmount);
                    await deedCoinToken.approve(coinDeed.address, stakeAmount);
                    await coinDeed.stake(stakeAmount);
                    const state = await coinDeed.state();
                    expect(state).to.equal(1);

                    const buyInAmount = deedSize;
                    await tokenA.mint(signer1.address, buyInAmount);
                    await tokenA.connect(signer1).approve(coinDeed.address, buyInAmount);
                    await coinDeed.connect(signer1).buyIn(buyInAmount);

                    await coinDeed.buy();
                    const newState = await coinDeed.state();
                    expect(newState).to.equal(2);

                    const lendingPoolBalance = await tokenB.balanceOf(lendingPool.address);
                    expect(Number(lendingPoolBalance)).to.greaterThan(0);
                  });
            */
      it("should allow a buy with half deed size and half minimum buy", async function () {
        const offerredAmount = ethers.utils.parseEther("10");
        await tokenB.mint(admin.address, offerredAmount);
        await tokenB.approve(wholesaleFactory.address, offerredAmount);

        const result = await createWholesale(
          admin,
          wholesaleFactory,
          tokenB.address,
          tokenA.address,
          offerredAmount,
          ethers.utils.parseEther("10"),
          1000,
          1000000,
          zeroAddress
        );
        const event = result.events.find((it) => {
          return it.event === "WholesaleCreated";
        });
        const wholesaleId = event.args.saleId.toNumber();
        const eventArgs = await createDeed(
          admin,
          coinDeedFactory,
          tokenA,
          tokenB,
          deedCoinToken,
          true,
          wholesaleId
        );
        expect(eventArgs.manager).to.equal(admin.address);
        const coinDeed = await CoinDeed.attach(eventArgs.address);

        const sevenDays = 7 * 24 * 60 * 60;
        await ethers.provider.send("evm_increaseTime", [sevenDays]);

        const wholesale = await wholesaleFactory.getWholesale(wholesaleId);
        expect(wholesale.reservedTo).to.equal(eventArgs.address);

        const deedSize = (await coinDeed.deedParameters())["deedSize"];
        const leverage = 5;
        const managementFee = 250;
        const minimumBuy = 5000;

        await coinDeed.editBasicInfo(
          deedSize,
          leverage,
          managementFee,
          minimumBuy
        );
        const totalStake = await coinDeed.totalStake();

        const stakeAmount = BigNumber.from(deedSize).sub(totalStake);

        await deedCoinToken.mint(admin.address, stakeAmount);
        await deedCoinToken.approve(coinDeed.address, stakeAmount);
        await coinDeed.stake(stakeAmount);
        const state = await coinDeed.state();
        await coinDeed.ready();
        expect(state).to.equal(1);

        const buyInAmount = BigNumber.from(deedSize).div(2);
        await tokenA.mint(signer1.address, buyInAmount);
        await tokenA.connect(signer1).approve(coinDeed.address, buyInAmount);
        await coinDeed.connect(signer1).buyIn(buyInAmount);

        await coinDeed.buy();
        const newState = await coinDeed.state();
        expect(newState).to.equal(2);

        const lendingPoolBalance = await tokenB.balanceOf(lendingPool.address);
        expect(Number(lendingPoolBalance)).to.greaterThan(0);
      });

      it("should not allow a buy with without minimum buyin", async function () {
        const offerredAmount = ethers.utils.parseEther("10");
        await tokenB.mint(admin.address, offerredAmount);
        await tokenB
          .connect(admin)
          .approve(wholesaleFactory.address, offerredAmount);

        const result = await createWholesale(
          admin,
          wholesaleFactory,
          tokenB.address,
          tokenA.address,
          offerredAmount,
          ethers.utils.parseEther("10"),
          1000,
          1000000,
          zeroAddress
        );
        const event = result.events.find((it) => {
          return it.event === "WholesaleCreated";
        });
        const wholesaleId = event.args.saleId.toNumber();
        const eventArgs = await createDeed(
          admin,
          coinDeedFactory,
          tokenA,
          tokenB,
          deedCoinToken,
          true,
          wholesaleId
        );
        expect(eventArgs.manager).to.equal(admin.address);
        const coinDeed = await CoinDeed.attach(eventArgs.address);

        const sevenDays = 7 * 24 * 60 * 60;
        await ethers.provider.send("evm_increaseTime", [sevenDays]);

        const wholesale = await wholesaleFactory.getWholesale(wholesaleId);
        expect(wholesale.reservedTo).to.equal(eventArgs.address);

        const deedSize = (await coinDeed.deedParameters())["deedSize"];
        const leverage = 5;
        const managementFee = 250;
        const minimumBuy = 10000;

        await coinDeed.editBasicInfo(
          deedSize,
          leverage,
          managementFee,
          minimumBuy
        );
        const totalStake = await coinDeed.totalStake();

        const stakeAmount = BigNumber.from(deedSize).sub(totalStake);

        await deedCoinToken.mint(admin.address, stakeAmount);
        await deedCoinToken.approve(coinDeed.address, stakeAmount);
        await coinDeed.stake(stakeAmount);
        const state = await coinDeed.state();
        expect(state).to.equal(1);

        const buyInAmount = BigNumber.from(deedSize).div(2);
        await tokenA.mint(signer1.address, buyInAmount);
        await tokenA.connect(signer1).approve(coinDeed.address, buyInAmount);
        await coinDeed.connect(signer1).buyIn(buyInAmount);

        await expectRevert(coinDeed.buy(), "Minimum buy not met");
      });
    });

    describe("Sell", function () {
      it("should not allow to sell if deadline is not passed", async function () {
        const offerredAmount = ethers.utils.parseEther("10");
        await tokenB.mint(admin.address, offerredAmount);
        await tokenB
          .connect(admin)
          .approve(wholesaleFactory.address, offerredAmount);

        const result = await createWholesale(
          admin,
          wholesaleFactory,
          tokenB.address,
          tokenA.address,
          offerredAmount,
          ethers.utils.parseEther("10"),
          1000,
          1000000,
          zeroAddress
        );
        const event = result.events.find((it) => {
          return it.event === "WholesaleCreated";
        });
        const wholesaleId = event.args.saleId.toNumber();
        const eventArgs = await createDeed(
          admin,
          coinDeedFactory,
          tokenA,
          tokenB,
          deedCoinToken,
          true,
          wholesaleId
        );
        expect(eventArgs.manager).to.equal(admin.address);
        const coinDeed = await CoinDeed.attach(eventArgs.address);

        const sevenDays = 7 * 24 * 60 * 60;
        await ethers.provider.send("evm_increaseTime", [sevenDays]);

        const wholesale = await wholesaleFactory.getWholesale(wholesaleId);
        expect(wholesale.reservedTo).to.equal(eventArgs.address);

        const deedSize = (await coinDeed.deedParameters())["deedSize"];
        const totalStake = await coinDeed.totalStake();

        const stakeAmount = BigNumber.from(deedSize).sub(totalStake);

        await deedCoinToken.mint(admin.address, stakeAmount);
        await deedCoinToken.approve(coinDeed.address, stakeAmount);
        await coinDeed.stake(stakeAmount);
        const state = await coinDeed.state();
        expect(state).to.equal(1);

        const buyInAmount = 1000000;
        await tokenA.mint(signer1.address, buyInAmount);
        await tokenA.connect(signer1).approve(coinDeed.address, buyInAmount);
        await coinDeed.connect(signer1).buyIn(buyInAmount);

        const buyInAmount2 = 2000000;
        await tokenA.mint(signer2.address, buyInAmount2);
        await tokenA.connect(signer2).approve(coinDeed.address, buyInAmount2);
        await coinDeed.connect(signer2).buyIn(buyInAmount2);

        await coinDeed.buy();
        const newState = await coinDeed.state();
        expect(newState).to.equal(2);
        await ethers.provider.send("evm_increaseTime", [sevenDays * 2]);
        await expectRevert(
          coinDeed.sell(),
          "Sell action must be executed once sell time has passed"
        );
      });
      it("should allow to sell once deed is done", async function () {
        const offerredAmount = ethers.utils.parseEther("10");
        await tokenB.mint(admin.address, offerredAmount);
        await tokenB
          .connect(admin)
          .approve(wholesaleFactory.address, offerredAmount);

        const result = await createWholesale(
          admin,
          wholesaleFactory,
          tokenB.address,
          tokenA.address,
          offerredAmount,
          ethers.utils.parseEther("10"),
          1000,
          1000000,
          zeroAddress
        );
        const event = result.events.find((it) => {
          return it.event === "WholesaleCreated";
        });
        const wholesaleId = event.args.saleId.toNumber();
        const eventArgs = await createDeed(
          admin,
          coinDeedFactory,
          tokenA,
          tokenB,
          deedCoinToken,
          true,
          wholesaleId
        );
        expect(eventArgs.manager).to.equal(admin.address);
        const coinDeed = await CoinDeed.attach(eventArgs.address);

        const sevenDays = 7 * 24 * 60 * 60;
        await ethers.provider.send("evm_increaseTime", [sevenDays]);

        const wholesale = await wholesaleFactory.getWholesale(wholesaleId);
        expect(wholesale.reservedTo).to.equal(eventArgs.address);

        const deedSize = (await coinDeed.deedParameters())["deedSize"];
        const totalStake = await coinDeed.totalStake();

        const stakeAmount = BigNumber.from(deedSize).sub(totalStake);

        await deedCoinToken.mint(admin.address, stakeAmount);
        await deedCoinToken.approve(coinDeed.address, stakeAmount);
        await coinDeed.stake(stakeAmount);
        const state = await coinDeed.state();
        expect(state).to.equal(1);

        const buyInAmount = 1000000;
        await tokenA.mint(signer1.address, buyInAmount);
        await tokenA.connect(signer1).approve(coinDeed.address, buyInAmount);
        await coinDeed.connect(signer1).buyIn(buyInAmount);

        const buyInAmount2 = 2000000;
        await tokenA.mint(signer2.address, buyInAmount2);
        await tokenA.connect(signer2).approve(coinDeed.address, buyInAmount2);
        await coinDeed.connect(signer2).buyIn(buyInAmount2);

        await coinDeed.buy();
        let newState = await coinDeed.state();
        expect(newState).to.equal(2);

        await ethers.provider.send("evm_increaseTime", [sevenDays * 2]);
        await ethers.provider.send("evm_increaseTime", [1]);
        await coinDeed.sell();
        newState = await coinDeed.state();
        expect(newState).to.equal(3);
      });
    });

    describe("Exit Deed", function () {
      it("Buyer can exit in with tokenA when deed is OPEN.", async function () {
        const offerredAmount = ethers.utils.parseEther("10");
        await tokenB.mint(admin.address, offerredAmount);
        await tokenB
          .connect(admin)
          .approve(wholesaleFactory.address, offerredAmount);

        const result = await createWholesale(
          admin,
          wholesaleFactory,
          tokenB.address,
          tokenA.address,
          offerredAmount,
          ethers.utils.parseEther("10"),
          1000,
          1000000,
          zeroAddress
        );
        const event = result.events.find((it) => {
          return it.event === "WholesaleCreated";
        });
        const wholesaleId = event.args.saleId.toNumber();
        const eventArgs = await createDeed(
          admin,
          coinDeedFactory,
          tokenA,
          tokenB,
          deedCoinToken,
          true,
          wholesaleId
        );
        expect(eventArgs.manager).to.equal(admin.address);
        const coinDeed = await CoinDeed.attach(eventArgs.address);

        const sevenDays = 7 * 24 * 60 * 60;
        await ethers.provider.send("evm_increaseTime", [sevenDays]);

        const wholesale = await wholesaleFactory.getWholesale(wholesaleId);
        expect(wholesale.reservedTo).to.equal(eventArgs.address);

        const deedSize = (await coinDeed.deedParameters())["deedSize"];
        const totalStake = await coinDeed.totalStake();

        const stakeAmount = BigNumber.from(deedSize).sub(totalStake);

        await deedCoinToken.mint(admin.address, stakeAmount);
        await deedCoinToken.approve(coinDeed.address, stakeAmount);
        await coinDeed.stake(stakeAmount);
        let state = await coinDeed.state();
        expect(state).to.equal(1);

        const buyInAmount = BigNumber.from(deedSize);
        await tokenA.mint(admin.address, buyInAmount);
        await tokenA.connect(admin).approve(coinDeed.address, buyInAmount);
        await coinDeed.connect(admin).buyIn(buyInAmount);
        await coinDeed.buy();
        state = await coinDeed.state();
        expect(state).to.equal(2);

        await coinDeed.connect(admin).exitDeed();
      });
    });

    describe("Claim Balance", function () {
      it("should not allow buyer to claim balance before deed is sold", async function () {
        const offerredAmount = ethers.utils.parseEther("10");
        await tokenB.mint(admin.address, offerredAmount);
        await tokenB
          .connect(admin)
          .approve(wholesaleFactory.address, offerredAmount);

        const result = await createWholesale(
          admin,
          wholesaleFactory,
          tokenB.address,
          tokenA.address,
          offerredAmount,
          ethers.utils.parseEther("10"),
          1000,
          1000000,
          zeroAddress
        );
        const event = result.events.find((it) => {
          return it.event === "WholesaleCreated";
        });
        const wholesaleId = event.args.saleId.toNumber();
        const eventArgs = await createDeed(
          admin,
          coinDeedFactory,
          tokenA,
          tokenB,
          deedCoinToken,
          true,
          wholesaleId
        );
        expect(eventArgs.manager).to.equal(admin.address);
        const coinDeed = await CoinDeed.attach(eventArgs.address);

        const sevenDays = 7 * 24 * 60 * 60;
        await ethers.provider.send("evm_increaseTime", [sevenDays]);

        const wholesale = await wholesaleFactory.getWholesale(wholesaleId);
        expect(wholesale.reservedTo).to.equal(eventArgs.address);

        const deedSize = (await coinDeed.deedParameters())["deedSize"];
        const totalStake = await coinDeed.totalStake();

        const stakeAmount = BigNumber.from(deedSize).sub(totalStake);

        await deedCoinToken.mint(admin.address, stakeAmount);
        await deedCoinToken.approve(coinDeed.address, stakeAmount);
        await coinDeed.stake(stakeAmount);
        const state = await coinDeed.state();
        expect(state).to.equal(1);

        const buyInAmount = deedSize;
        await tokenA.mint(signer1.address, buyInAmount);
        await tokenA.connect(signer1).approve(coinDeed.address, buyInAmount);
        await coinDeed.connect(signer1).buyIn(buyInAmount);

        await coinDeed.buy();
        const newState = await coinDeed.state();
        expect(newState).to.equal(2);

        await expectRevert(
          coinDeed.connect(signer1).claimBalance(),
          `Deed is not in correct state.`
        );
      });
      it("should allow to buyer to claim balance once deed is sold", async function () {
        const offerredAmount = ethers.utils.parseEther("10");
        await tokenB.mint(admin.address, offerredAmount);
        await tokenB
          .connect(admin)
          .approve(wholesaleFactory.address, offerredAmount);

        const result = await createWholesale(
          admin,
          wholesaleFactory,
          tokenB.address,
          tokenA.address,
          offerredAmount,
          ethers.utils.parseEther("10"),
          1000,
          1000000,
          zeroAddress
        );
        const event = result.events.find((it) => {
          return it.event === "WholesaleCreated";
        });
        const wholesaleId = event.args.saleId.toNumber();
        const eventArgs = await createDeed(
          admin,
          coinDeedFactory,
          tokenA,
          tokenB,
          deedCoinToken,
          true,
          wholesaleId
        );
        expect(eventArgs.manager).to.equal(admin.address);
        const coinDeed = await CoinDeed.attach(eventArgs.address);

        const sevenDays = 7 * 24 * 60 * 60;
        await ethers.provider.send("evm_increaseTime", [sevenDays]);

        const wholesale = await wholesaleFactory.getWholesale(wholesaleId);
        expect(wholesale.reservedTo).to.equal(eventArgs.address);

        const deedSize = (await coinDeed.deedParameters())["deedSize"];
        const totalStake = await coinDeed.totalStake();

        const stakeAmount = BigNumber.from(deedSize).sub(totalStake);

        await deedCoinToken.mint(admin.address, stakeAmount);
        await deedCoinToken.approve(coinDeed.address, stakeAmount);
        await coinDeed.stake(stakeAmount);
        const state = await coinDeed.state();
        expect(state).to.equal(1);

        const buyInAmount = deedSize;
        await tokenA.mint(signer1.address, buyInAmount);
        await tokenA.connect(signer1).approve(coinDeed.address, buyInAmount);
        await coinDeed.connect(signer1).buyIn(buyInAmount);

        await coinDeed.buy();
        let newState = await coinDeed.state();
        expect(newState).to.equal(2);

        await ethers.provider.send("evm_increaseTime", [sevenDays * 2]);

        await coinDeed.sell();
        newState = await coinDeed.state();
        expect(newState).to.equal(3);

        const prevBalance = await tokenA.balanceOf(signer1.address);
        await coinDeed.connect(signer1).claimBalance();
        const newBalance = await tokenA.balanceOf(signer1.address);

        // buyer recieved back the return after commission and swaps
        expect(Number(newBalance)).to.greaterThan(Number(prevBalance));
        expect(Number(newBalance)).to.lessThan(Number(buyInAmount));
      });
      it("should allow buyer to claim balance if deed is cancelled", async function () {
        const offerredAmount = ethers.utils.parseEther("10");
        await tokenB.mint(admin.address, offerredAmount);
        await tokenB
          .connect(admin)
          .approve(wholesaleFactory.address, offerredAmount);

        const result = await createWholesale(
          admin,
          wholesaleFactory,
          tokenB.address,
          tokenA.address,
          offerredAmount,
          ethers.utils.parseEther("10"),
          1000,
          1000000,
          zeroAddress
        );
        const event = result.events.find((it) => {
          return it.event === "WholesaleCreated";
        });
        const wholesaleId = event.args.saleId.toNumber();
        const eventArgs = await createDeed(
          admin,
          coinDeedFactory,
          tokenA,
          tokenB,
          deedCoinToken,
          true,
          wholesaleId
        );
        expect(eventArgs.manager).to.equal(admin.address);
        const coinDeed = await CoinDeed.attach(eventArgs.address);

        const sevenDays = 7 * 24 * 60 * 60;
        await ethers.provider.send("evm_increaseTime", [sevenDays]);

        const wholesale = await wholesaleFactory.getWholesale(wholesaleId);
        expect(wholesale.reservedTo).to.equal(eventArgs.address);

        const deedSize = (await coinDeed.deedParameters())["deedSize"];
        const totalStake = await coinDeed.totalStake();

        const stakeAmount = BigNumber.from(deedSize).sub(totalStake);

        await deedCoinToken.mint(admin.address, stakeAmount);
        await deedCoinToken.approve(coinDeed.address, stakeAmount);
        await coinDeed.stake(stakeAmount);
        const state = await coinDeed.state();
        expect(state).to.equal(1);

        const buyInAmount = deedSize;
        await tokenA.mint(signer1.address, buyInAmount);
        await tokenA.connect(signer1).approve(coinDeed.address, buyInAmount);
        await coinDeed.connect(signer1).buyIn(buyInAmount);

        await coinDeed.cancel();
        const newState = await coinDeed.state();
        expect(newState).to.equal(4);

        const prevBalance = await tokenA.balanceOf(signer1.address);
        await coinDeed.connect(signer1).claimBalance();
        const newBalance = await tokenA.balanceOf(signer1.address);

        expect(prevBalance.add(buyInAmount)).to.equal(newBalance);
      });
    });

    describe("Claim Management Fee", function () {
      // todo: add tests
    });
  });
});
