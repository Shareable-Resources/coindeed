/*
  Warnings:
  - Added the required column  to the  table without a default value. This is not possible if the table is not empty.
*/
-- AlterTable
ALTER TABLE Deed ADD COLUMN     actionType TEXT NOT NULL;

