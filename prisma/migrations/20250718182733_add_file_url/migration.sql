/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `ChatSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "fileUrl" TEXT;

-- AlterTable
ALTER TABLE "ChatSession" DROP COLUMN "fileUrl";
