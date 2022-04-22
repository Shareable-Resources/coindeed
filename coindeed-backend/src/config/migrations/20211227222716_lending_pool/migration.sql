-- CreateTable
CREATE TABLE "LendingPool" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "tokenAddress" CHAR(42) NOT NULL,
    "oracelTokenAddress" CHAR(42) NOT NULL,

    CONSTRAINT "LendingPool_pkey" PRIMARY KEY ("id")
);
