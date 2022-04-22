const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { zeroAddress } = require("./constants");

exports.createDeed = async function (
    account,
    coinDeedFactory,
    tokenA,
    tokenB,
    deedCoinToken,
    allowedBrokers = true,
    wholesaleId = 0,
    deedSize = 100000,
    leverage = 10,
    managementFee = 250,
    minimumBuy = 10000
) {
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const blockTime = block.timestamp;

    await deedCoinToken.mint(account.address, deedSize);
    await deedCoinToken
        .connect(account)
        .approve(coinDeedFactory.address, deedSize);
    const day = 24 * 60 * 60;

    const stakingAmount = deedSize / 100;
    const executionTime = {
        recruitingEndTimestamp: blockTime + 3 * day,
        buyTimestamp: blockTime + 7 * day,
        sellTimestamp: blockTime + 14 * day,
    };


    const deedParameters = {
        deedSize: deedSize,
        leverage: leverage,
        managementFee: managementFee,
        minimumBuy: minimumBuy,
    };

    const riskMitigation = {
        trigger: 10,
        secondTrigger: 15,
        leverage: 5,
    };

    const brokerConfig = {
        allowed: allowedBrokers
    };

    const coinDeedReceipt = await coinDeedFactory.connect(account).createDeed(
        {
            tokenA: tokenA.address,
            tokenB: tokenB.address,
        },
        stakingAmount,
        wholesaleId,
        deedParameters,
        executionTime,
        riskMitigation,
        brokerConfig
    );

    const result = await coinDeedReceipt.wait();
    const deedCreatedEvent = result.events.find(
        (event) => event.event === "DeedCreated"
    );
    const eventArgs = {
        id: deedCreatedEvent.args.deedId,
        address: deedCreatedEvent.args.deedAddress,
        manager: deedCreatedEvent.args.manager,
    };
    return eventArgs;
}

exports.createWholesale = async function (
    account,
    wholesaleFactory,
    tokenOffered,
    tokenRequested,
    offeredAmount,
    requestedAmount,
    minSaleAmount,
    deadline,
    reservedTo = zeroAddress,
) {
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const blockTime = block.timestamp;
    await tokenOffered.connect(account).approve(wholesaleFactory.address, offeredAmount);

    const tx = await wholesaleFactory.connect(account).createWholesale(
        tokenOffered.address,
        tokenRequested.address,
        offeredAmount,
        requestedAmount,
        minSaleAmount,
        ethers.BigNumber.from(blockTime + deadline),
        reservedTo,
        zeroAddress,
        false
    );
    const result = await tx.wait();
    return result;
}

exports.addPool = async function (
    account,
    lendingPool,
    token) {
    await lendingPool.connect(account).createPool(token.address);
    await token.connect(account).approve(lendingPool.address, ethers.utils.parseEther("10000"));
    await lendingPool.connect(account).deposit(token.address, ethers.utils.parseEther("10000"));
}

exports.deployCoinDeedFactory = async function (
    account,
    coinDeedAddressesProvider,
    platformFee = 200,
    stakingMultiplier = 10000) {
    CoinDeedFactory = await ethers.getContractFactory(
        "CoinDeedFactory"
    );

    const factory = await CoinDeedFactory.connect(account).deploy(
        coinDeedAddressesProvider,
        platformFee,
        stakingMultiplier
    );
    await factory.deployed();
    return factory;
}

exports.seedLiquidity = async function (
    account,
    tokenA,
    tokenB,
    to,
    router,
    amountADesired = ethers.utils.parseEther("1000"),
    amountBDesired = ethers.utils.parseEther("1000"),
    amountAMin = ethers.utils.parseEther("1000"),
    amountBMin = ethers.utils.parseEther("1000")) {
    const blockNum = await ethers.provider.getBlockNumber();
    const block = (await ethers.provider.getBlock(blockNum));

    await tokenA.connect(account).approve(
        router.address,
        ethers.utils.parseEther("1000")
    );

    await tokenB.connect(account).approve(
        router.address,
        ethers.utils.parseEther("1000")
    );

    await router.connect(account).addLiquidity(
        tokenA.address,
        tokenB.address,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        to.address,
        block.timestamp + 60
    );
};

exports.seedLiquidityETH = async function (
    account,
    token,
    to,
    router,
    amountTokenDesired = ethers.utils.parseEther("1000"),
    amountTokenMin = ethers.utils.parseEther("1000"),
    amountETHMin = ethers.utils.parseEther("10")) {
    const blockNum = await ethers.provider.getBlockNumber();
    const block = (await ethers.provider.getBlock(blockNum));

    await token.connect(account).approve(
        router.address,
        amountTokenDesired
    );
    await router.connect(account).addLiquidityETH(
        token.address,
        amountTokenDesired,
        amountTokenMin,
        amountETHMin,
        to.address,
        block.timestamp + 60,
        { value: amountETHMin }
    );
};