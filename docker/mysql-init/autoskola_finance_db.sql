USE autoskola_finance_db;

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 13, 2026 at 05:37 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `autoskola_finance_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `candidate_accounts`
--

CREATE TABLE `candidate_accounts` (
  `candidate_id` int(11) NOT NULL,
  `assigned_instructor_id` int(11) DEFAULT NULL,
  `enrollment_date` date DEFAULT NULL,
  `progress_percentage` decimal(38,2) DEFAULT NULL,
  `rule_id` int(11) DEFAULT NULL,
  `total_amount` decimal(38,2) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `candidate_ref_id` int(11) DEFAULT NULL,
  `remaining_debt` decimal(38,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `candidate_accounts`
--

INSERT INTO `candidate_accounts` (`candidate_id`, `assigned_instructor_id`, `enrollment_date`, `progress_percentage`, `rule_id`, `total_amount`, `user_id`, `candidate_ref_id`, `remaining_debt`) VALUES
(93, 101, '2026-04-06', 45.00, 1, 1200.00, 93, NULL, 1200.00),
(94, 102, '2026-05-06', 10.00, 2, 1500.00, 94, NULL, 1500.00),
(95, NULL, '2026-06-06', 0.00, NULL, 1500.00, NULL, 1, 0.00),
(96, NULL, '2026-06-06', 0.00, NULL, 1500.00, NULL, 2, 0.00),
(97, NULL, '2026-06-06', 0.00, NULL, 1500.00, NULL, 3, 1200.00),
(98, NULL, '2026-06-06', 0.00, NULL, 1900.00, NULL, 4, 0.00),
(99, NULL, '2026-06-06', 0.00, NULL, 1900.00, NULL, 5, 0.00),
(100, NULL, '2026-06-06', 0.00, NULL, 1900.00, NULL, 6, 0.00),
(101, NULL, '2026-06-06', 0.00, NULL, 1900.00, NULL, 7, 1600.00),
(102, NULL, '2026-06-08', 0.00, NULL, 1900.00, NULL, 8, 1200.00),
(103, NULL, '2026-06-09', 0.00, NULL, 1900.00, NULL, 9, 1600.00),
(104, NULL, '2026-06-10', 0.00, NULL, 1900.00, NULL, 10, 800.00),
(105, NULL, '2026-06-10', 0.00, NULL, 1900.00, NULL, 11, 1500.00),
(106, NULL, '2026-06-10', 0.00, NULL, 1900.00, NULL, 12, 1600.00),
(107, NULL, '2026-06-13', 0.00, NULL, 1900.00, NULL, 13, 1600.00);

-- --------------------------------------------------------

--
-- Table structure for table `obligations`
--

CREATE TABLE `obligations` (
  `id` int(11) NOT NULL,
  `label` varchar(255) NOT NULL,
  `order_index` int(11) NOT NULL,
  `paid_amount` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `type` varchar(255) NOT NULL,
  `account_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `obligations`
--

