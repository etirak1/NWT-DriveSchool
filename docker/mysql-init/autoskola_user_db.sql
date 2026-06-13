-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 13, 2026 at 05:36 PM
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
-- Database: `autoskola_user_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `announcement_id` bigint(20) NOT NULL,
  `content` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) DEFAULT NULL,
  `date_created` datetime(6) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `target_user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`announcement_id`, `content`, `created_by`, `date_created`, `title`, `expiration_date`, `target_user_id`) VALUES
(1, 'Novi termini za teoretski ispit su objavljeni.', 1, '2026-06-06 13:49:39.000000', 'Novi termini', NULL, NULL),
(2, 'Auto-škola ne radi za nadolazeće praznike.', 1, '2026-06-06 13:49:39.000000', 'Praznici', NULL, NULL),
(3, 'Novi korisnik Kandidat je dodat u sistem.', 17, '2026-06-09 13:01:08.000000', 'Dobrodošlica', NULL, NULL),
(4, 'Dana 10.06.2026. auto-škola neće raditi', 1, '2026-06-10 01:24:55.000000', 'Neradni dan', '2026-06-11', NULL),
(5, 'Novi korisnik Kandidat je dodat u sistem.', 18, '2026-06-10 22:32:18.000000', 'Dobrodošlica', NULL, NULL),
(6, 'Novi korisnik Kandidat je dodat u sistem.', 19, '2026-06-10 22:41:09.000000', 'Dobrodošlica', NULL, NULL),
(7, 'Dobrodošli, k! Vaš nalog je uspješno kreiran. Možete pratiti napredak obuke, finansije i obavještenja putem ove platforme.', 21, '2026-06-13 00:22:20.000000', 'Dobrodošlica', NULL, 21);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint(20) NOT NULL,
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
(1, '2026-06-06 13:49:38.000000', 'etirak1@etf.unsa.ba', 'Elma', 'Tirak', '$2a$10$jsmCFDGQF3X414VS/u5s1.hfov4cH50uLZ2wYnWljHYMD6wITD37O', 'ADMIN', 'ACTIVE'),
(2, '2026-06-06 13:49:38.000000', 'enekic1@etf.unsa.ba', 'Elma', 'Nekić', '$2a$10$Rp/mqGYL85C7eqWQjm7GxOYQtAOD0R5Dq05mH.Z/pEeRms96slR52', 'ADMIN', 'ACTIVE'),
(3, '2026-06-06 13:49:38.000000', 'aalihodzic6@etf.unsa.ba', 'Adna', 'Alihodžić', '$2a$10$0embgYNz7Z7dbRhMMtNpYuTYWAEd.4l2/Fp2UfDDUViF9GBqjEKMS', 'ADMIN', 'ACTIVE'),
(4, '2026-06-06 13:49:38.000000', 'dpeskovic1@etf.unsa.ba', 'Dinela', 'Pešković', '$2a$10$6t3mxK7NUk1SE/jnuX5OUuGX10nUQ8TQsyEAiXxiu70yarqxQ2oy6', 'ADMIN', 'ACTIVE'),
(5, '2026-06-06 13:49:38.000000', 'eomerovic1@etf.unsa.ba', 'Emina', 'Omerović', '$2a$10$r5KOgkhv.uSdWo38Ao0xfuN9r9igDb4amZa6peBAUgKRX6.1RqSHC', 'CANDIDATE', 'ACTIVE'),
(6, '2026-06-06 13:49:39.000000', 'tljubovic1@etf.unsa.ba', 'Tajra', 'Ljubović', '$2a$10$Rz0mJoJ8GcBXg4bj8G5OUer7R8OBfC.OR1GLZkj3JiFNKkdQjeGRa', 'INSTRUCTOR', 'ACTIVE'),
(7, '2026-06-06 13:49:39.000000', 'etorlak1@etf.unsa.ba', 'Emina', 'Torlak', '$2a$10$3oXFPPaG8C3z9Nt4sYvK2.unHt3N/5MowUFC5a66C24m9Ags29UUW', 'CANDIDATE', 'ACTIVE'),
(8, '2026-06-06 13:49:39.000000', 'bkomar1@etf.unsa.ba', 'Berina', 'Komar', '$2a$10$Wpz56U3aeB7TfRE6V5uqzOetUrRrVQM8BGOxOVTopMszOD0/tGx52', 'INSTRUCTOR', 'ACTIVE'),
(9, '2026-06-06 13:49:39.000000', 'akrnic1@etf.unsa.ba', 'Amna', 'Krnić', '$2a$10$vqrK8Sr/dVCCBdcqfadydubGjCM/dWWAT1C7IzpU9yQYF4iDASWFe', 'CANDIDATE', 'ACTIVE'),
(10, '2026-06-06 15:52:47.000000', 'eadilovic1@etf.unsa.ba', 'Emil', 'Adilović', '$2a$10$5bmYjZiwXvpAPjqMCjZjGehQNa61LrhCIDX64nXe008ZPitGU1EIG', 'CANDIDATE', 'ACTIVE'),
(11, '2026-06-06 15:53:17.000000', 'aalihodzic1@etf.unsa.ba', 'Amila', 'Alihodžić', '$2a$10$prs0CKPKgfKNUC7CB4qqRe0R3kdQ1dLt1Wh8UucyFY11xzI65oiWO', 'CANDIDATE', 'ACTIVE'),
(12, '2026-06-06 15:53:38.000000', 'ebeganovic1@etf.unsa.ba', 'Enes', 'Beganović', '$2a$10$ovGvpc4BaWe9Toc1IjMph..bh3mOhRhO/E4QLXm1fZQZ1NL.wloeC', 'CANDIDATE', 'ACTIVE'),
(13, '2026-06-06 15:54:07.000000', 'eturkusic1@etf.unsa.ba', 'Esmir ', 'Turkušić', '$2a$10$s1ybCBo0bhJ7W1QL9vQiaukmqA.JpgVEyYf0oWe2SAIPtxgor8Y.y', 'CANDIDATE', 'ACTIVE'),
(14, '2026-06-06 16:31:16.000000', 'sselimovic1@etf.unsa.ba', 'Said', 'Selimović', '$2a$10$Q9NEII4lKySdtqKpSInqPuVJibWbAbHuafDas/9kurmiHXYxg8zY.', 'INSTRUCTOR', 'ACTIVE'),
(15, '2026-06-07 19:23:37.000000', 'bberovic1@etf.unsa.ba', 'Berina', 'Berović', '$2a$10$p218I1/Aln/aWBcb3oAa9.KpVCrCPoxgtLLQ23MFMePVxZvFkebxy', 'INSTRUCTOR', 'ACTIVE'),
(16, '2026-06-07 23:06:05.000000', 'atorlak1@etf.unsa.ba', 'Alen', 'Torlak', '$2a$10$fN83l7x3jBIq25aYs2ggb.vPnZGMt/YDWiVUK7.YgUyVocfZuBwDO', 'CANDIDATE', 'ACTIVE'),
(17, '2026-06-09 13:01:08.000000', 'k1@test.com', 'Kandidat', '1', '$2a$10$gUJnYxXq2cPnD/gmVcVFpuUqMGTzsDAQC0MbZIQevELR3TRwWeIQu', 'CANDIDATE', 'ACTIVE'),
(18, '2026-06-10 22:32:18.000000', 'k2@test.com', 'Kandidat', '2', '$2a$10$x82Mie2D3XB.M5NNEWwEou7LLSTi1YygyYInRD6NcrtlH6Qpe84Jy', 'CANDIDATE', 'ACTIVE'),
(19, '2026-06-10 22:41:09.000000', 'k3@etf.unsa.ba', 'Kandidat', '3', '$2a$10$M76QoGBX.G63oDk98CFKiOowz/msdUqagZCctO.SyUy7PWRSfXVEK', 'CANDIDATE', 'ACTIVE'),
(20, '2026-06-10 23:27:11.000000', 'k4@test.com', 'Kandidat', '4', '$2a$10$2taFJUzZZUwyQKi0s5n.m.fBmUr.xnJtNdtdEfnrFaNkJegK8I5e.', 'CANDIDATE', 'ACTIVE'),
(21, '2026-06-13 00:22:20.000000', 'k5@test.com', 'k', '5', '$2a$10$qZZEWDKP.6uzOWq0kXerOOh9gz7ffuDdaTk8e98PEt1.eKtFX8Dw6', 'CANDIDATE', 'ACTIVE');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`announcement_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `announcement_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
