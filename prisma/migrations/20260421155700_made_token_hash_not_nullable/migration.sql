/*
  Warnings:

  - Made the column `tokenHash` on table `RefreshToken` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "tokenHash" SET NOT NULL;
