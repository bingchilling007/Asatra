-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PropertyType" ADD VALUE 'HOTEL';
ALTER TYPE "PropertyType" ADD VALUE 'FARM_HOUSE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Province" ADD VALUE 'ISLAMABAD';
ALTER TYPE "Province" ADD VALUE 'AZAD_KASHMIR';

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_hostId_fkey";

-- DropIndex
DROP INDEX "Listing_province_idx";

-- DropIndex
DROP INDEX "ListingImage_listingId_idx";

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "ListingStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "response" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "suspended" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
