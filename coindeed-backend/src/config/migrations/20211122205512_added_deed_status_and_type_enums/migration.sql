/*
  Warnings:

  - You are about to drop the `deed` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "deedStatus" AS ENUM ('Cancelled', 'Completed', 'Escrow', 'Open', 'Recruiting');

-- CreateEnum
CREATE TYPE "deedType" AS ENUM ('Fixed', 'Floating');

-- DropTable
DROP TABLE Deed;

-- CreateTable
CREATE TABLE "Deed" (
    "id" SERIAL NOT NULL,
    "deedAddress" CHAR(42),
    "deedManager" CHAR(42),
    "status" TEXT,
    "type" TEXT,
    "swapType" TEXT DEFAULT E'DEX',
    "actionType" TEXT,
    "wholesaleAddress" CHAR(42),
    "coinA" CHAR(42),
    "coinAName" VARCHAR(4),
    "coinB" CHAR(42),
    "coinBName" VARCHAR(4),
    "loanLeverage" DOUBLE PRECISION NOT NULL,
    "size" INTEGER NOT NULL,
    "sizeConsumed" INTEGER,
    "managementFee" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "recruitingEndDate" TIMESTAMP(3) NOT NULL,
    "escrowEndDate" TIMESTAMP(3) NOT NULL,
    "deedEndDate" TIMESTAMP(3) NOT NULL,
    "systemTriggeredAssetPriceDrop" DOUBLE PRECISION DEFAULT 0.00,
    "systemTriggeredLeveragedAdjustment" INTEGER,
    "systemTriggeredDeedCompletionAssetPriceDrop" DOUBLE PRECISION,
    "allowBrokers" BOOLEAN NOT NULL,
    "minimumBrokerStakingAmount" DOUBLE PRECISION,
    "published" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,
    "progress" DOUBLE PRECISION DEFAULT 0.00,
    "profit" DOUBLE PRECISION DEFAULT 0.00,
    "allOrMy" TEXT,

    CONSTRAINT "Deed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wholesale" (
    "id" SERIAL NOT NULL,
    "wholesaleAddress" CHAR(42) NOT NULL,
    "deedAddress" CHAR(42),
    "status" CHAR(42),
    "token" CHAR(42) NOT NULL,
    "size" INTEGER NOT NULL,
    "pricePerToken" DOUBLE PRECISION NOT NULL,
    "wholesaleEndDate" TIMESTAMP(3) NOT NULL,
    "type" CHAR(42) NOT NULL,
    "minimumDeedRequirement" INTEGER NOT NULL,
    "transactionFee" DOUBLE PRECISION NOT NULL,
    "escrowEndDate" TIMESTAMP(3) NOT NULL,
    "wholesaleManager" CHAR(42) NOT NULL,
    "managementFee" DOUBLE PRECISION DEFAULT 0.00,
    "recruitingEndDate" TIMESTAMP(3),
    "manuallyTriggeredAssetPriceDrop" DOUBLE PRECISION DEFAULT 0.00,
    "manuallyTriggeredLeverageAdjustment" INTEGER,
    "systemTriggeredAssetPriceDrop" DOUBLE PRECISION DEFAULT 0.00,
    "systemTriggeredLeveragedAdjustment" INTEGER,
    "systemTriggeredDeedCompletionAssetPriceDrop" DOUBLE PRECISION,
    "allowBrokers" BOOLEAN,
    "minimumBrokerStakingAmount" DOUBLE PRECISION,
    "published" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3),
    "profit" DOUBLE PRECISION,

    CONSTRAINT "Wholesale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buyer" (
    "id" SERIAL NOT NULL,
    "deedsNetWorth" DOUBLE PRECISION NOT NULL,
    "totalLendingPoolValue" DOUBLE PRECISION NOT NULL,
    "totalWholesaleClaimBalance" DOUBLE PRECISION NOT NULL,
    "totalDeedsClaimBalance" DOUBLE PRECISION NOT NULL,
    "totalStakingAmount" DOUBLE PRECISION NOT NULL,
    "APY" DOUBLE PRECISION NOT NULL,
    "totalDeeds" INTEGER NOT NULL,
    "totalDeedsInRecruiting" INTEGER NOT NULL,
    "totalDeedsInEscrow" INTEGER NOT NULL,
    "totalDeedsOpen" INTEGER NOT NULL,

    CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeedManager" (
    "id" SERIAL NOT NULL,
    "blockchainAccountAddress" CHAR(42) NOT NULL,
    "deedsNetWorth" DOUBLE PRECISION NOT NULL,
    "totalLendingPoolValue" DOUBLE PRECISION NOT NULL,
    "totalWholesaleClaimBalance" DOUBLE PRECISION NOT NULL,
    "totalDeedsClaimBalance" DOUBLE PRECISION NOT NULL,
    "totalStakingAmount" DOUBLE PRECISION NOT NULL,
    "APY" DOUBLE PRECISION NOT NULL,
    "totalDeeds" INTEGER NOT NULL,
    "totalDeedsInRecruiting" INTEGER NOT NULL,
    "totalDeedsInEscrow" INTEGER NOT NULL,
    "totalDeedsOpen" INTEGER NOT NULL,

    CONSTRAINT "DeedManager_pkey" PRIMARY KEY ("id")
);
