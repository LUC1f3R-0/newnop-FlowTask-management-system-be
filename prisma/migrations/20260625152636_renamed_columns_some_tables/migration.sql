/*
  Warnings:

  - You are about to drop the column `refresh_token` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - Added the required column `hashed_refresh_token` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hashed_password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `sessions` DROP COLUMN `refresh_token`,
    ADD COLUMN `hashed_refresh_token` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `password`,
    ADD COLUMN `hashed_password` VARCHAR(191) NOT NULL;
