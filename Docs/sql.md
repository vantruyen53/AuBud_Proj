-- 1. USER & ACCOUNT
CREATE TABLE IF NOT EXISTS `user` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`user_name` VARCHAR(255) NOT NULL,
`create_at` DATETIME NOT NULL,
`last_input` DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS `account` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`email` VARCHAR(255),
`password` VARCHAR(255) NOT NULL,
`role` VARCHAR(255) NOT NULL,
`user_id` VARCHAR(255) NOT NULL, -- Đã sửa thành VARCHAR
`status` VARCHAR(255) NOT NULL,
`last_login` DATETIME NOT NULL,
`verified` BOOLEAN NOT NULL
`public_key` TEXT NOT NULL,
`encryptedPrivateKey` TEXT NOT NULL,
);

CREATE TABLE IF NOT EXISTS `token` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`token_hash` VARCHAR(255) NOT NULL,
`user_id` VARCHAR(255) NOT NULL, -- Đã sửa thành VARCHAR
`expires_at` DATETIME NOT NULL,
`device_info` VARCHAR(255) NOT NULL,
`created_at` DATETIME NOT NULL
);

-- 2. FINANCE
CREATE TABLE IF NOT EXISTS `wallet` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`name` VARCHAR(255) NOT NULL,
`balance` DECIMAL(15,2) NOT NULL DEFAULT 0,
`create_at` DATETIME NOT NULL,
`user_id` VARCHAR(255) NOT NULL,
`status` VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `category` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`name` VARCHAR(255) NOT NULL,
`type` VARCHAR(255) NOT NULL,
`user_id` VARCHAR(255) NOT NULL,
`usageCount` INTEGER DEFAULT 0,
`lastUsedAt` DATETIME,
`icon_name` VARCHAR(255) NOT NULL,
`icon_color` VARCHAR(255) NOT NULL,
`is_default` BOOLEAN NOT NULL DEFAULT FALSE,
`library` VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `budget` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`user_id` VARCHAR(255) NOT NULL,
`category_id` VARCHAR(255) NOT NULL,
`current_spent` DECIMAL(15,2) NOT NULL DEFAULT 0,
`amount_limit` DECIMAL(15,2) NOT NULL,
`year_month` DATE NOT NULL, -- Đã sửa dấu gạch ngang
`status` VARCHAR(255) NOT NULL,
`last_access` DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS `transaction` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`category_id` VARCHAR(255) NOT NULL,
`amount` DECIMAL(15,2) NOT NULL,
`user_id` VARCHAR(255) NOT NULL,
`wallet_id` VARCHAR(255) NOT NULL,
`create_at` DATETIME NOT NULL,
`note` TEXT,
`status` VARCHAR(255) NOT NULL
);

-- 3. DEBTS & SAVINGS
CREATE TABLE IF NOT EXISTS `debts` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`user_id` VARCHAR(255) NOT NULL,
`name` VARCHAR(255) NOT NULL,=
`total_amount` DECIMAL(15,2) NOT NULL,
`type` VARCHAR(255) NOT NULL,=
`partner_name` VARCHAR(255) NOT NULL,
`remaining` DECIMAL(15,2) NOT NULL,
`status` VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `debt_history` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`debt_id` VARCHAR(255) NOT NULL,
`action_type` VARCHAR(255) NOT NULL,
`amount` DECIMAL(15,2) NOT NULL,
`create_at` DATETIME NOT NULL,
`note` TEXT NOT NULL,
`user_id` VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `savings_book` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`user_id` VARCHAR(255) NOT NULL,
`target` BIGINT NOT NULL,
`balance` BIGINT NOT NULL,
`create_at` DATETIME NOT NULL,
`name` VARCHAR(255) NOT NULL,
`last_access` DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS `savings_history` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`user_id` VARCHAR(255) NOT NULL,
`wallet_id` VARCHAR(255) NOT NULL,
`amount` DECIMAL(15,2) NOT NULL,
`create_at` DATE NOT NULL,
`note` TEXT,
`type` VARCHAR(255) NOT NULL,
`saving_book_id` VARCHAR(255) NOT NULL
);

-- 4. GROUPS
CREATE TABLE IF NOT EXISTS `group_table` ( 
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`name` VARCHAR(255) NOT NULL,
`create_at` DATETIME NOT NULL,
`status` VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `member_group` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`user_id` VARCHAR(255) NOT NULL,
`group_id` VARCHAR(255) NOT NULL,
`status` VARCHAR(255) NOT NULL, -- 'joining' | 'moved'
);

CREATE TABLE IF NOT EXISTS `group_fund` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`name` VARCHAR(255) NOT NULL,
`balance` DECIMAL(15,2) NOT NULL,
`group_id` VARCHAR(255) NOT NULL,
`create_by` VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `group_transaction` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`category_id` VARCHAR(255) NOT NULL,
`amount` DECIMAL(15,2) NOT NULL,
`type` VARCHAR(255) NOT NULL,
`user_id` VARCHAR(255) NOT NULL,
`group_fund_id` VARCHAR(255) NOT NULL,
`create_at` DATETIME NOT NULL,
`note` TEXT,
`group_id` VARCHAR(255) NOT NULL
);

