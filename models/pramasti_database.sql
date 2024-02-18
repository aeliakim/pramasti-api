-- MySQL dump 10.13  Distrib 8.0.35, for Win64 (x86_64)
--
-- Host: localhost    Database: pramasti
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `asistenjadwal`
--

DROP TABLE IF EXISTS `asistenjadwal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistenjadwal` (
  `user_id` int NOT NULL,
  `jadwal_id` int NOT NULL,
  `praktikum_id` int DEFAULT NULL,
  PRIMARY KEY (`jadwal_id`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `praktikum_id` (`praktikum_id`),
  CONSTRAINT `asistenJadwal_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `asistenJadwal_ibfk_2` FOREIGN KEY (`jadwal_id`) REFERENCES `jadwalpraktikum` (`jadwal_id`) ON DELETE CASCADE,
  CONSTRAINT `asistenJadwal_ibfk_3` FOREIGN KEY (`praktikum_id`) REFERENCES `praktikum` (`praktikum_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jadwalpraktikum`
--

DROP TABLE IF EXISTS `jadwalpraktikum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jadwalpraktikum` (
  `jadwal_id` int NOT NULL AUTO_INCREMENT,
  `id_modul` varchar(255) NOT NULL,
  `id_modul_jadwal` varchar(255) DEFAULT NULL,
  `praktikum_id` int NOT NULL,
  `start_tgl` date DEFAULT NULL,
  `start_wkt` time DEFAULT NULL,
  `finish_tgl` date DEFAULT NULL,
  `finish_wkt` time DEFAULT NULL,
  `kuota` int DEFAULT NULL,
  PRIMARY KEY (`jadwal_id`),
  KEY `praktikum_id` (`praktikum_id`),
  KEY `fk_modul` (`id_modul`),
  CONSTRAINT `fk_modul` FOREIGN KEY (`id_modul`) REFERENCES `modul` (`id_modul`) ON DELETE CASCADE,
  CONSTRAINT `jadwalPraktikum_ibfk_1` FOREIGN KEY (`praktikum_id`) REFERENCES `praktikum` (`praktikum_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `kelompok`
--

DROP TABLE IF EXISTS `kelompok`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kelompok` (
  `kelompok_id` int NOT NULL AUTO_INCREMENT,
  `kapasitas` int NOT NULL,
  `nama_kelompok` varchar(255) DEFAULT NULL,
  `jadwal_id` int NOT NULL,
  PRIMARY KEY (`kelompok_id`),
  KEY `jadwal_id` (`jadwal_id`),
  CONSTRAINT `kelompok_ibfk_1` FOREIGN KEY (`jadwal_id`) REFERENCES `jadwalpraktikum` (`jadwal_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `log`
--

DROP TABLE IF EXISTS `log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log` (
  `user` varchar(255) NOT NULL,
  `change_date` date NOT NULL,
  `changed_column` varchar(255) DEFAULT NULL,
  `change_type` enum('new','revision','delete') NOT NULL,
  `status_before` varchar(255) DEFAULT NULL,
  `status_after` varchar(255) DEFAULT NULL,
  `date_now` date NOT NULL,
  PRIMARY KEY (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mhspilihpraktikum`
--

DROP TABLE IF EXISTS `mhspilihpraktikum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mhspilihpraktikum` (
  `user_id` int NOT NULL,
  `praktikum_id` int NOT NULL,
  `jadwal_id` int NOT NULL,
  `kelompok_id` int DEFAULT NULL,
  `semester` varchar(10) NOT NULL,
  `tahun_akademik` varchar(9) NOT NULL,
  PRIMARY KEY (`user_id`,`praktikum_id`,`jadwal_id`),
  KEY `praktikum_id` (`praktikum_id`),
  KEY `jadwal_id` (`jadwal_id`),
  KEY `kelompok_id` (`kelompok_id`),
  CONSTRAINT `mhsPilihPraktikum_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `mhsPilihPraktikum_ibfk_2` FOREIGN KEY (`praktikum_id`) REFERENCES `praktikum` (`praktikum_id`) ON DELETE CASCADE,
  CONSTRAINT `mhsPilihPraktikum_ibfk_3` FOREIGN KEY (`jadwal_id`) REFERENCES `jadwalpraktikum` (`jadwal_id`) ON DELETE CASCADE,
  CONSTRAINT `mhsPilihPraktikum_ibfk_4` FOREIGN KEY (`kelompok_id`) REFERENCES `kelompok` (`kelompok_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `modul`
--

DROP TABLE IF EXISTS `modul`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modul` (
  `id_modul` varchar(255) NOT NULL,
  `judul_modul` varchar(255) NOT NULL,
  `praktikum_id` int NOT NULL,
  PRIMARY KEY (`id_modul`),
  KEY `praktikum_id` (`praktikum_id`),
  CONSTRAINT `modul_ibfk_1` FOREIGN KEY (`praktikum_id`) REFERENCES `praktikum` (`praktikum_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `nilai`
--

DROP TABLE IF EXISTS `nilai`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nilai` (
  `user_id` int NOT NULL,
  `praktikum_id` int NOT NULL,
  `nilai_modul` int DEFAULT NULL,
  `id_modul` varchar(255) NOT NULL,
  PRIMARY KEY (`user_id`,`praktikum_id`,`id_modul`),
  KEY `praktikum_id` (`praktikum_id`),
  KEY `fk_nilai_modul` (`id_modul`),
  CONSTRAINT `fk_nilai_modul` FOREIGN KEY (`id_modul`) REFERENCES `modul` (`id_modul`) ON DELETE CASCADE,
  CONSTRAINT `nilai_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `nilai_ibfk_2` FOREIGN KEY (`praktikum_id`) REFERENCES `praktikum` (`praktikum_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `nilai_akhir`
--

DROP TABLE IF EXISTS `nilai_akhir`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nilai_akhir` (
  `user_id` int NOT NULL,
  `praktikum_id` int NOT NULL,
  `nilai_akhir` int DEFAULT NULL,
  PRIMARY KEY (`user_id`,`praktikum_id`),
  KEY `praktikum_id` (`praktikum_id`),
  CONSTRAINT `nilai_akhir_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `nilai_akhir_ibfk_2` FOREIGN KEY (`praktikum_id`) REFERENCES `praktikum` (`praktikum_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pengumuman`
--

DROP TABLE IF EXISTS `pengumuman`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pengumuman` (
  `pengumuman_id` int NOT NULL AUTO_INCREMENT,
  `judul` varchar(255) NOT NULL,
  `deskripsi` text NOT NULL,
  PRIMARY KEY (`pengumuman_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `praktikum`
--

DROP TABLE IF EXISTS `praktikum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `praktikum` (
  `praktikum_id` int NOT NULL AUTO_INCREMENT,
  `praktikum_name` varchar(255) NOT NULL,
  `deskripsi` text,
  `logo_praktikum` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`praktikum_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(100) NOT NULL,
  `user_id` int NOT NULL,
  `praktikum_id` int DEFAULT NULL,
  PRIMARY KEY (`role_id`),
  KEY `user_id` (`user_id`),
  KEY `praktikum_id` (`praktikum_id`),
  CONSTRAINT `roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `roles_ibfk_2` FOREIGN KEY (`praktikum_id`) REFERENCES `praktikum` (`praktikum_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tokens`
--

DROP TABLE IF EXISTS `tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens` (
  `id_token` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` text NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_token`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=880 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `nrp` varchar(30) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `nohp` varchar(20) DEFAULT NULL,
  `departemen` varchar(255) DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `profil_picture` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `nrp` (`nrp`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-02-19  1:07:39
