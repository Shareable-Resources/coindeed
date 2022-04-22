const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  BN,
  expectEvent,
  expectRevert,
  time,
} = require("@openzeppelin/test-helpers");

describe("WholesaleFactory", function () {
  let addr0, addr1, addr2, addr3;
  let coinDeedAddressesProvider;
  let wholesaleFactory;
  let coinDeedFactory;
  let tokenA;
  let tokenB;
  let zeroAddress = "0x0000000000000000000000000000000000000000";
  let reserveAddress = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
  const offerredAmount = 100000;
  const requestedAmount = 200000;

  beforeEach(async function () {
    [addr0, addr1, addr2, addr3] = await ethers.getSigners();

    const CoinDeedAddressesProvider = await ethers.getContractFactory(
      "CoinDeedAddressesProvider"
    );
    coinDeedAddressesProvider = await CoinDeedAddressesProvider.deploy();
    const CoinDeedFactory = await ethers.getContractFactory("CoinDeedFactory");

    coinDeedFactory = await CoinDeedFactory.deploy(
      coinDeedAddressesProvider.address,
      100,
      10000
    );

    const WholesaleFactory = await ethers.getContractFactory(
      "WholesaleFactory"
    );
    wholesaleFactory = await WholesaleFactory.deploy(
      coinDeedAddressesProvider.address
    );

    const Token = await ethers.getContractFactory("Token");
    tokenA = await Token.deploy("tokenA", "TA");
    await tokenA.deployed();
    tokenA.mint(addr0.address, ethers.utils.parseEther("1000000"));

    tokenB = await Token.deploy("tokenB", "TB");
    await tokenB.deployed();
    tokenB.mint(addr0.address, ethers.utils.parseEther("1000000"));

    await coinDeedAddressesProvider.setCoinDeedFactory(coinDeedFactory.address);
    await coinDeedAddressesProvider.setWholesaleFactory(
      wholesaleFactory.address
    );
  });

  describe("createWholesale", function () {
    it("should deploy wholesale with open state", async function () {
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      const result = await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress
      );

      // validate events
      expect(result.events[result.events.length - 1].event).to.equal(
        "WholesaleCreated"
      );

      // validate balance was taken out of the owner
      expect(await tokenA.balanceOf(wholesaleFactory.address)).to.equal(
        offerredAmount
      );

      // validate sale state
      const wholesale = await wholesaleFactory.getWholesale(1);
      expect(wholesale.state).to.equal(0);
      expect(wholesale.offeredBy).to.equal(addr0.address);
    });

    it("should deploy wholesale with reserved deed with Open state", async function () {
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      const result = await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        reserveAddress
      );

      // validate events
      expect(result.events[result.events.length - 1].event).to.equal(
        "WholesaleCreated"
      );

      // validate balance was taken out of the owner
      expect(await tokenA.balanceOf(wholesaleFactory.address)).to.equal(
        offerredAmount
      );

      // validate sale state
      const wholesale = await wholesaleFactory.getWholesale(1);
      expect(wholesale.state).to.equal(0);
    });
  });

  describe("createWholesaleEth", function () {
    it("should deploy wholesale with open state", async function () {
      const result = await createWholesaleEth(
        wholesaleFactory,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress
      );

      expect(result.events[result.events.length - 1].event).to.equal(
        "WholesaleCreated"
      );

      // validate sale state
      const wholesale = await wholesaleFactory.getWholesale(1);
      expect(wholesale.offeredAmount).to.equal(offerredAmount);
      expect(wholesale.tokenOffered).to.equal(zeroAddress);
      expect(wholesale.state).to.equal(0);
      expect(wholesale.offeredBy).to.equal(addr0.address);
    });

    it("should deploy wholesale with reserved deed with Open state", async function () {
      const result = await createWholesaleEth(
        wholesaleFactory,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        reserveAddress
      );

      // validate events
      expect(result.events[result.events.length - 1].event).to.equal(
        "WholesaleCreated"
      );

      // validate sale state
      const wholesale = await wholesaleFactory.getWholesale(1);
      expect(wholesale.state).to.equal(0);
    });
  });

  describe("Private Wholesale", function () {
    it("should create a private wholesale", async function () {
      const result = await createWholesaleEth(
        wholesaleFactory,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress,
        true
      );

      expect(result.events[result.events.length - 1].event).to.equal(
        "WholesaleCreated"
      );

      // validate sale state
      const wholesale = await wholesaleFactory.getWholesale(1);
      expect(wholesale.offeredAmount).to.equal(offerredAmount);
      expect(wholesale.tokenOffered).to.equal(zeroAddress);
      expect(wholesale.state).to.equal(0);
      expect(wholesale.offeredBy).to.equal(addr0.address);
      expect(wholesale.isPrivate).to.equal(true);
    });
    it("should add permitted deed managers to the wholesale", async function () {
      const result = await createWholesaleEth(
        wholesaleFactory,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress,
        true
      );

      expect(result.events[result.events.length - 1].event).to.equal(
        "WholesaleCreated"
      );

      await wholesaleFactory.permitManager(1, addr1.address);
      expect(
        await wholesaleFactory.permittedDeedManager(1, addr1.address)
      ).to.equal(true);
    });
    it("should only allow deeds to reserve a wholesale", async function () {
      const result = await createWholesaleEth(
        wholesaleFactory,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress,
        true
      );

      expect(result.events[result.events.length - 1].event).to.equal(
        "WholesaleCreated"
      );
      await expectRevert(wholesaleFactory.reserveWholesale(1), "Not deed");
    });
  });

  describe("cancelWholesale", function () {
    it("should only allow to cancel OPEN sale contracts", async function () {
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress
      );
      await wholesaleFactory.reserveWholesale(1);

      await expectRevert(
        wholesaleFactory.cancelWholesale(1),
        "Contract cannot be cancelled"
      );
    });

    it("should allow owner to cancel RESERVED state if deadline is passed", async function () {
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000,
        zeroAddress
      );
      await wholesaleFactory.reserveWholesale(1);
      await ethers.provider.send("evm_increaseTime", [1001]);

      const tx = await wholesaleFactory.cancelWholesale(1);
      await ethers.provider.send("evm_increaseTime", [1]);

      // validate events
      const result = await tx.wait();
      expect(result.events[result.events.length - 1].event).to.equal(
        "WholesaleCanceled"
      );
    });

    it("should allow owner to cancel OPEN state sale", async function () {
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress
      );
      const tx = await wholesaleFactory.cancelWholesale(1);

      // validate events
      const result = await tx.wait();
      expect(result.events[result.events.length - 1].event).to.equal(
        "WholesaleCanceled"
      );
    });
  });

  describe("reserveWholesale", function () {
    it("should only allow to reserve OPEN sale contracts", async function () {
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress
      );
      await wholesaleFactory.reserveWholesale(1);

      await expectRevert(
        wholesaleFactory.reserveWholesale(1),
        "Contract is in invalid state"
      );
    });

    it("should only allow to reserve before deadline", async function () {
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        -1000,
        zeroAddress
      );

      await expectRevert(
        wholesaleFactory.reserveWholesale(1),
        "Contract deadline is passed"
      );
    });

    it("should allow to reserve OPEN state sale", async function () {
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress
      );
      const tx = await wholesaleFactory.reserveWholesale(1);

      // validate events
      const result = await tx.wait();
      expect(result.events[result.events.length - 1].event).to.equal(
        "WholesaleReserved"
      );
    });
  });

  describe("reserveWholesaleToDeed", function () {
    it("should only allow sale owner to reserve the sale", async function () {
      const [_, addr1] = await ethers.getSigners();
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress
      );

      await expectRevert(
        wholesaleFactory
          .connect(addr1)
          .reserveWholesaleToDeed(1, reserveAddress),
        "Only sale owner can access this method"
      );
    });

    it("should only allow to reserve OPEN sale contracts", async function () {
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress
      );
      await wholesaleFactory.reserveWholesale(1);

      await expectRevert(
        wholesaleFactory.reserveWholesaleToDeed(1, reserveAddress),
        "Contract is in invalid state"
      );
    });

    it("should allow to reserve OPEN state sale", async function () {
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress
      );
      const tx = await wholesaleFactory.reserveWholesaleToDeed(
        1,
        reserveAddress
      );
    });
  });

  describe("cancelReservation", function () {
    it("should only allow sale owner to cancel the reservation", async function () {
      const [_, addr1] = await ethers.getSigners();
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        reserveAddress
      );

      await expectRevert(
        wholesaleFactory.connect(addr1).cancelReservation(1),
        "Only sale owner can access this method"
      );
    });

    it("should only allow owner to cancel reservation for reserved sales", async function () {
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress
      );

      await expectRevert(
        wholesaleFactory.cancelReservation(1),
        "Contract is in invalid state"
      );
    });

    it("should allow owner to cancel reservation for reserved sales", async function () {
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress
      );
      await wholesaleFactory.reserveWholesale(1);

      const tx = await wholesaleFactory.cancelReservation(1);

      // validate events
      const result = await tx.wait();
      expect(result.events[result.events.length - 1].event).to.equal(
        "WholesaleUnreserved"
      );
    });
  });

  describe("executeWholesale", function () {
    it("should only allow to execute a reserved wholesale", async function () {
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress
      );

      await expectRevert(
        wholesaleFactory.executeWholesale(1, requestedAmount),
        "Contract is in invalid state"
      );
    });
    it("should only allow deed to execute a reserved wholesale", async function () {
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress
      );
      await wholesaleFactory.connect(addr1).reserveWholesale(1);

      await expectRevert(
        wholesaleFactory.executeWholesale(1, requestedAmount),
        "Only deed contract can access this method"
      );
    });

    it("should execute a reserved wholesale with non eth", async function () {
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress
      );
      await wholesaleFactory.reserveWholesale(1);

      const oldBalance = await tokenB.balanceOf(addr0.address);

      await tokenB.approve(wholesaleFactory.address, requestedAmount);
      await wholesaleFactory.executeWholesale(1, requestedAmount);

      const newBalance = await tokenB.balanceOf(addr0.address);
      expect(oldBalance.sub(requestedAmount)).to.equal(newBalance);
    });

    it("should execute a reserved wholesale with eth", async function () {
      await createWholesaleEth(
        wholesaleFactory,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress
      );
      await wholesaleFactory.reserveWholesale(1);

      const oldBalance = await tokenB.balanceOf(addr0.address);

      await tokenB.approve(wholesaleFactory.address, requestedAmount);
      await wholesaleFactory.executeWholesale(1, requestedAmount);

      const newBalance = await tokenB.balanceOf(addr0.address);
      expect(oldBalance.sub(requestedAmount)).to.equal(newBalance);
    });
  });

  describe("withdraw", function () {
    it("should only allow to withdraw from completed state", async function () {
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress
      );

      await expectRevert(
        wholesaleFactory.withdraw(1),
        "Contract is in invalid state"
      );
    });
    it("should only allow owner to withdraw", async function () {
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress
      );
      await wholesaleFactory.reserveWholesale(1);
      await tokenB.approve(wholesaleFactory.address, requestedAmount);
      await wholesaleFactory.executeWholesale(1, requestedAmount);

      await expectRevert(
        wholesaleFactory.connect(addr1).withdraw(1),
        "Only sale owner can access this method"
      );
    });

    it("should allow owner to withdraw non eth", async function () {
      await tokenA.approve(wholesaleFactory.address, offerredAmount);
      await createWholesale(
        wholesaleFactory,
        tokenA.address,
        tokenB.address,
        offerredAmount,
        requestedAmount,
        1000,
        1000000,
        zeroAddress
      );
      await wholesaleFactory.reserveWholesale(1);
      await tokenB.approve(wholesaleFactory.address, requestedAmount);
      await wholesaleFactory.executeWholesale(1, requestedAmount);

      const oldBalance = await tokenB.balanceOf(addr0.address);
      await wholesaleFactory.withdraw(1);
      const newBalance = await tokenB.balanceOf(addr0.address);
      expect(oldBalance.add(requestedAmount)).to.equal(newBalance);
    });
  });
});

async function createWholesale(
  wholesaleFactory,
  tokenOffered,
  tokenRequested,
  offeredAmount,
  requestedAmount,
  minSaleAmount,
  deadline,
  reservedTo,
  isPrivate = false
) {
  const blockNum = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNum);
  const blockTime = block.timestamp;

  const tx = await wholesaleFactory.createWholesale(
    tokenOffered,
    tokenRequested,
    offeredAmount,
    requestedAmount,
    minSaleAmount,
    blockTime + deadline,
    reservedTo,
    isPrivate
  );
  const result = await tx.wait();
  return result;
}

async function createWholesaleEth(
  wholesaleFactory,
  tokenRequested,
  offeredAmount,
  requestedAmount,
  minSaleAmount,
  deadline,
  reservedTo,
  isPrivate = false
) {
  const blockNum = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNum);
  const blockTime = block.timestamp;

  const tx = await wholesaleFactory.createWholesaleEth(
    tokenRequested,
    requestedAmount,
    minSaleAmount,
    blockTime + deadline,
    reservedTo,
    isPrivate,
    {
      value: offeredAmount,
    }
  );
  const result = await tx.wait();
  return result;
}
