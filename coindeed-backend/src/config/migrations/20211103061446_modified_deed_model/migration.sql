/*
  Warnings:
  - Added the required column  to the  table without a default value. This is not possible if the table is not empty.
  - Added the required column  to the  table without a default value. This is not possible if the table is not empty.
  - Changed the type of  on the  table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of  on the  table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
*/
-- AlterTable
ALTER TABLE Deed ADD COLUMN     coinAName VARCHAR(4) NOT NULL,
ADD COLUMN     coinBName VARCHAR(4) NOT NULL,
DROP COLUMN status,
ADD COLUMN     status TEXT NOT NULL,
DROP COLUMN type,
ADD COLUMN     type TEXT NOT NULL;

-- DropEnum
DROP TYPE deedStatus;

-- DropEnum
DROP TYPE deedType;
