-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: ims_db
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `ipr_details`
--

DROP TABLE IF EXISTS `ipr_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ipr_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `design_filed` bit(1) DEFAULT NULL,
  `design_granted` bit(1) DEFAULT NULL,
  `design_granted_number` varchar(255) DEFAULT NULL,
  `design_number` varchar(255) DEFAULT NULL,
  `patent_filed` bit(1) DEFAULT NULL,
  `patent_granted` bit(1) DEFAULT NULL,
  `patent_granted_number` varchar(255) DEFAULT NULL,
  `patent_number` varchar(255) DEFAULT NULL,
  `trademark_filed` bit(1) DEFAULT NULL,
  `trademark_granted` bit(1) DEFAULT NULL,
  `trademark_granted_number` varchar(255) DEFAULT NULL,
  `trademark_number` varchar(255) DEFAULT NULL,
  `item_id` bigint DEFAULT NULL,
  `copyright_filed` bit(1) DEFAULT NULL,
  `copyright_filing_date` date DEFAULT NULL,
  `copyright_filing_no` varchar(100) DEFAULT NULL,
  `copyright_grant_date` date DEFAULT NULL,
  `copyright_grant_no` varchar(100) DEFAULT NULL,
  `copyright_granted` bit(1) DEFAULT NULL,
  `copyright_inventor` varchar(200) DEFAULT NULL,
  `design_filing_date` date DEFAULT NULL,
  `design_filing_no` varchar(100) DEFAULT NULL,
  `design_grant_date` date DEFAULT NULL,
  `design_grant_no` varchar(100) DEFAULT NULL,
  `design_inventor` varchar(200) DEFAULT NULL,
  `patent_filing_date` date DEFAULT NULL,
  `patent_filing_no` varchar(100) DEFAULT NULL,
  `patent_grant_date` date DEFAULT NULL,
  `patent_grant_no` varchar(100) DEFAULT NULL,
  `patent_inventor` varchar(200) DEFAULT NULL,
  `trademark_filing_date` date DEFAULT NULL,
  `trademark_filing_no` varchar(100) DEFAULT NULL,
  `trademark_grant_date` date DEFAULT NULL,
  `trademark_grant_no` varchar(100) DEFAULT NULL,
  `trademark_inventor` varchar(200) DEFAULT NULL,
  `variant_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6216v5rc6tyk03g0n5hrwniu4` (`item_id`),
  UNIQUE KEY `UK_bqupkn3uyqk6p02ginrvd3irg` (`variant_id`),
  CONSTRAINT `FKmvar01j8q8gna8hg25cs5ad47` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  CONSTRAINT `FKt5denr63vqab51l3rl22me0ig` FOREIGN KEY (`variant_id`) REFERENCES `item_variants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ipr_details`
--

LOCK TABLES `ipr_details` WRITE;
/*!40000 ALTER TABLE `ipr_details` DISABLE KEYS */;
INSERT INTO `ipr_details` VALUES (1,_binary '',_binary '\0','','456546',_binary '',_binary '','456456456','56rt646',_binary '',_binary '\0','456456','456546',14,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,_binary '\0',_binary '\0','','',_binary '',_binary '','3453543535','sdfsdfsdf345345',_binary '\0',_binary '\0','','',16,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,_binary '',_binary '','D-ECWCS-001G','D-ECWCS-001',_binary '',_binary '\0','','IN2025ECWCS001',_binary '',_binary '\0','','TM-ECWCS-2025',18,_binary '\0',NULL,'',NULL,'',_binary '\0','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL),(7,_binary '',_binary '\0','','25466',_binary '',_binary '','1223434','123213',_binary '',_binary '\0','','234324',20,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,_binary '\0',_binary '\0','','',_binary '',_binary '','sdfsdf','sfsdf',_binary '',_binary '\0','','sfsdf',NULL,_binary '\0',NULL,'',NULL,'',_binary '\0','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL,'',NULL,'','',13),(9,_binary '\0',_binary '\0','','',_binary '',_binary '\0','','',_binary '\0',_binary '\0','','',13,_binary '\0',NULL,'',NULL,'',_binary '\0','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL),(10,_binary '\0',_binary '\0','','',_binary '',_binary '\0','','234234',_binary '',_binary '\0','','234324',22,_binary '\0',NULL,'',NULL,'',_binary '\0','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL),(11,_binary '\0',_binary '\0','','',_binary '',_binary '','234234','awr234324',_binary '',_binary '\0','','234234234',23,_binary '\0',NULL,'',NULL,'',_binary '\0','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL),(12,_binary '\0',_binary '\0','','',_binary '',_binary '','3453534','453534',_binary '\0',_binary '\0','','',24,_binary '\0',NULL,'',NULL,'',_binary '\0','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL),(13,_binary '\0',_binary '\0','','',_binary '',_binary '\0','sdfsdfsdf','sdfdsf',_binary '\0',_binary '\0','','',NULL,_binary '\0',NULL,'',NULL,'',_binary '\0','',NULL,'',NULL,'','','2025-05-13','23443',NULL,'','',NULL,'',NULL,'','',6),(14,_binary '\0',_binary '\0','','',_binary '',_binary '','dfgdg','dgdfg',_binary '\0',_binary '\0','','',NULL,_binary '\0',NULL,'',NULL,'',_binary '\0','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL,'',NULL,'','',12),(15,_binary '\0',_binary '\0','','',_binary '',_binary '','','',_binary '\0',_binary '\0','','',NULL,_binary '\0',NULL,'',NULL,'',_binary '\0','',NULL,'',NULL,'','','2026-07-31','54574',NULL,'','',NULL,'',NULL,'','',8),(16,_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',NULL,NULL,NULL,_binary '\0',NULL,'',NULL,'',_binary '\0','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL,'',NULL,'','',7),(17,_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',NULL,NULL,NULL,_binary '\0',NULL,'',NULL,'',_binary '\0','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL,'',NULL,'','',9),(18,_binary '\0',_binary '\0',NULL,NULL,_binary '',_binary '',NULL,NULL,_binary '\0',_binary '\0',NULL,NULL,28,_binary '\0',NULL,'',NULL,'',_binary '\0','',NULL,'',NULL,'','','2026-08-12','34545','2026-08-14','23542','Dr Jp Sharma',NULL,'',NULL,'','',NULL),(19,_binary '\0',_binary '\0',NULL,NULL,_binary '',_binary '',NULL,NULL,_binary '\0',_binary '\0',NULL,NULL,29,_binary '\0',NULL,'',NULL,'',_binary '\0','',NULL,'',NULL,'','','2026-08-18','123123','2026-08-26','123213','Dr RP Singh',NULL,'',NULL,'','',NULL),(20,_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',NULL,NULL,26,_binary '\0',NULL,'',NULL,'',_binary '\0','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL),(21,_binary '\0',_binary '\0',NULL,NULL,_binary '',_binary '',NULL,NULL,_binary '\0',_binary '\0',NULL,NULL,30,_binary '\0',NULL,'',NULL,'',_binary '\0','',NULL,'',NULL,'','','2026-08-13','2344','2026-08-12','234','Gagan',NULL,'',NULL,'','',NULL),(22,_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',NULL,NULL,25,_binary '\0',NULL,'',NULL,'',_binary '\0','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL),(23,_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',NULL,NULL,27,_binary '\0',NULL,'',NULL,'',_binary '\0','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL),(24,_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',NULL,NULL,NULL,_binary '\0',NULL,'',NULL,'',_binary '\0','',NULL,'',NULL,'','',NULL,'',NULL,'','',NULL,'',NULL,'','',11);
/*!40000 ALTER TABLE `ipr_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_documentation`
--

DROP TABLE IF EXISTS `item_documentation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_documentation` (
  `item_id` bigint NOT NULL,
  `doc_name` varchar(200) DEFAULT NULL,
  KEY `FK1svdev7ox6r5q45j9nikga65n` (`item_id`),
  CONSTRAINT `FK1svdev7ox6r5q45j9nikga65n` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_documentation`
