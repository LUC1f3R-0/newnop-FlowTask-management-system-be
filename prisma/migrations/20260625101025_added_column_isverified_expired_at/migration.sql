-- AlterTable
ALTER TABLE `users` ADD COLUMN `hashed_otp` VARCHAR(191) NULL,
    ADD COLUMN `is_email_verified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `otp_expires_at` DATETIME(3) NULL;