-- 5. SYSTEM
CREATE TABLE IF NOT EXISTS `notification` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`for_user_id` VARCHAR(255) NOT NULL,
`contents` TEXT NOT NULL,
`create_at` DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS `Logs` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`contents` TEXT NOT NULL,
`by_user_id` VARCHAR(255) NOT NULL,
`create_at` DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS `traffic` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`traffic_count` BIGINT NOT NULL,
`y_m_d` DATE NOT NULL UNIQUE,
`updated_at` DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS `goal_price` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`type` VARCHAR(255) NOT NULL,
`buy_price` BIGINT NOT NULL,
`sell_price` BIGINT NOT NULL,
`datetime` DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS `forign_currency` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`country` VARCHAR(255) NOT NULL,
`foreign_currency` VARCHAR(255) NOT NULL,
`vnd` VARCHAR(255) NOT NULL,
`updated_at` DATETIME NOT NULL -- Đã sửa tên cột
);

CREATE TABLE IF NOT EXISTS `convert_history` (
`id` VARCHAR(255) NOT NULL PRIMARY KEY,
`user_id` VARCHAR(255) NOT NULL,
`from_currency` VARCHAR(255) NOT NULL,
`to_currency` VARCHAR(255) NOT NULL,
`date_at` DATETIME NOT NULL,
`note` TEXT,
`amount` DECIMAL(15,2) NOT NULL
);

-- 6. ALTER TABLES FOR FOREIGN KEYS
ALTER TABLE `account` ADD FOREIGN KEY(`user_id`) REFERENCES `user`(`id`);
ALTER TABLE `token` ADD FOREIGN KEY(`user_id`) REFERENCES `user`(`id`);
ALTER TABLE `category` ADD FOREIGN KEY(`user_id`) REFERENCES `user`(`id`);
ALTER TABLE `wallet` ADD FOREIGN KEY(`user_id`) REFERENCES `user`(`id`);
ALTER TABLE `transaction` ADD FOREIGN KEY(`user_id`) REFERENCES `user`(`id`);
ALTER TABLE `transaction` ADD FOREIGN KEY(`wallet_id`) REFERENCES `wallet`(`id`);
ALTER TABLE `budget` ADD FOREIGN KEY(`user_id`) REFERENCES `user`(`id`);
ALTER TABLE `budget` ADD FOREIGN KEY(`category_id`) REFERENCES `category`(`id`);
ALTER TABLE `debts` ADD FOREIGN KEY(`user_id`) REFERENCES `user`(`id`);
ALTER TABLE `savings_book` ADD FOREIGN KEY(`user_id`) REFERENCES `user`(`id`);
ALTER TABLE `debt_history` ADD FOREIGN KEY(`debt_id`) REFERENCES `debts`(`id`);
ALTER TABLE `debt_history` ADD FOREIGN KEY(`user_id`) REFERENCES `user`(`id`);
ALTER TABLE `member_group` ADD FOREIGN KEY(`user_id`) REFERENCES `user`(`id`);
ALTER TABLE `member_group` ADD FOREIGN KEY(`group_id`) REFERENCES `group`(`id`);

<!-- References bổ sung  -->

ALTER TABLE `transaction` ADD FOREIGN KEY(`budget_id`) REFERENCES `budget`(`id`)
ALTER TABLE `savings_history` ADD FOREIGN KEY(`user_id`) REFERENCES `user`(`id`)
ALTER TABLE `savings_history` ADD FOREIGN KEY(`wallet_id`) REFERENCES `wallet`(`id`)
ALTER TABLE `savings_history` ADD FOREIGN KEY(`saving_book_id`) REFERENCES `savings_book`(`id`)
ALTER TABLE `group_fund` ADD FOREIGN KEY(`group_id`) REFERENCES `group`(`id`)
ALTER TABLE `group_fund` ADD FOREIGN KEY(`create_by`) REFERENCES `user`(`id`)
ALTER TABLE `group_transaction` ADD FOREIGN KEY(`user_id`) REFERENCES `user`(`id`)
ALTER TABLE `group_transaction` ADD FOREIGN KEY(`group_fund_id`) REFERENCES `group_fund`(`id`)
ALTER TABLE `group_transaction`ADD FOREIGN KEY(`group_id`) REFERENCES `group`(`id`)
ALTER TABLE `notification` ADD FOREIGN KEY(`for_user_id`) REFERENCES `user`(`id`)
ALTER TABLE `Logs` ADD FOREIGN KEY(`by_user_id`) REFERENCES `user`(`id`)
ALTER TABLE `convert_history` ADD FOREIGN KEY(`user_id`) REFERENCES `user`(`id`)
