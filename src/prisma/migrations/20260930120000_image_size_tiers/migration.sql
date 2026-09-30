-- AlterTable
ALTER TABLE "ProcessedImageFiles" ALTER COLUMN "fsLocationSmallSize" DROP NOT NULL,
ALTER COLUMN "fsLocationMediumSize" DROP NOT NULL,
ALTER COLUMN "fsLocationLargeSize" DROP NOT NULL,
ADD COLUMN     "fsLocationHugeSize" TEXT,
ADD COLUMN     "fsLocationMicroSize" TEXT,
ADD COLUMN     "heightHugeSize" INTEGER,
ADD COLUMN     "heightLargeSize" INTEGER,
ADD COLUMN     "heightMediumSize" INTEGER,
ADD COLUMN     "heightMicroSize" INTEGER,
ADD COLUMN     "heightSmallSize" INTEGER,
ADD COLUMN     "heightTinySize" INTEGER,
ADD COLUMN     "widthHugeSize" INTEGER,
ADD COLUMN     "widthLargeSize" INTEGER,
ADD COLUMN     "widthMediumSize" INTEGER,
ADD COLUMN     "widthMicroSize" INTEGER,
ADD COLUMN     "widthSmallSize" INTEGER,
ADD COLUMN     "widthTinySize" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedImageFiles_fsLocationHugeSize_key" ON "ProcessedImageFiles"("fsLocationHugeSize");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedImageFiles_fsLocationMicroSize_key" ON "ProcessedImageFiles"("fsLocationMicroSize");