INSERT INTO `obligations` (`id`, `label`, `order_index`, `paid_amount`, `total_amount`, `type`, `account_id`) VALUES
(1, 'Upisnina', 0, 300.00, 300.00, 'ENROLLMENT', 98),
(2, '1. rata', 1, 400.00, 400.00, 'INSTALLMENT', 98),
(3, '2. rata', 2, 400.00, 400.00, 'INSTALLMENT', 98),
(4, '3. rata', 3, 400.00, 400.00, 'INSTALLMENT', 98),
(5, '4. rata', 4, 400.00, 400.00, 'INSTALLMENT', 98),
(6, 'Upisnina', 0, 300.00, 300.00, 'ENROLLMENT', 99),
(7, '1. rata', 1, 400.00, 400.00, 'INSTALLMENT', 99),
(8, '2. rata', 2, 400.00, 400.00, 'INSTALLMENT', 99),
(9, '3. rata', 3, 400.00, 400.00, 'INSTALLMENT', 99),
(10, '4. rata', 4, 400.00, 400.00, 'INSTALLMENT', 99),
(11, 'Upisnina', 0, 300.00, 300.00, 'ENROLLMENT', 100),
(12, '1. rata', 1, 400.00, 400.00, 'INSTALLMENT', 100),
(13, '2. rata', 2, 400.00, 400.00, 'INSTALLMENT', 100),
(14, '3. rata', 3, 400.00, 400.00, 'INSTALLMENT', 100),
(15, '4. rata', 4, 400.00, 400.00, 'INSTALLMENT', 100),
(16, 'Upisnina', 0, 300.00, 300.00, 'ENROLLMENT', 101),
(17, '1. rata', 1, 0.00, 400.00, 'INSTALLMENT', 101),
(18, '2. rata', 2, 0.00, 400.00, 'INSTALLMENT', 101),
(19, '3. rata', 3, 0.00, 400.00, 'INSTALLMENT', 101),
(20, '4. rata', 4, 0.00, 400.00, 'INSTALLMENT', 101),
(21, 'Upisnina', 0, 300.00, 300.00, 'ENROLLMENT', 95),
(22, '1. rata', 1, 400.00, 400.00, 'INSTALLMENT', 95),
(23, '2. rata', 2, 400.00, 400.00, 'INSTALLMENT', 95),
(24, '3. rata', 3, 400.00, 400.00, 'INSTALLMENT', 95),
(25, '4. rata', 4, 400.00, 400.00, 'INSTALLMENT', 95),
(26, 'Upisnina', 0, 300.00, 300.00, 'ENROLLMENT', 96),
(27, '1. rata', 1, 400.00, 400.00, 'INSTALLMENT', 96),
(28, '2. rata', 2, 400.00, 400.00, 'INSTALLMENT', 96),
(29, '3. rata', 3, 400.00, 400.00, 'INSTALLMENT', 96),
(30, '4. rata', 4, 400.00, 400.00, 'INSTALLMENT', 96),
(31, 'Upisnina', 0, 300.00, 300.00, 'ENROLLMENT', 97),
(32, '1. rata', 1, 400.00, 400.00, 'INSTALLMENT', 97),
(33, '2. rata', 2, 0.00, 400.00, 'INSTALLMENT', 97),
(34, '3. rata', 3, 0.00, 400.00, 'INSTALLMENT', 97),
(35, '4. rata', 4, 0.00, 400.00, 'INSTALLMENT', 97),
(36, 'Upisnina', 0, 300.00, 300.00, 'ENROLLMENT', 102),
(37, '1. rata', 1, 400.00, 400.00, 'INSTALLMENT', 102),
(38, '2. rata', 2, 0.00, 400.00, 'INSTALLMENT', 102),
(39, '3. rata', 3, 0.00, 400.00, 'INSTALLMENT', 102),
(40, '4. rata', 4, 0.00, 400.00, 'INSTALLMENT', 102),
(41, 'Upisnina', 0, 300.00, 300.00, 'ENROLLMENT', 103),
(42, '1. rata', 1, 0.00, 400.00, 'INSTALLMENT', 103),
(43, '2. rata', 2, 0.00, 400.00, 'INSTALLMENT', 103),
(44, '3. rata', 3, 0.00, 400.00, 'INSTALLMENT', 103),
(45, '4. rata', 4, 0.00, 400.00, 'INSTALLMENT', 103),
(46, 'Upisnina', 0, 300.00, 300.00, 'ENROLLMENT', 104),
(47, '1. rata', 1, 400.00, 400.00, 'INSTALLMENT', 104),
(48, '2. rata', 2, 400.00, 400.00, 'INSTALLMENT', 104),
(49, '3. rata', 3, 0.00, 400.00, 'INSTALLMENT', 104),
(50, '4. rata', 4, 0.00, 400.00, 'INSTALLMENT', 104),
(51, 'Upisnina', 0, 300.00, 300.00, 'ENROLLMENT', 105),
(52, '1. rata', 1, 100.00, 400.00, 'INSTALLMENT', 105),
(53, '2. rata', 2, 0.00, 400.00, 'INSTALLMENT', 105),
(54, '3. rata', 3, 0.00, 400.00, 'INSTALLMENT', 105),
(55, '4. rata', 4, 0.00, 400.00, 'INSTALLMENT', 105),
(56, 'Upisnina', 0, 300.00, 300.00, 'ENROLLMENT', 106),
(57, '1. rata', 1, 0.00, 400.00, 'INSTALLMENT', 106),
(58, '2. rata', 2, 0.00, 400.00, 'INSTALLMENT', 106),
(59, '3. rata', 3, 0.00, 400.00, 'INSTALLMENT', 106),
(60, '4. rata', 4, 0.00, 400.00, 'INSTALLMENT', 106),
(61, 'Upisnina', 0, 300.00, 300.00, 'ENROLLMENT', 107),
(62, '1. rata', 1, 0.00, 400.00, 'INSTALLMENT', 107),
(63, '2. rata', 2, 0.00, 400.00, 'INSTALLMENT', 107),
(64, '3. rata', 3, 0.00, 400.00, 'INSTALLMENT', 107),
(65, '4. rata', 4, 0.00, 400.00, 'INSTALLMENT', 107);

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `payment_id` int(11) NOT NULL,
  `amount` decimal(38,2) DEFAULT NULL,
  `date_paid` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `candidate_account_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`payment_id`, `amount`, `date_paid`, `due_date`, `status`, `candidate_account_id`) VALUES
(95, 400.00, '2026-05-08', '2026-05-06', 'PAID', 93),
(96, 500.00, '2026-06-02', '2026-06-01', 'PAID', 94),
(97, 500.00, '2026-06-05', '2026-06-06', 'PAID', 95),
(98, 300.00, '2026-06-05', '2026-06-06', 'PAID', 96),
(99, 300.00, '2026-06-06', '2026-06-06', 'PAID', 95),
(100, 300.00, '2026-06-06', '2026-06-06', 'PAID', 95),
(101, 300.00, '2026-06-06', '2026-06-06', 'PAID', 95),
(102, 300.00, '2026-06-06', '2026-06-06', 'PAID', 95),
(103, 300.00, '2026-06-06', '2026-06-06', 'PAID', 95),
(104, 200.00, '2026-06-06', '2026-06-06', 'PAID', 95),
(105, 200.00, '2026-06-06', '2026-06-06', 'PAID', 95),
(106, 300.00, '2026-06-07', '2026-06-07', 'PAID', 96),
(107, 300.00, '2026-06-07', '2026-06-07', 'PAID', 97),
(108, 300.00, '2026-06-07', '2026-06-07', 'PAID', 98),
(109, 300.00, '2026-06-07', '2026-06-07', 'PAID', 99),
(110, 1300.00, '2026-06-08', '2026-06-08', 'PAID', 96),
(111, 1600.00, '2026-06-08', '2026-06-08', 'PAID', 98),
(112, 300.00, '2026-06-08', '2026-06-08', 'PAID', 100),
(113, 300.00, '2026-06-08', '2026-06-08', 'PAID', 101),
(114, 300.00, '2026-06-08', '2026-06-08', 'PAID', 102),
(115, 400.00, '2026-06-09', '2026-06-09', 'PAID', 97),
(116, 1400.00, '2026-06-09', '2026-06-09', 'PAID', 100),
(117, 1600.00, '2026-06-09', '2026-06-09', 'PAID', 99),
(118, 200.00, '2026-06-09', '2026-06-09', 'PAID', 100),
(119, 300.00, '2026-06-09', '2026-06-09', 'PAID', 103),
(120, 300.00, '2026-06-10', '2026-06-10', 'PAID', 104),
(121, 400.00, '2026-06-10', '2026-06-10', 'PAID', 104),
(122, 400.00, '2026-06-10', '2026-06-10', 'PAID', 105),
(123, 300.00, '2026-06-10', '2026-06-10', 'PAID', 106),
(124, 300.00, '2026-06-13', '2026-06-13', 'PAID', 107),
(125, 400.00, '2026-06-13', '2026-06-13', 'PAID', 104),
(126, 400.00, '2026-06-13', '2026-06-13', 'PAID', 102);

-- --------------------------------------------------------

--
-- Table structure for table `processed_events`
--

CREATE TABLE `processed_events` (
  `saga_id` varchar(255) NOT NULL,
  `processed_at` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `processed_events`
--

INSERT INTO `processed_events` (`saga_id`, `processed_at`) VALUES
('344b311f-5de1-4881-a5d5-3812f9ed34b7', '2026-05-29 07:00:31.000000');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `date_created` datetime(6) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `date_created`, `email`, `first_name`, `last_name`, `password_hash`, `role`, `status`) VALUES
(93, '2026-06-06 14:17:28.000000', 'marko@email.com', 'Marko', 'Marković', '123456', 'Kandidat', 'ACTIVE'),
(94, '2026-06-06 14:17:28.000000', 'dneskovic1@etf.unsa.ba', 'Dina', 'Nešković', '123456', 'Kandidat', 'ACTIVE');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `candidate_accounts`
--
ALTER TABLE `candidate_accounts`
  ADD PRIMARY KEY (`candidate_id`),
  ADD UNIQUE KEY `UKpsur7mxks23gmcuu96s6kgf4u` (`user_id`);

--
-- Indexes for table `obligations`
--
ALTER TABLE `obligations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKaxax7k2qhd4745l4qbij29b7t` (`account_id`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `FKs32i5qqrqih2nd0iuwjr8m36c` (`candidate_account_id`);

--
-- Indexes for table `processed_events`
--
ALTER TABLE `processed_events`
  ADD PRIMARY KEY (`saga_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `candidate_accounts`
--
ALTER TABLE `candidate_accounts`
  MODIFY `candidate_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=108;

--
-- AUTO_INCREMENT for table `obligations`
--
ALTER TABLE `obligations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=127;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `candidate_accounts`
--
ALTER TABLE `candidate_accounts`
  ADD CONSTRAINT `FKguhswfu7w0egeprdassqo7kr3` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `obligations`
--
ALTER TABLE `obligations`
  ADD CONSTRAINT `FKaxax7k2qhd4745l4qbij29b7t` FOREIGN KEY (`account_id`) REFERENCES `candidate_accounts` (`candidate_id`);

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `FKs32i5qqrqih2nd0iuwjr8m36c` FOREIGN KEY (`candidate_account_id`) REFERENCES `candidate_accounts` (`candidate_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
