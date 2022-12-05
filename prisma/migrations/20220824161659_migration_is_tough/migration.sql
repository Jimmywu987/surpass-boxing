/*
  Warnings:

  - The primary key for the `BookingTimeslot` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ChatTable` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CustomerBookingTimeslot` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `District` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Like` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `senderId` on the `Message` table. All the data in the column will be lost.
  - The primary key for the `OneTimeOffOpenTimeslot` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RatingAndCommentOnCustomer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RatingAndCommentOnRoom` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Room` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RoomImg` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `WeeklyOpenTimeslot` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `userId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BookingTimeslot" DROP CONSTRAINT "BookingTimeslot_customerBookingTimeslotId_fkey";

-- DropForeignKey
ALTER TABLE "ChatTable" DROP CONSTRAINT "ChatTable_customerId_fkey";

-- DropForeignKey
ALTER TABLE "ChatTable" DROP CONSTRAINT "ChatTable_hostId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerBookingTimeslot" DROP CONSTRAINT "CustomerBookingTimeslot_customerId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerBookingTimeslot" DROP CONSTRAINT "CustomerBookingTimeslot_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatTableId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "OneTimeOffOpenTimeslot" DROP CONSTRAINT "OneTimeOffOpenTimeslot_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RatingAndCommentOnCustomer" DROP CONSTRAINT "RatingAndCommentOnCustomer_customerId_fkey";

-- DropForeignKey
ALTER TABLE "RatingAndCommentOnCustomer" DROP CONSTRAINT "RatingAndCommentOnCustomer_hostId_fkey";

-- DropForeignKey
ALTER TABLE "RatingAndCommentOnRoom" DROP CONSTRAINT "RatingAndCommentOnRoom_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RatingAndCommentOnRoom" DROP CONSTRAINT "RatingAndCommentOnRoom_userId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_userId_fkey";

-- DropForeignKey
ALTER TABLE "RoomImg" DROP CONSTRAINT "RoomImg_roomId_fkey";

-- DropForeignKey
ALTER TABLE "WeeklyOpenTimeslot" DROP CONSTRAINT "WeeklyOpenTimeslot_roomId_fkey";

-- AlterTable
ALTER TABLE "BookingTimeslot" DROP CONSTRAINT "BookingTimeslot_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "customerBookingTimeslotId" SET DATA TYPE TEXT,
ADD CONSTRAINT "BookingTimeslot_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BookingTimeslot_id_seq";

-- AlterTable
ALTER TABLE "ChatTable" DROP CONSTRAINT "ChatTable_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "customerId" SET DATA TYPE TEXT,
ALTER COLUMN "hostId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ChatTable_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ChatTable_id_seq";

-- AlterTable
ALTER TABLE "CustomerBookingTimeslot" DROP CONSTRAINT "CustomerBookingTimeslot_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "roomId" SET DATA TYPE TEXT,
ALTER COLUMN "customerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "CustomerBookingTimeslot_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CustomerBookingTimeslot_id_seq";

-- AlterTable
ALTER TABLE "District" DROP CONSTRAINT "District_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "District_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "District_id_seq";

-- AlterTable
ALTER TABLE "Like" DROP CONSTRAINT "Like_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "roomId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Like_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Like_id_seq";

-- AlterTable
ALTER TABLE "Message" DROP CONSTRAINT "Message_pkey",
DROP COLUMN "senderId",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "chatTableId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Message_id_seq";

-- AlterTable
ALTER TABLE "OneTimeOffOpenTimeslot" DROP CONSTRAINT "OneTimeOffOpenTimeslot_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "roomId" SET DATA TYPE TEXT,
ADD CONSTRAINT "OneTimeOffOpenTimeslot_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "OneTimeOffOpenTimeslot_id_seq";

-- AlterTable
ALTER TABLE "RatingAndCommentOnCustomer" DROP CONSTRAINT "RatingAndCommentOnCustomer_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "customerId" SET DATA TYPE TEXT,
ALTER COLUMN "hostId" SET DATA TYPE TEXT,
ADD CONSTRAINT "RatingAndCommentOnCustomer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RatingAndCommentOnCustomer_id_seq";

-- AlterTable
ALTER TABLE "RatingAndCommentOnRoom" DROP CONSTRAINT "RatingAndCommentOnRoom_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "roomId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "RatingAndCommentOnRoom_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RatingAndCommentOnRoom_id_seq";

-- AlterTable
ALTER TABLE "Room" DROP CONSTRAINT "Room_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Room_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Room_id_seq";

-- AlterTable
ALTER TABLE "RoomImg" DROP CONSTRAINT "RoomImg_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "roomId" SET DATA TYPE TEXT,
ADD CONSTRAINT "RoomImg_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RoomImg_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE',
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "WeeklyOpenTimeslot" DROP CONSTRAINT "WeeklyOpenTimeslot_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "roomId" SET DATA TYPE TEXT,
ADD CONSTRAINT "WeeklyOpenTimeslot_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "WeeklyOpenTimeslot_id_seq";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomImg" ADD CONSTRAINT "RoomImg_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyOpenTimeslot" ADD CONSTRAINT "WeeklyOpenTimeslot_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OneTimeOffOpenTimeslot" ADD CONSTRAINT "OneTimeOffOpenTimeslot_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerBookingTimeslot" ADD CONSTRAINT "CustomerBookingTimeslot_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerBookingTimeslot" ADD CONSTRAINT "CustomerBookingTimeslot_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingTimeslot" ADD CONSTRAINT "BookingTimeslot_customerBookingTimeslotId_fkey" FOREIGN KEY ("customerBookingTimeslotId") REFERENCES "CustomerBookingTimeslot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingAndCommentOnRoom" ADD CONSTRAINT "RatingAndCommentOnRoom_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingAndCommentOnRoom" ADD CONSTRAINT "RatingAndCommentOnRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingAndCommentOnCustomer" ADD CONSTRAINT "RatingAndCommentOnCustomer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingAndCommentOnCustomer" ADD CONSTRAINT "RatingAndCommentOnCustomer_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatTableId_fkey" FOREIGN KEY ("chatTableId") REFERENCES "ChatTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatTable" ADD CONSTRAINT "ChatTable_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatTable" ADD CONSTRAINT "ChatTable_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
