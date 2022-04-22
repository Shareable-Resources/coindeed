/*
  Warnings:
  - You are about to drop the column  on the  table. All the data in the column will be lost.
  - You are about to drop the column  on the  table. All the data in the column will be lost.
*/
-- AlterTable
ALTER TABLE Deed DROP COLUMN manuallyTriggeredAssetPriceDrop,
DROP COLUMN manuallyTriggeredLeverageAdjustment,
ADD COLUMN     sizeConsumed INTEGER,
ADD COLUMN     swapType TEXT,
ALTER COLUMN deedAddress DROP NOT NULL,
ALTER COLUMN deedManagerAddress DROP NOT NULL,
ALTER COLUMN wholesaleAddress DROP NOT NULL,
ALTER COLUMN coinA DROP NOT NULL,
ALTER COLUMN coinB DROP NOT NULL,
ALTER COLUMN systemTriggeredAssetPriceDrop DROP NOT NULL,
ALTER COLUMN systemTriggeredLeveragedAdjustment DROP NOT NULL,
ALTER COLUMN systemTriggeredDeedCompletionAssetPriceDrop DROP NOT NULL,
ALTER COLUMN minimumBrokerStakingAmount DROP NOT NULL,
ALTER COLUMN coinAName DROP NOT NULL,
ALTER COLUMN coinBName DROP NOT NULL,
ALTER COLUMN status DROP NOT NULL,
ALTER COLUMN type DROP NOT NULL,
ALTER COLUMN actionType DROP NOT NULL;
