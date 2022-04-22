/*
  Warnings:
  - You are about to drop the  table. If the table is not empty, all the data it contains will be lost.
*/
-- CreateEnum
CREATE TYPE deedStatus AS ENUM ('Cancelled', 'Completed', 'Escrow', 'Open', 'Recruiting');

-- CreateEnum
CREATE TYPE deedType AS ENUM ('Fixed', 'Floating');

-- DropTable
DROP TABLE Test;

-- CreateTable
CREATE TABLE Deed (
    id SERIAL NOT NULL,
    deedAddress CHAR(42) NOT NULL,
    deedManagerAddress CHAR(42) NOT NULL,
    status deedStatus NOT NULL,
    type deedType NOT NULL,
    wholesaleAddress CHAR(42) NOT NULL,
    coinA VARCHAR(4) NOT NULL,
    coinB VARCHAR(4) NOT NULL,
    loanLeverage DOUBLE PRECISION NOT NULL,
    size INTEGER NOT NULL,
    managementFee DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    recruitingEndDate TIMESTAMP(3) NOT NULL,
    escrowEndDate TIMESTAMP(3) NOT NULL,
    deedEndDate TIMESTAMP(3) NOT NULL,
    manuallyTriggeredAssetPriceDrop DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    manuallyTriggeredLeverageAdjustment INTEGER NOT NULL,
    systemTriggeredAssetPriceDrop DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    systemTriggeredLeveragedAdjustment INTEGER NOT NULL,
    systemTriggeredDeedCompletionAssetPriceDrop DOUBLE PRECISION NOT NULL,
    allowBrokers BOOLEAN NOT NULL,
    minimumBrokerStakingAmount DOUBLE PRECISION NOT NULL,
    published TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT Deed_pkey PRIMARY KEY (id)
);
