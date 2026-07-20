-- CreateTable
CREATE TABLE "FxRate" (
    "currency" "Currency" NOT NULL,
    "rateToPLN" DOUBLE PRECISION NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FxRate_pkey" PRIMARY KEY ("currency")
);