--

LOCK TABLES `item_documentation` WRITE;
/*!40000 ALTER TABLE `item_documentation` DISABLE KEYS */;
INSERT INTO `item_documentation` VALUES (20,'Technology Transfer Document'),(20,'ATP / QTP / QAP'),(20,'Trial Directive'),(14,'ATP / QTP / QAP'),(14,'Trial Directive'),(14,'Technology Transfer Document'),(16,'Trial Directive'),(16,'ATP / QTP / QAP'),(30,'Technical Specification / QR'),(26,'Technical Specification / QR'),(26,'ATP / QTP / QAP'),(24,'Trial Directive'),(24,'Design Document'),(25,'Technical Specification / QR'),(25,'Trial Directive'),(29,'Technical Specification / QR'),(21,'ATP / QTP / QAP'),(21,'Technology Transfer Document'),(27,'Design Document'),(23,'Technical Specification / QR'),(23,'ATP / QTP / QAP'),(13,'Technical Specification / QR'),(13,'ATP / QTP / QAP'),(13,'Trial Directive'),(22,'Technical Specification / QR'),(22,'ATP / QTP / QAP'),(22,'Trial Directive'),(18,'Trial Directive'),(18,'Technology Transfer Document'),(28,'ATP / QTP / QAP');
/*!40000 ALTER TABLE `item_documentation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_documents`
--

DROP TABLE IF EXISTS `item_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_documents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `doc_name` varchar(200) DEFAULT NULL,
  `original_file_name` varchar(300) DEFAULT NULL,
  `stored_file_name` varchar(300) DEFAULT NULL,
  `uploaded_at` datetime(6) DEFAULT NULL,
  `item_id` bigint DEFAULT NULL,
  `variant_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9vun2su79vtryi1nf4lbc1s4v` (`item_id`),
  KEY `FK1hv2d6dea1w68vbqd3ot2wycq` (`variant_id`),
  CONSTRAINT `FK1hv2d6dea1w68vbqd3ot2wycq` FOREIGN KEY (`variant_id`) REFERENCES `item_variants` (`id`),
  CONSTRAINT `FK9vun2su79vtryi1nf4lbc1s4v` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_documents`
--

LOCK TABLES `item_documents` WRITE;
/*!40000 ALTER TABLE `item_documents` DISABLE KEYS */;
INSERT INTO `item_documents` VALUES (3,'Technical Specification / QR','HSI Equipments.docx','b4410e9c-a01d-47d0-bbd9-3a72a87b75be.docx','2026-07-27 10:29:49.178869',NULL,6),(4,'ATP / QTP / QAP','GEHC-SP-IDXA-PRO-P-ds-en.pdf','466ea22c-3bad-488e-98ea-f69be51c01ff.pdf','2026-08-10 08:55:28.132486',28,NULL),(5,'Technical Specification / QR','Prodigy_Advance_Spec_Sheets-US_Version.pdf','d6c95db3-7d27-472f-a738-ef942824f546.pdf','2026-08-10 09:15:34.588749',29,NULL),(6,'Technical Specification / QR','ne-health-brochures-dxa-prodigy for bone health-gehealthcare-prodigy-primo-productspec_pdf.pdf','cac5b478-185b-4841-bdf8-aaff817a2204.pdf','2026-08-10 11:45:32.543883',30,NULL);
/*!40000 ALTER TABLE `item_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_tot_documents`
--

DROP TABLE IF EXISTS `item_tot_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_tot_documents` (
  `item_id` bigint NOT NULL,
  `document_code` varchar(20) DEFAULT NULL,
  KEY `FKq56ajhrkac3r84rqd8gsuwwm4` (`item_id`),
  CONSTRAINT `FKq56ajhrkac3r84rqd8gsuwwm4` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_tot_documents`
--

LOCK TABLES `item_tot_documents` WRITE;
/*!40000 ALTER TABLE `item_tot_documents` DISABLE KEYS */;
INSERT INTO `item_tot_documents` VALUES (20,'TTD'),(20,'TNF'),(20,'TAC'),(14,'TTD'),(14,'TAC'),(30,'TTD'),(30,'TNF'),(26,'TNF'),(26,'TAC'),(24,'TTD'),(24,'TNF'),(25,'TTD'),(25,'TNF'),(29,'TTD'),(29,'TNF'),(29,'TAC'),(21,'TTD'),(21,'TAC'),(23,'TTD'),(23,'TNF'),(23,'TAC'),(22,'TTD'),(22,'TNF'),(22,'CEC'),(28,'TTD'),(28,'TNF');
/*!40000 ALTER TABLE `item_tot_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_trial_stakeholders`
--

DROP TABLE IF EXISTS `item_trial_stakeholders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_trial_stakeholders` (
  `item_id` bigint NOT NULL,
  `stakeholder` varchar(50) DEFAULT NULL,
  KEY `FKb9m6dv36dg0anx2tk9hknmxw2` (`item_id`),
  CONSTRAINT `FKb9m6dv36dg0anx2tk9hknmxw2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_trial_stakeholders`
--

LOCK TABLES `item_trial_stakeholders` WRITE;
/*!40000 ALTER TABLE `item_trial_stakeholders` DISABLE KEYS */;
INSERT INTO `item_trial_stakeholders` VALUES (14,'');
/*!40000 ALTER TABLE `item_trial_stakeholders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_variants`
--

DROP TABLE IF EXISTS `item_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_variants` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` varchar(500) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `item_id` bigint DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `development_date` date DEFAULT NULL,
  `development_status` enum('DEVELOPED','IN_PROGRESS','UNDER_DEVELOPMENT','NOT_STARTED') DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `ipr_status` enum('PATENT_FILED','GRANTED','TRADEMARK','UNDER_REVIEW','NOT_FILED') DEFAULT NULL,
  `material` varchar(200) DEFAULT NULL,
  `remarks` varchar(200) DEFAULT NULL,
  `size` varchar(50) DEFAULT NULL,
  `tot_status` enum('FILED','TO_BE_FILED') DEFAULT NULL,
  `trials_status` enum('PENDING','IN_PROGRESS','TESTING','COMPLETED','ON_HOLD') DEFAULT NULL,
  `unit_cost` double DEFAULT NULL,
  `vendor` varchar(200) DEFAULT NULL,
  `warranty` varchar(100) DEFAULT NULL,
  `weight` varchar(50) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `code` varchar(100) DEFAULT NULL,
  `crbf_count` int DEFAULT NULL,
  `filled_date` date DEFAULT NULL,
  `inventor` varchar(200) DEFAULT NULL,
  `ipr_types_label` varchar(200) DEFAULT NULL,
  `product_dev_completion_date` date DEFAULT NULL,
  `sample_request_date` date DEFAULT NULL,
  `sample_submission_date` date DEFAULT NULL,
  `ssb_count` int DEFAULT NULL,
  `tot_document_no` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKjvwpj86cp0scxwm4va1yav3i` (`item_id`),
  CONSTRAINT `FKjvwpj86cp0scxwm4va1yav3i` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_variants`
--

LOCK TABLES `item_variants` WRITE;
/*!40000 ALTER TABLE `item_variants` DISABLE KEYS */;
INSERT INTO `item_variants` VALUES (6,'New version','2.5 Layer',25,NULL,NULL,'DEVELOPED',NULL,'PATENT_FILED',NULL,NULL,NULL,'FILED','PENDING',NULL,NULL,NULL,NULL,'Protective Gear','New variant',NULL,NULL,NULL,'Patent','2026-08-01',NULL,NULL,NULL,NULL),(7,'','5 layer',25,NULL,NULL,'DEVELOPED',NULL,'NOT_FILED',NULL,NULL,NULL,'FILED',NULL,NULL,NULL,NULL,NULL,'Protective Gear','5 layer knee brace',NULL,NULL,'Gagan',NULL,NULL,NULL,NULL,NULL,NULL),(8,'tytyrty','Variant 1',27,NULL,NULL,'DEVELOPED','/uploads/0472128c-b282-4768-ba28-e91f77da1b60.png','GRANTED',NULL,NULL,NULL,'FILED','PENDING',NULL,NULL,NULL,NULL,'Gear',NULL,NULL,NULL,NULL,'Patent',NULL,NULL,NULL,NULL,NULL),(9,'Base model bag','2.5 Layer',24,NULL,NULL,'DEVELOPED','/uploads/01dd3b58-bb30-4264-88cb-5c9da0432307.png','NOT_FILED',NULL,NULL,NULL,'FILED',NULL,NULL,NULL,NULL,NULL,'Protective Gear',NULL,NULL,NULL,NULL,NULL,'2026-08-07',NULL,NULL,NULL,NULL),(10,'New featured high quality bag','5 Layer',24,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,'','2.5 Layer',29,NULL,NULL,'DEVELOPED',NULL,'NOT_FILED',NULL,NULL,NULL,'FILED',NULL,NULL,NULL,NULL,NULL,'Protective Gear',NULL,NULL,NULL,'Gagan',NULL,'2026-08-13',NULL,NULL,NULL,NULL),(12,'dgdfgdfg','2.5 Layer',26,NULL,NULL,'DEVELOPED','/uploads/0c73a57c-dd71-40b2-818a-bc10a199ee47.png','GRANTED',NULL,NULL,NULL,'FILED','PENDING',NULL,NULL,NULL,NULL,'Protective Gear',NULL,NULL,NULL,NULL,'Patent',NULL,NULL,NULL,NULL,NULL),(13,'sgsgfsghdfgdgdfg','2.5 Layer',21,NULL,NULL,'DEVELOPED','/uploads/27b33672-c5d0-484d-8c84-23b0fc49a67f.png','GRANTED',NULL,NULL,NULL,'FILED','PENDING',NULL,NULL,NULL,NULL,'Gear',NULL,NULL,NULL,NULL,'Patent, Trademark',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `item_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(100) DEFAULT NULL,
  `code` varchar(50) NOT NULL,
  `color` varchar(50) DEFAULT NULL,
  `crbf_count` int DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `development_date` date DEFAULT NULL,
  `development_status` enum('DEVELOPED','IN_PROGRESS','UNDER_DEVELOPMENT','NOT_STARTED') DEFAULT NULL,
  `expected_completion_date` date DEFAULT NULL,
  `filing_date` date DEFAULT NULL,
  `filled_date` date DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `ipr_status` enum('PATENT_FILED','GRANTED','TRADEMARK','UNDER_REVIEW','NOT_FILED') DEFAULT NULL,
  `material` varchar(200) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `patent_number` varchar(100) DEFAULT NULL,
  `priority` enum('HIGH','MEDIUM','LOW') DEFAULT NULL,
  `remarks` varchar(200) DEFAULT NULL,
  `sample_request_date` date DEFAULT NULL,
  `sample_submission_date` date DEFAULT NULL,
  `size` varchar(50) DEFAULT NULL,
  `ssb_count` int DEFAULT NULL,
  `tot_document_no` varchar(100) DEFAULT NULL,
  `tot_status` varchar(30) DEFAULT NULL,
  `trials_status` enum('PENDING','IN_PROGRESS','TESTING','COMPLETED','ON_HOLD') DEFAULT NULL,
  `unit_cost` double DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `vendor` varchar(200) DEFAULT NULL,
  `warranty` varchar(100) DEFAULT NULL,
  `weight` varchar(50) DEFAULT NULL,
  `created_by_id` bigint DEFAULT NULL,
  `ipr_types_label` varchar(200) DEFAULT NULL,
  `inventor` varchar(200) DEFAULT NULL,
  `product_dev_completion_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_item_code` (`code`),
  KEY `idx_item_category` (`category`),
  KEY `idx_item_dev_status` (`development_status`),
  KEY `idx_item_updated` (`updated_at`),
  KEY `FK4c0fngnpbp0xfjf8by9e27rcq` (`created_by_id`),
  CONSTRAINT `FK4c0fngnpbp0xfjf8by9e27rcq` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (13,'Gear','PG-KB-009',NULL,NULL,'2026-06-16 06:25:59.455988','Exoskeletons are wearable devices designed to enhance human capabilities, such as strength, endurance, and mobility',NULL,'DEVELOPED','2026-07-24',NULL,NULL,'/uploads/68af7bec-4bd6-4f71-97f4-9ee2eedf7006.png','PATENT_FILED',NULL,'Passive Exoskeleton',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','PENDING',NULL,'2026-08-12 04:36:31.702104',NULL,NULL,NULL,1,'Patent',NULL,NULL),(14,'Protective Gear','PG-BV-006',NULL,NULL,'2026-06-19 06:48:52.571881','Advanced lightweight ballistic vest providing torso protection against small arms fire and fragmentation while ensuring mobility and ergonomic comfort for operational personnel.',NULL,'DEVELOPED','2026-07-10',NULL,NULL,'/uploads/ae25520b-c3fa-4c12-afbb-0380ee0e2602.png','GRANTED',NULL,'Ballistic Vest',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','IN_PROGRESS',NULL,'2026-07-01 05:03:58.761714',NULL,NULL,NULL,1,'Patent, Trademark, Design',NULL,NULL),(16,'Apparel','sfsf',NULL,NULL,'2026-06-22 03:51:14.237522','sdfsdsdsdfsdfsdfsdfsdfsdfsdf',NULL,'IN_PROGRESS','2026-06-26',NULL,NULL,'/uploads/62cbe239-8fb8-4be9-af17-a2c949fa14bf.png','GRANTED',NULL,'Knee Brace',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','ON_HOLD',NULL,'2026-07-01 05:09:05.845076',NULL,NULL,NULL,1,'Patent',NULL,NULL),(18,'Gear','PG-BV-0065',NULL,NULL,'2026-06-22 05:26:28.448534','Extreme Cold Weather Clothing (ECWC) is a multi-layer protective clothing ensemble designed for military personnel operating in high-altitude and sub-zero temperature environments. The system ',NULL,'DEVELOPED','2026-06-25',NULL,NULL,'/uploads/b4cdfabb-3208-4a3f-a931-6f5a6ccc947e.png','GRANTED',NULL,'Extreme Cold Weather Clothing 2 1/2',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'TO_BE_FILED','PENDING',NULL,'2026-08-12 04:45:05.876730',NULL,NULL,NULL,1,'Patent, Trademark, Design',NULL,NULL),(20,'Protective Gear','BH-001',NULL,NULL,'2026-06-24 06:13:36.844556','High-performance ballistic combat helmet designed to provide superior protection against ballistic threats, shrapnel, and blunt impacts while maintaining comfort during extended military operations.',NULL,'DEVELOPED',NULL,NULL,NULL,'/uploads/5fd6ef6b-3fd4-42e8-af81-54c588703076.png','GRANTED',NULL,'Ballistic Helmet',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','IN_PROGRESS',NULL,'2026-07-01 05:01:21.744624',NULL,NULL,NULL,1,'Patent, Trademark, Design',NULL,NULL),(21,'Gear','PG-BV-00650',NULL,NULL,'2026-06-30 06:43:17.297728','sgsgfsghdfgdgdfg',NULL,'DEVELOPED',NULL,NULL,NULL,'/uploads/16267925-d20d-4eb9-93e9-ec61f2e23a37.png','GRANTED',NULL,'Extreme Cold Weather Sleeping Bag',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','TESTING',NULL,'2026-08-12 04:35:49.218773',NULL,NULL,NULL,1,'Patent, Trademark',NULL,NULL),(22,'Apparel','JDTD-001',NULL,NULL,'2026-07-01 05:44:39.014515','Military-grade extreme cold weather insulated down jacket designed for arctic and high-altitude operations. Provides superior thermal insulation, wind protection, and water resistance while maintainin',NULL,'DEVELOPED','2026-07-21',NULL,NULL,'/uploads/130d84bf-3e8a-49ae-8ee2-e9d5eca92071.png','PATENT_FILED',NULL,'Jacket Down Transfer Down (JDTD)',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','PENDING',NULL,'2026-08-12 04:44:43.373611',NULL,NULL,NULL,1,'Patent, Trademark',NULL,NULL),(23,'Protective Gear','PG-BV-009',NULL,NULL,'2026-07-02 05:40:49.799244','NEW BALLISTIC VEST MODEL',NULL,'DEVELOPED','2026-08-28',NULL,NULL,'/uploads/2da38275-f307-4261-bb5d-19ed25724ffd.png','GRANTED',NULL,'Ballistic Vest',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','PENDING',NULL,'2026-08-12 04:36:22.371837',NULL,NULL,NULL,1,'Patent, Trademark',NULL,NULL),(24,'Protective Gear','ECWSB-00189',NULL,NULL,'2026-07-21 06:50:18.489659','very good',NULL,'DEVELOPED','2026-11-16',NULL,NULL,'/uploads/cde44e83-d5b1-40d6-96a3-e3a11db82321.png','GRANTED',NULL,'Extreme Cold Weather Sleeping Bag',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','TESTING',NULL,'2026-08-11 05:39:53.594096',NULL,NULL,NULL,1,'Patent',NULL,NULL),(25,'Protective Gear','PG-BV-0063',NULL,NULL,'2026-07-23 06:15:01.601663','New version',NULL,'DEVELOPED',NULL,NULL,NULL,'/uploads/2fee5ea4-cf54-45b7-8853-f4e08f2411bc.png','NOT_FILED',NULL,'Knee Brace',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','TESTING',NULL,'2026-08-12 04:36:03.674135',NULL,NULL,NULL,1,NULL,NULL,NULL),(26,'Protective Gear','PG-BH-006',NULL,NULL,'2026-07-24 04:16:38.381135','dgdfgdfg',NULL,'DEVELOPED','2026-07-22',NULL,NULL,'/uploads/efa2f866-ab5d-4b6d-b959-069f15f690a2.png','NOT_FILED',NULL,'Ballistic Helmet',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','PENDING',NULL,'2026-08-12 04:36:45.300170',NULL,NULL,NULL,1,NULL,NULL,NULL),(27,'Gear','LC-BP-01',NULL,NULL,'2026-07-24 05:23:20.812962','tytyrty',NULL,'DEVELOPED',NULL,NULL,NULL,'/uploads/f2458926-a39f-43db-acb5-303ba2b90a37.png','NOT_FILED',NULL,'Ergonomically designed Back Pack ',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','PENDING',NULL,'2026-08-12 04:35:33.609006',NULL,NULL,NULL,1,NULL,NULL,NULL),(28,'Protective Gear','ITM000028',NULL,NULL,'2026-08-10 08:48:01.735741','fjfhfkffffff',NULL,'IN_PROGRESS',NULL,NULL,NULL,'/uploads/edca23c9-9beb-4c4d-9323-d5c154effdeb.png','GRANTED',NULL,'Ballistic Suit',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FILED','PENDING',NULL,'2026-08-12 04:45:27.861171',NULL,NULL,NULL,1,'Patent','Dino James','2026-08-27'),(29,'Protective Gear','ITM000029',NULL,NULL,'2026-08-10 09:15:34.159558','dfdsdffsdfsdf',NULL,'DEVELOPED',NULL,NULL,NULL,'/uploads/354280b1-bf5c-4caf-aeb7-646c66913ca0.png','GRANTED',NULL,'Knee Band',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FILED','TESTING',NULL,'2026-08-12 04:45:18.681546',NULL,NULL,NULL,1,'Patent','Gagan','2026-08-13'),(30,'Protective Gear','ITM000030',NULL,NULL,'2026-08-10 11:45:32.200840','dfgdffdg',NULL,'IN_PROGRESS',NULL,NULL,NULL,'/uploads/c9523264-3160-4679-b106-faefc089fc65.png','GRANTED',NULL,'Ballistic Plate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FILED','PENDING',NULL,'2026-08-11 05:07:55.870033',NULL,NULL,NULL,1,'Patent','Dino James','2026-07-31');
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `item_id` bigint DEFAULT NULL,
  `item_name` varchar(200) DEFAULT NULL,
  `message` varchar(500) NOT NULL,
  `is_read` bit(1) NOT NULL,
  `title` varchar(100) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `feedback_id` bigint DEFAULT NULL,
  `sample_no` varchar(100) DEFAULT NULL,
  `stakeholder_id` bigint DEFAULT NULL,
  `variant_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notif_user` (`user_id`),
  KEY `idx_notif_read` (`is_read`),
  KEY `idx_notif_created` (`created_at`),
  CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (93,'2026-08-10 08:48:01.821180',28,'Ballistic Suit','Ballistic Suit has been added to the system.',_binary '\0','Item created','ITEM_ADDED',1,NULL,NULL,NULL,NULL),(94,'2026-08-10 09:15:34.213998',29,'Knee Band','Knee Band has been added to the system.',_binary '\0','Item created','ITEM_ADDED',1,NULL,NULL,NULL,NULL),(95,'2026-08-10 11:45:32.226197',30,'Ballistic Plate','Ballistic Plate has been added to the system.',_binary '\0','Item created','ITEM_ADDED',1,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `procurement_details`
--

DROP TABLE IF EXISTS `procurement_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `procurement_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `items_procured` int DEFAULT NULL,
  `order_date` date DEFAULT NULL,
  `order_number` varchar(255) DEFAULT NULL,
  `organisation_name` varchar(255) DEFAULT NULL,
  `item_id` bigint DEFAULT NULL,
  `no_of_item_procured` int DEFAULT NULL,
  `procurement_agency` varchar(255) DEFAULT NULL,
  `production_value` varchar(255) DEFAULT NULL,
  `tot_firm_no` varchar(255) DEFAULT NULL,
  `variant_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9xou2mjka53ds9buowmi9ht9` (`item_id`),
  KEY `FK6x88qgih69nwxivwykiftsoye` (`variant_id`),
  CONSTRAINT `FK6x88qgih69nwxivwykiftsoye` FOREIGN KEY (`variant_id`) REFERENCES `item_variants` (`id`),
  CONSTRAINT `FK9xou2mjka53ds9buowmi9ht9` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=157 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `procurement_details`
--

LOCK TABLES `procurement_details` WRITE;
/*!40000 ALTER TABLE `procurement_details` DISABLE KEYS */;
INSERT INTO `procurement_details` VALUES (64,4,'2026-06-12','sdfgf','fghfh',20,NULL,NULL,NULL,NULL,NULL),(66,34,'2026-08-08','3345','CRPF',14,NULL,NULL,NULL,NULL,NULL),(68,2,'2026-06-19','3432','sdfsdfsd',16,NULL,NULL,NULL,NULL,NULL),(131,NULL,'2026-08-21','234',NULL,30,23,'CRPF','$12000','Vision Pvt Ltd',NULL),(132,NULL,'2026-09-03','12321',NULL,30,3400,'Indian Army','$120000','Vision Pvt Ltd',NULL),(133,NULL,'2026-07-30','456456',NULL,24,NULL,'','','',NULL),(135,NULL,'2026-08-03','34544',NULL,29,2340,'CRPF','₹18,50,00,000','Vision Pvt Ltd',NULL),(136,NULL,'2026-08-13','454545',NULL,29,63440,'Indian Army','₹48,50,00,000','Vision Pvt Ltd',NULL),(146,NULL,'2025-01-06','435',NULL,NULL,NULL,'','','',13),(148,NULL,'2026-07-09','345435',NULL,23,NULL,'','','',NULL),(149,NULL,'2026-07-31','45453',NULL,NULL,NULL,'','','',12),(150,NULL,'2026-07-23','234234',NULL,22,NULL,'','','',NULL),(151,NULL,'2026-06-20','ITBP-ECWCS-001',NULL,18,NULL,'','','',NULL),(152,NULL,'2026-06-27','Army-ECWCS-001',NULL,18,NULL,'','','',NULL),(153,NULL,'2026-06-30','SSB-ECWCS-001',NULL,18,NULL,'','','',NULL),(154,NULL,'2026-08-20','345435',NULL,28,12000,'CRPF','₹18,50,00,000','Kanpur Defence Textiles Pvt. Ltd.',NULL),(155,NULL,'2026-08-28','456456',NULL,28,30000,'Indian Army','₹48,50,00,000','	Kanpur Defence Textiles Pvt. Ltd.',NULL),(156,NULL,'2026-07-27','565',NULL,NULL,NULL,'','','',6);
/*!40000 ALTER TABLE `procurement_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tot_partners`
--

DROP TABLE IF EXISTS `tot_partners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tot_partners` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `latot_signature` bit(1) DEFAULT NULL,
  `partner_name` varchar(255) DEFAULT NULL,
  `sample_submitted_for_tac` bit(1) DEFAULT NULL,
  `tot_certificate` bit(1) DEFAULT NULL,
  `item_id` bigint DEFAULT NULL,
  `latot_signing_date` date DEFAULT NULL,
  `sample_submission_for_tech_absorption_date` date DEFAULT NULL,
  `tot_certificate_date` date DEFAULT NULL,
  `tot_firm` varchar(300) DEFAULT NULL,
  `tot_validity_date` date DEFAULT NULL,
  `variant_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKkxyme40hi0nj8vow1uujcw7o8` (`item_id`),
  KEY `FKi6em2ohwywp9r01093ncickjk` (`variant_id`),
  CONSTRAINT `FKi6em2ohwywp9r01093ncickjk` FOREIGN KEY (`variant_id`) REFERENCES `item_variants` (`id`),
  CONSTRAINT `FKkxyme40hi0nj8vow1uujcw7o8` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=166 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tot_partners`
--

LOCK TABLES `tot_partners` WRITE;
/*!40000 ALTER TABLE `tot_partners` DISABLE KEYS */;
INSERT INTO `tot_partners` VALUES (69,_binary '\0','TCS',_binary '',_binary '',20,NULL,NULL,NULL,NULL,NULL,NULL),(71,_binary '','Porsche',_binary '',_binary '\0',14,NULL,NULL,NULL,NULL,NULL,NULL),(73,_binary '','sdfsdsfsdfsdf',_binary '',_binary '',16,NULL,NULL,NULL,NULL,NULL,NULL),(139,NULL,NULL,NULL,NULL,30,'2026-08-03','2026-08-04','2026-08-06','Vision Pvt Ltd','2026-08-13',NULL),(140,NULL,NULL,NULL,NULL,24,NULL,NULL,NULL,'',NULL,NULL),(142,NULL,NULL,NULL,NULL,29,'2026-08-28','2026-08-28','2026-09-03','Vision Pvt Ltd','2026-08-17',NULL),(153,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,8),(154,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,13),(156,NULL,NULL,NULL,NULL,23,NULL,NULL,NULL,'',NULL,NULL),(157,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,12),(158,NULL,NULL,NULL,NULL,22,NULL,NULL,NULL,'',NULL,NULL),(159,NULL,NULL,NULL,NULL,22,NULL,NULL,NULL,'',NULL,NULL),(160,NULL,NULL,NULL,NULL,18,NULL,NULL,NULL,'',NULL,NULL),(161,NULL,NULL,NULL,NULL,18,NULL,NULL,NULL,'',NULL,NULL),(162,NULL,NULL,NULL,NULL,18,NULL,NULL,NULL,'',NULL,NULL),(163,NULL,NULL,NULL,NULL,28,'2026-08-19','2026-08-20','2026-08-28','Kanpur Defence Textiles Pvt. Ltd.','2026-08-12',NULL),(164,NULL,NULL,NULL,NULL,28,'2025-09-18','2025-12-24','2025-07-17','Krish Tech Ltd','2026-08-09',NULL),(165,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,6);
/*!40000 ALTER TABLE `tot_partners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trial_feedbacks`
--

DROP TABLE IF EXISTS `trial_feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trial_feedbacks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `correction` varchar(255) DEFAULT NULL,
  `feedback` varchar(255) DEFAULT NULL,
  `feedback_overdue` bit(1) NOT NULL,
  `feedback_received_date` date DEFAULT NULL,
  `further_action` varchar(255) DEFAULT NULL,
  `overdue_notified_at` datetime(6) DEFAULT NULL,
  `request_trial_date` date DEFAULT NULL,
  `sample_no` varchar(255) DEFAULT NULL,
  `sample_submission_date` date DEFAULT NULL,
  `status` enum('NOT_STARTED','IN_PROGRESS','TESTING','COMPLETED','ON_HOLD') DEFAULT NULL,
  `stakeholder_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK27y24yfc4doqfcxdvl3ppeoin` (`stakeholder_id`),
  CONSTRAINT `FK27y24yfc4doqfcxdvl3ppeoin` FOREIGN KEY (`stakeholder_id`) REFERENCES `trial_stakeholders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trial_feedbacks`
--

LOCK TABLES `trial_feedbacks` WRITE;
/*!40000 ALTER TABLE `trial_feedbacks` DISABLE KEYS */;
/*!40000 ALTER TABLE `trial_feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trial_stakeholders`
--

DROP TABLE IF EXISTS `trial_stakeholders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trial_stakeholders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `correction` varchar(255) DEFAULT NULL,
  `feedback` varchar(255) DEFAULT NULL,
  `further_action` varchar(255) DEFAULT NULL,
  `sample_request_date` date DEFAULT NULL,
  `sample_submission_date` date DEFAULT NULL,
  `stakeholder_name` varchar(255) DEFAULT NULL,
  `item_id` bigint DEFAULT NULL,
  `status` enum('NOT_STARTED','IN_PROGRESS','TESTING','COMPLETED','ON_HOLD') DEFAULT NULL,
  `sample_no` varchar(255) DEFAULT NULL,
  `stakeholder_address` varchar(255) DEFAULT NULL,
  `stakeholder_phone` varchar(255) DEFAULT NULL,
  `variant_id` bigint DEFAULT NULL,
  `contact_person_name` varchar(255) DEFAULT NULL,
  `trial_status` enum('NOT_STARTED','IN_PROGRESS','TESTING','COMPLETED','ON_HOLD') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK8jlx3ev0mejddtw6kibmknoik` (`item_id`),
  KEY `FKahs0xstov69ug6dyo3vldhy4v` (`variant_id`),
  CONSTRAINT `FK8jlx3ev0mejddtw6kibmknoik` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  CONSTRAINT `FKahs0xstov69ug6dyo3vldhy4v` FOREIGN KEY (`variant_id`) REFERENCES `item_variants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=173 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trial_stakeholders`
--

LOCK TABLES `trial_stakeholders` WRITE;
/*!40000 ALTER TABLE `trial_stakeholders` DISABLE KEYS */;
INSERT INTO `trial_stakeholders` VALUES (79,'sdfsdfdsf','sdfsdf','sfdsdfsd','2026-06-03','2026-06-29','dfgdfg',20,'NOT_STARTED',NULL,NULL,NULL,NULL,NULL,NULL),(80,'','','','2026-07-10','2026-07-29','ertetet',20,'TESTING',NULL,NULL,NULL,NULL,NULL,NULL),(82,'','','','2026-06-24','2026-06-27','vsdvsdv',14,'TESTING',NULL,NULL,NULL,NULL,NULL,NULL),(85,'ssdfsfs','sfgsfgfgfsdg','fsfsfsfsjjjjjjjjjj','2026-06-17','2026-07-11','sffsgsg',16,'IN_PROGRESS',NULL,NULL,NULL,NULL,NULL,NULL),(86,'','','',NULL,NULL,'svsfsd',16,'ON_HOLD',NULL,NULL,NULL,NULL,NULL,NULL),(148,'Nothing','No','Not Yet','2026-08-13','2026-08-20','CRPF',30,'NOT_STARTED','34','Sant Nagar, Delhi','9898343442',NULL,'Col AB Singh',NULL),(149,'fghfgj','rgerg','ghjkhk','2026-07-22','2026-07-24','34545dgdf',24,'TESTING','','','',NULL,'',NULL),(152,'Nothing','No','Yes','2026-08-25','2026-09-04','CRPF',29,'TESTING','35','Terminal Ballistics Research Laboratory (TBRL), Sector 30, Chandigarh','8978978978',NULL,'Col. A. Verma',NULL),(160,NULL,NULL,NULL,NULL,NULL,'crpf',NULL,NULL,NULL,'','',8,'','NOT_STARTED'),(161,NULL,NULL,NULL,NULL,NULL,'sfdsf',NULL,NULL,NULL,'','',13,'','NOT_STARTED'),(162,NULL,NULL,NULL,NULL,NULL,'dgdfg',NULL,NULL,NULL,'','',13,'','NOT_STARTED'),(164,NULL,NULL,NULL,NULL,NULL,'CRPF',23,NULL,NULL,'','',NULL,'','NOT_STARTED'),(165,NULL,NULL,NULL,NULL,NULL,'CRPF',13,NULL,NULL,'','',NULL,'','NOT_STARTED'),(166,NULL,NULL,NULL,NULL,NULL,'dfgfg',NULL,NULL,NULL,'','',12,'','NOT_STARTED'),(167,NULL,NULL,NULL,NULL,NULL,'CRPF',22,NULL,NULL,'','',NULL,'','NOT_STARTED'),(168,NULL,NULL,NULL,NULL,NULL,'ITBP',18,NULL,NULL,'','',NULL,'','NOT_STARTED'),(169,NULL,NULL,NULL,NULL,NULL,'Army',18,NULL,NULL,'','',NULL,'','NOT_STARTED'),(170,NULL,NULL,NULL,NULL,NULL,'SSB',18,NULL,NULL,'','',NULL,'','NOT_STARTED'),(171,NULL,NULL,NULL,NULL,NULL,'CRPF',28,NULL,NULL,'Terminal Ballistics Research Laboratory (TBRL), Sector 30, Chandigarh','8978978978',NULL,'Col. A. Verma','NOT_STARTED'),(172,NULL,NULL,NULL,NULL,NULL,'sfsdf',NULL,NULL,NULL,'','',6,'','NOT_STARTED');
/*!40000 ALTER TABLE `trial_stakeholders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','USER','VIEWER') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  `failed_login_attempts` int NOT NULL,
  `last_login_at` datetime(6) DEFAULT NULL,
  `locked_until` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_r43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,_binary '','2026-06-09 04:15:29.761341','admin@ims.gov.in','Admin User','$2a$10$kDy1revQ1Ak0Z7I/APHaxepCSOxkKp3/ySL8bb2/cikG1ZVioOIsG','ADMIN','2026-08-12 04:35:03.330187','admin',0,'2026-08-12 04:35:03.285580',NULL),(2,_binary '','2026-06-09 04:15:29.786022','user@ims.gov.in','Staff User','$2a$10$7W7UQT/rWAHWGtEa10R39uxw5ig9BMRMsepBuC5xduHn.S1G8lVVq','USER','2026-06-09 04:15:29.786022','user',0,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variant_documentation`
--

DROP TABLE IF EXISTS `variant_documentation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variant_documentation` (
  `variant_id` bigint NOT NULL,
  `doc_name` varchar(200) DEFAULT NULL,
  KEY `FKp3c6nwdm3ah2m450bo9ntr10y` (`variant_id`),
  CONSTRAINT `FKp3c6nwdm3ah2m450bo9ntr10y` FOREIGN KEY (`variant_id`) REFERENCES `item_variants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variant_documentation`
--

LOCK TABLES `variant_documentation` WRITE;
/*!40000 ALTER TABLE `variant_documentation` DISABLE KEYS */;
INSERT INTO `variant_documentation` VALUES (8,'Design Document'),(13,'ATP / QTP / QAP'),(13,'Technology Transfer Document'),(12,'Technical Specification / QR'),(12,'ATP / QTP / QAP'),(6,'Technical Specification / QR'),(6,'Trial Directive');
/*!40000 ALTER TABLE `variant_documentation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variant_tot_documents`
--

DROP TABLE IF EXISTS `variant_tot_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variant_tot_documents` (
  `variant_id` bigint NOT NULL,
  `document_code` varchar(20) DEFAULT NULL,
  KEY `FK4f66qpi3c0xxakb1ptmss5ai0` (`variant_id`),
  CONSTRAINT `FK4f66qpi3c0xxakb1ptmss5ai0` FOREIGN KEY (`variant_id`) REFERENCES `item_variants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variant_tot_documents`
--

LOCK TABLES `variant_tot_documents` WRITE;
/*!40000 ALTER TABLE `variant_tot_documents` DISABLE KEYS */;
INSERT INTO `variant_tot_documents` VALUES (13,'TTD'),(13,'TAC'),(12,'TNF'),(12,'TAC'),(6,'TTD'),(6,'TNF');
/*!40000 ALTER TABLE `variant_tot_documents` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-12 12:42:11
