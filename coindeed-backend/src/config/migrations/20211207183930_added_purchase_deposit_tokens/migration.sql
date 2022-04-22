-- CreateTable
CREATE TABLE "PurchaseToken" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "address" CHAR(42) NOT NULL,

    CONSTRAINT "PurchaseToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositToken" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "address" CHAR(42) NOT NULL,

    CONSTRAINT "DepositToken_pkey" PRIMARY KEY ("id")
);
