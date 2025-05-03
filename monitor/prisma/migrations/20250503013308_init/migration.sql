-- CreateTable
CREATE TABLE "Checks" (
    "id" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "up" BOOLEAN NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Checks_pkey" PRIMARY KEY ("id")
);
