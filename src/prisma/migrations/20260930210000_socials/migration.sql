-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN', 'GITHUB', 'YOUTUBE', 'TIKTOK', 'SNAPCHAT', 'DISCORD', 'STRAVA', 'SPOTIFY', 'WEBSITE');

-- CreateEnum
CREATE TYPE "SpecialSocials" AS ENUM ('FRONTPAGE');

-- CreateTable
CREATE TABLE "Social" (
    "id" SERIAL NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "url" TEXT NOT NULL,
    "userId" INTEGER,
    "special" "SpecialSocials",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Social_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Social_userId_platform_key" ON "Social"("userId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "Social_special_platform_key" ON "Social"("special", "platform");

-- AddForeignKey
ALTER TABLE "Social" ADD CONSTRAINT "Social_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
