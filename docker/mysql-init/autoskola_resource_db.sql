USE autoskola_resource_db;

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
-- Database: `autoskola_resource_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `instructors`
--

CREATE TABLE `instructors` (
  `instructor_id` bigint(20) NOT NULL,
  `availability_note` varchar(255) DEFAULT NULL,
  `date_created` datetime(6) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `assigned_vehicle_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `instructors`
--

INSERT INTO `instructors` (`instructor_id`, `availability_note`, `date_created`, `user_id`, `assigned_vehicle_id`) VALUES
(78, 'AVAILABLE', '2026-06-07 18:50:54.000000', 6, 117),
(79, 'AVAILABLE', '2026-06-07 19:23:38.000000', 15, NULL),
(80, 'UNAVAILABLE', '2026-06-07 20:06:21.000000', 8, NULL),
(81, 'UNAVAILABLE', '2026-06-07 20:06:21.000000', 14, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `repairs`
--

CREATE TABLE `repairs` (
  `repair_id` bigint(20) NOT NULL,
  `cost` double DEFAULT NULL,
  `date_created` datetime(6) DEFAULT NULL,
  `description` varchar(500) NOT NULL,
  `repair_date` datetime(6) DEFAULT NULL,
  `vehicle_id` bigint(20) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `repairs`
--

INSERT INTO `repairs` (`repair_id`, `cost`, `date_created`, `description`, `repair_date`, `vehicle_id`, `status`) VALUES
(118, 500, '2026-06-09 10:40:42.000000', 'Veliki servis', '2026-06-09 00:00:00.000000', 117, 'COMPLETED');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint(20) NOT NULL,
  `date_created` datetime(6) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `date_created`, `email`, `first_name`, `last_name`, `password_hash`, `role`, `status`) VALUES
(1, '2026-06-07 18:50:53.000000', 'etirak1@etf.unsa.ba', 'Elma', 'Tirak', '$2a$10$1irO0/nRyZaVn5C7lG5gDuT3p83mF9cEpoyn8fbgdZRhGRymVTzf6', 'ADMIN', 'ACTIVE'),
(2, '2026-06-07 18:50:53.000000', 'enekic1@etf.unsa.ba', 'Elma', 'Nekić', '$2a$10$9tDhaeA5ABQMJBNJ3ixY8eneGWPtUtTk4NAjOFwdmuTDBVuUzyFQ.', 'ADMIN', 'ACTIVE'),
(3, '2026-06-07 18:50:53.000000', 'aalihodzic6@etf.unsa.ba', 'Adna', 'Alihodžić', '$2a$10$7qG01s2LIMqFw5b4SHmdm.cBVGHV/6UtfWWEAhqhSntkm3DsT8zP.', 'ADMIN', 'ACTIVE'),
(4, '2026-06-07 18:50:54.000000', 'dpeskovic1@etf.unsa.ba', 'Dinela', 'Pešković', '$2a$10$6LgUVnJhie2wSzqwnrXElO0Lk2fsACYWaByfo/b0flz/AEx3HvvEy', 'ADMIN', 'ACTIVE'),
(5, '2026-06-07 18:50:54.000000', 'eomerovic1@etf.unsa.ba', 'Emina', 'Omerović', '$2a$10$Ir/id4IBQ23990MTFBejn.GOrkeUzgsq7KPRxn6s7egu36WOa8BiW', 'CANDIDATE', 'ACTIVE'),
(6, '2026-06-07 18:50:54.000000', 'tljubovic1@etf.unsa.ba', 'Tajra', 'Ljubović', '$2a$10$.tom.q83uO/vDZL.VuaflebfP.fTKYEEKhHeRYzkG4FZewpzZ/Nx6', 'INSTRUCTOR', 'ACTIVE'),
(7, '2026-06-13 00:26:38.000000', 'etorlak1@etf.unsa.ba', 'Emina', 'Torlak', 'N/A_PLACEHOLDER', 'CANDIDATE', 'ACTIVE'),
(8, '2026-06-07 20:06:21.000000', 'bkomar1@etf.unsa.ba', 'Berina', 'Komar', 'N/A_PLACEHOLDER', 'INSTRUCTOR', 'ACTIVE'),
(9, '2026-06-13 00:26:38.000000', 'akrnic1@etf.unsa.ba', 'Amna', 'Krnić', 'N/A_PLACEHOLDER', 'CANDIDATE', 'ACTIVE'),
(10, '2026-06-13 00:17:41.000000', 'eadilovic1@etf.unsa.ba', 'Emil', 'Adilović', 'N/A_PLACEHOLDER', 'CANDIDATE', 'ACTIVE'),
(11, '2026-06-13 00:26:38.000000', 'aalihodzic1@etf.unsa.ba', 'Amila', 'Alihodžić', 'N/A_PLACEHOLDER', 'CANDIDATE', 'ACTIVE'),
(12, '2026-06-13 00:17:42.000000', 'ebeganovic1@etf.unsa.ba', 'Enes', 'Beganović', 'N/A_PLACEHOLDER', 'CANDIDATE', 'ACTIVE'),
(13, '2026-06-13 00:26:38.000000', 'eturkusic1@etf.unsa.ba', 'Esmir ', 'Turkušić', 'N/A_PLACEHOLDER', 'CANDIDATE', 'ACTIVE'),
(14, '2026-06-07 20:06:23.000000', 'sselimovic1@etf.unsa.ba', 'Said', 'Selimović', 'N/A_PLACEHOLDER', 'INSTRUCTOR', 'ACTIVE'),
(15, '2026-06-07 20:06:23.000000', 'bberovic1@etf.unsa.ba', 'Berina', 'Berović', 'N/A_PLACEHOLDER', 'INSTRUCTOR', 'ACTIVE'),
(16, '2026-06-13 00:17:42.000000', 'atorlak1@etf.unsa.ba', 'Alen', 'Torlak', 'N/A_PLACEHOLDER', 'CANDIDATE', 'ACTIVE');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `vehicle_id` bigint(20) NOT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `date_created` datetime(6) DEFAULT NULL,
  `last_technical_inspection` datetime(6) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `registration_date` datetime(6) DEFAULT NULL,
  `registration_number` varchar(15) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `registration_expiry` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`vehicle_id`, `brand`, `date_created`, `last_technical_inspection`, `model`, `registration_date`, `registration_number`, `status`, `registration_expiry`) VALUES
(117, 'Toyota', '2026-06-07 18:50:54.000000', '2026-03-07 18:50:54.000000', 'Corolla', '2025-06-07 18:50:54.000000', 'E123-ABC', 'ACTIVE', '2026-06-07 18:50:54.000000'),
(119, 'Volkswagen', '2026-06-09 10:28:18.000000', '2026-06-09 00:00:00.000000', 'Golf', '2026-06-09 00:00:00.000000', 'ABC-C-CCC', 'ACTIVE', '2027-06-09 00:00:00.000000');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `instructors`
--
ALTER TABLE `instructors`
  ADD PRIMARY KEY (`instructor_id`);

--
-- Indexes for table `repairs`
--
ALTER TABLE `repairs`
  ADD PRIMARY KEY (`repair_id`),
  ADD KEY `FKr8rwhlbv43kxbn4j93hkul7ax` (`vehicle_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`vehicle_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `instructors`
--
ALTER TABLE `instructors`
  MODIFY `instructor_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `repairs`
--
ALTER TABLE `repairs`
  MODIFY `repair_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `vehicle_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=120;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `repairs`
--
ALTER TABLE `repairs`
  ADD CONSTRAINT `FKr8rwhlbv43kxbn4j93hkul7ax` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
