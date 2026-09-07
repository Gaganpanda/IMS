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
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6216v5rc6tyk03g0n5hrwniu4` (`item_id`),
  CONSTRAINT `FKmvar01j8q8gna8hg25cs5ad47` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ipr_details`
--

LOCK TABLES `ipr_details` WRITE;
/*!40000 ALTER TABLE `ipr_details` DISABLE KEYS */;
INSERT INTO `ipr_details` VALUES (1,_binary '',_binary '\0','','456546',_binary '',_binary '','456456456','56rt646',_binary '',_binary '\0','456456','456546',14),(3,_binary '\0',_binary '\0','','',_binary '',_binary '','3453543535','sdfsdfsdf345345',_binary '\0',_binary '\0','','',16),(4,_binary '',_binary '\0','','2343242343',_binary '',_binary '','234234234234','234424234234',_binary '',_binary '\0','','23423424',17),(5,_binary '',_binary '','D-ECWCS-001G','D-ECWCS-001',_binary '',_binary '\0','','IN2025ECWCS001',_binary '',_binary '\0','','TM-ECWCS-2025',18),(6,_binary '\0',_binary '\0','','',_binary '',_binary '','234234','23424',_binary '',_binary '','3432424','12432',19),(7,_binary '',_binary '\0','','25466',_binary '',_binary '','1223434','123213',_binary '',_binary '\0','','234324',20),(8,_binary '\0',_binary '\0','','',_binary '',_binary '','sdfsdf','sfsdf',_binary '',_binary '\0','','sfsdf',21),(9,_binary '\0',_binary '\0','','',_binary '',_binary '\0','','',_binary '\0',_binary '\0','','',13),(10,_binary '\0',_binary '\0','','',_binary '',_binary '\0','','234234',_binary '',_binary '\0','','234324',22),(11,_binary '\0',_binary '\0','','',_binary '',_binary '','234234','awr234324',_binary '',_binary '\0','','234234234',23);
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
INSERT INTO `item_documentation` VALUES (17,'Technical Specification / QR'),(17,'Trial Directive'),(17,'ATP / QTP / QAP'),(18,'Trial Directive'),(18,'Technology Transfer Document'),(20,'Technology Transfer Document'),(20,'ATP / QTP / QAP'),(20,'Trial Directive'),(14,'ATP / QTP / QAP'),(14,'Trial Directive'),(14,'Technology Transfer Document'),(16,'Trial Directive'),(16,'ATP / QTP / QAP'),(13,'Technical Specification / QR'),(13,'ATP / QTP / QAP'),(13,'Trial Directive'),(22,'Technical Specification / QR'),(22,'ATP / QTP / QAP'),(22,'Trial Directive'),(21,'ATP / QTP / QAP'),(21,'Technology Transfer Document'),(23,'Technical Specification / QR'),(23,'ATP / QTP / QAP'),(19,'ATP / QTP / QAP'),(19,'Technical Specification / QR'),(19,'Trial Directive');
/*!40000 ALTER TABLE `item_documentation` ENABLE KEYS */;
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
INSERT INTO `item_tot_documents` VALUES (17,'TTD'),(17,'TNF'),(17,'TAC'),(17,'CEC'),(20,'TTD'),(20,'TNF'),(20,'TAC'),(14,'TTD'),(14,'TAC'),(22,'TTD'),(22,'TNF'),(22,'CEC'),(21,'TTD'),(21,'TAC'),(23,'TTD'),(23,'TNF'),(23,'TAC'),(19,'TTD'),(19,'TNF'),(19,'TAC'),(19,'CEC');
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
  `trials_status` varchar(30) DEFAULT NULL,
  `unit_cost` double DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `vendor` varchar(200) DEFAULT NULL,
  `warranty` varchar(100) DEFAULT NULL,
  `weight` varchar(50) DEFAULT NULL,
  `created_by_id` bigint DEFAULT NULL,
  `ipr_types_label` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_item_code` (`code`),
  KEY `idx_item_category` (`category`),
  KEY `idx_item_dev_status` (`development_status`),
  KEY `idx_item_updated` (`updated_at`),
  KEY `FK4c0fngnpbp0xfjf8by9e27rcq` (`created_by_id`),
  CONSTRAINT `FK4c0fngnpbp0xfjf8by9e27rcq` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (13,'Gear','PG-KB-009',NULL,NULL,'2026-06-16 06:25:59.455988','Exoskeletons are wearable devices designed to enhance human capabilities, such as strength, endurance, and mobility',NULL,'DEVELOPED','2026-07-24',NULL,NULL,'/uploads/2ee5a5c1-4edf-4645-9e7f-1995b99c87dd.png','PATENT_FILED',NULL,'Passive Exoskeleton',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','COMPLETED',NULL,'2026-07-01 05:17:13.832177',NULL,NULL,NULL,1,'Patent'),(14,'Protective Gear','PG-BV-006',NULL,NULL,'2026-06-19 06:48:52.571881','Advanced lightweight ballistic vest providing torso protection against small arms fire and fragmentation while ensuring mobility and ergonomic comfort for operational personnel.',NULL,'DEVELOPED','2026-07-10',NULL,NULL,'/uploads/ae25520b-c3fa-4c12-afbb-0380ee0e2602.png','GRANTED',NULL,'Ballistic Vest',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','IN_PROGRESS',NULL,'2026-07-01 05:03:58.761714',NULL,NULL,NULL,1,'Patent, Trademark, Design'),(16,'Apparel','sfsf',NULL,NULL,'2026-06-22 03:51:14.237522','sdfsdsdsdfsdfsdfsdfsdfsdfsdf',NULL,'IN_PROGRESS','2026-06-26',NULL,NULL,'/uploads/62cbe239-8fb8-4be9-af17-a2c949fa14bf.png','GRANTED',NULL,'Knee Brace',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','ON_HOLD',NULL,'2026-07-01 05:09:05.845076',NULL,NULL,NULL,1,'Patent'),(17,'Protective Gear','PG-BV-0061',NULL,NULL,'2026-06-22 04:16:03.527977','Knee braces provide support, stability, and pain relief for various knee conditions, with different types suited for specific injuries or activities.',NULL,'DEVELOPED','2026-06-25',NULL,NULL,'/uploads/c82a60f5-8a4c-4179-8438-98e2e149d9f1.png','GRANTED',NULL,'Knee Brace',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','IN_PROGRESS',NULL,'2026-06-30 06:39:57.601209',NULL,NULL,NULL,1,'Patent, Trademark, Design'),(18,'Gear','PG-BV-0065',NULL,NULL,'2026-06-22 05:26:28.448534','Extreme Cold Weather Clothing (ECWC) is a multi-layer protective clothing ensemble designed for military personnel operating in high-altitude and sub-zero temperature environments. The system ',NULL,'DEVELOPED','2026-06-25',NULL,NULL,'/uploads/4eb41fde-830b-49c5-83ff-9ffcec81f8b9.png','GRANTED',NULL,'Extreme Cold Weather Clothing 2 1/2',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'TO_BE_FILED','COMPLETED',NULL,'2026-06-30 11:21:50.837620',NULL,NULL,NULL,1,'Patent, Trademark, Design'),(19,'Gear','ECWSB-001',NULL,NULL,'2026-06-22 06:05:03.788930','Extreme Cold Weather Sleeping Bag is a military-grade insulated sleeping system designed for personnel operating in high-altitude, snow-bound, and sub-zero environments. The sleeping bag provides ther',NULL,'DEVELOPED','2026-11-16',NULL,NULL,'/uploads/14812b42-ac1a-43a0-856b-af5a8f8920f3.png','GRANTED',NULL,'Extreme Cold Weather Sleeping Bag',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','IN_PROGRESS',NULL,'2026-07-03 05:29:44.082747',NULL,NULL,NULL,1,'Patent, Trademark'),(20,'Protective Gear','BH-001',NULL,NULL,'2026-06-24 06:13:36.844556','High-performance ballistic combat helmet designed to provide superior protection against ballistic threats, shrapnel, and blunt impacts while maintaining comfort during extended military operations.',NULL,'DEVELOPED',NULL,NULL,NULL,'/uploads/5fd6ef6b-3fd4-42e8-af81-54c588703076.png','GRANTED',NULL,'Ballistic Helmet',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','IN_PROGRESS',NULL,'2026-07-01 05:01:21.744624',NULL,NULL,NULL,1,'Patent, Trademark, Design'),(21,'Gear','PG-BV-00650',NULL,NULL,'2026-06-30 06:43:17.297728','sgsgfsghdfgdgdfg',NULL,'DEVELOPED',NULL,NULL,NULL,'/uploads/6bf84b42-aa9d-47d9-958f-8e2bf3a8838d.png','GRANTED',NULL,'Extreme Cold Weather Sleeping Bag',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','IN_PROGRESS',NULL,'2026-07-02 05:36:20.139895',NULL,NULL,NULL,1,'Patent, Trademark'),(22,'Apparel','JDTD-001',NULL,NULL,'2026-07-01 05:44:39.014515','Military-grade extreme cold weather insulated down jacket designed for arctic and high-altitude operations. Provides superior thermal insulation, wind protection, and water resistance while maintainin',NULL,'DEVELOPED','2026-07-21',NULL,NULL,'/uploads/c9d32846-510e-47b0-932a-7cb990919796.png','PATENT_FILED',NULL,'Jacket Down Transfer Down (JDTD)',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','ON_HOLD',NULL,'2026-07-01 05:44:39.098053',NULL,NULL,NULL,1,'Patent, Trademark'),(23,'Protective Gear','PG-BV-009',NULL,NULL,'2026-07-02 05:40:49.799244','NEW BALLISTIC VEST MODEL',NULL,'DEVELOPED','2026-08-28',NULL,NULL,'/uploads/8487f76a-aa51-4115-8bef-3b49b9b62bf8.png','GRANTED',NULL,'Ballistic Vest',NULL,'HIGH',NULL,NULL,NULL,NULL,NULL,NULL,'FILED','IN_PROGRESS',NULL,'2026-07-02 06:00:22.816760',NULL,NULL,NULL,1,'Patent, Trademark');
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
  `type` enum('ITEM_ADDED','STATUS_CHANGED','DOCUMENT_FILLED','IPR_CHANGED','DOCUMENT_UPLOAD','PROCUREMENT','TRIAL_UPDATE','GENERAL') DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notif_user` (`user_id`),
  KEY `idx_notif_read` (`is_read`),
  KEY `idx_notif_created` (`created_at`),
  CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (62,'2026-06-30 11:21:50.820935',18,'Extreme Cold Weather Clothing 2 1/2','Extreme Cold Weather Clothing 2 1/2: ToT status changed to To Be Filed.',_binary '','Item updated','STATUS_CHANGED',1),(63,'2026-07-01 04:41:36.121042',15,'Ballistic Helmet','Ballistic Helmet: trial status changed to In Progress.',_binary '\0','Item updated','STATUS_CHANGED',1),(64,'2026-07-01 04:57:38.930294',13,'Knee Brace','Knee Brace: IPR status changed to Patent Filed.',_binary '\0','Item updated','STATUS_CHANGED',1),(65,'2026-07-01 05:00:48.994295',20,'Ballistic Helmet','Ballistic Helmet: development status changed to Developed; 1 new document(s) added.',_binary '\0','Item updated','STATUS_CHANGED',1),(66,'2026-07-01 05:01:21.744624',20,'Ballistic Helmet','A new image has been uploaded for Ballistic Helmet',_binary '\0','Image uploaded','DOCUMENT_UPLOAD',1),(67,'2026-07-01 05:02:40.878545',14,'Ballistic Vest','Ballistic Vest: a new procurement entry was added.',_binary '\0','Item updated','STATUS_CHANGED',1),(68,'2026-07-01 05:03:58.761714',14,'Ballistic Vest','A new image has been uploaded for Ballistic Vest',_binary '\0','Image uploaded','DOCUMENT_UPLOAD',1),(69,'2026-07-01 05:08:12.544800',13,'Passive Exoskeleton','A new image has been uploaded for Passive Exoskeleton',_binary '\0','Image uploaded','DOCUMENT_UPLOAD',1),(70,'2026-07-01 05:08:29.295128',NULL,'Ballistic Helmet','Ballistic Helmet has been removed from the system.',_binary '\0','Item deleted','GENERAL',1),(71,'2026-07-01 05:08:42.561820',21,'Extreme Cold Weather Sleeping Bag','A new image has been uploaded for Extreme Cold Weather Sleeping Bag',_binary '\0','Image uploaded','DOCUMENT_UPLOAD',1),(72,'2026-07-01 05:09:05.845076',16,'Knee Brace','A new image has been uploaded for Knee Brace',_binary '\0','Image uploaded','DOCUMENT_UPLOAD',1),(73,'2026-07-01 05:11:38.487177',13,'Passive Exoskeleton','Passive Exoskeleton: trial status changed to Completed.',_binary '\0','Item updated','STATUS_CHANGED',1),(74,'2026-07-01 05:17:47.246962',19,'Extreme Cold Weather Sleeping Bag','Extreme Cold Weather Sleeping Bag: IPR status changed to Trademark.',_binary '\0','Item updated','STATUS_CHANGED',1),(75,'2026-07-01 05:44:39.030669',22,'Jacket Down Transfer Down (JDTD)','Jacket Down Transfer Down (JDTD) has been added to the system.',_binary '\0','Item added successfully','ITEM_ADDED',1),(76,'2026-07-01 05:44:39.098053',22,'Jacket Down Transfer Down (JDTD)','A new image has been uploaded for Jacket Down Transfer Down (JDTD)',_binary '\0','Image uploaded','DOCUMENT_UPLOAD',1),(77,'2026-07-02 05:40:49.831155',23,'Ballistic Vest','Ballistic Vest has been added to the system.',_binary '\0','Item added successfully','ITEM_ADDED',1),(78,'2026-07-02 05:40:50.025403',23,'Ballistic Vest','A new image has been uploaded for Ballistic Vest',_binary '\0','Image uploaded','DOCUMENT_UPLOAD',1);
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
  PRIMARY KEY (`id`),
  KEY `FK9xou2mjka53ds9buowmi9ht9` (`item_id`),
  CONSTRAINT `FK9xou2mjka53ds9buowmi9ht9` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `procurement_details`
--

LOCK TABLES `procurement_details` WRITE;
/*!40000 ALTER TABLE `procurement_details` DISABLE KEYS */;
INSERT INTO `procurement_details` VALUES (43,2,'2026-06-26','2342342','CRPF',17),(59,500,'2026-06-20','ITBP-ECWCS-001','ITBP',18),(60,1000,'2026-06-27','Army-ECWCS-001','Army',18),(61,200,'2026-06-30','SSB-ECWCS-001','SSB',18),(64,4,'2026-06-12','sdfgf','fghfh',20),(66,34,'2026-08-08','3345','CRPF',14),(68,2,'2026-06-19','3432','sdfsdfsd',16),(71,34,'2026-07-23','234234','CRPF',22),(73,45,'2025-01-06','435','sdfdsf',21),(75,33,'2026-07-09','345435','CRPF',23),(80,1000,'2026-07-17','ITBP-ECWSB-001','ITBP',19),(81,300,'2026-07-23',' SSB-ECWSB-003','SSB',19);
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
  PRIMARY KEY (`id`),
  KEY `FKkxyme40hi0nj8vow1uujcw7o8` (`item_id`),
  CONSTRAINT `FKkxyme40hi0nj8vow1uujcw7o8` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tot_partners`
--

LOCK TABLES `tot_partners` WRITE;
/*!40000 ALTER TABLE `tot_partners` DISABLE KEYS */;
INSERT INTO `tot_partners` VALUES (48,_binary '','Vision Pvt Ltd',_binary '',_binary '',17),(64,_binary '','ABC Defence Textiles Pvt Ltd',_binary '',_binary '',18),(65,_binary '\0','Himalayan Protective Systems',_binary '',_binary '',18),(66,_binary '','Bharat Technical Fabrics Ltd',_binary '',_binary '\0',18),(69,_binary '\0','TCS',_binary '',_binary '',20),(71,_binary '','Porsche',_binary '',_binary '\0',14),(73,_binary '','sdfsdsfsdfsdf',_binary '',_binary '',16),(77,_binary '\0','Vision PVT LTD',_binary '',_binary '',22),(78,_binary '','India Bulls',_binary '',_binary '',22),(80,_binary '\0','sfsd',_binary '',_binary '',21),(82,_binary '','SYSto Pvt',_binary '\0',_binary '\0',23),(89,_binary '\0','Defence Textile Corporation',_binary '',_binary '',19),(90,_binary '','Himalayan Outdoor Systems Pvt Ltd',_binary '',_binary '\0',19),(91,_binary '','Arctic Defence Equipment Ltd',_binary '\0',_binary '',19);
/*!40000 ALTER TABLE `tot_partners` ENABLE KEYS */;
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
  PRIMARY KEY (`id`),
  KEY `FK8jlx3ev0mejddtw6kibmknoik` (`item_id`),
  CONSTRAINT `FK8jlx3ev0mejddtw6kibmknoik` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trial_stakeholders`
--

LOCK TABLES `trial_stakeholders` WRITE;
/*!40000 ALTER TABLE `trial_stakeholders` DISABLE KEYS */;
INSERT INTO `trial_stakeholders` VALUES (53,'Nothing','Nice','Nope','2026-06-18','2026-06-18','CRPF',17,'TESTING'),(73,'','Meets thermal insulation requirements','Recommended for procurement','2026-06-10','2026-06-25','ITBP',18,'COMPLETED'),(74,'Minor zipper reinforcement','\nSatisfactory performance in field trials','Approved for deployment','2026-06-26','2026-07-02','Army',18,'COMPLETED'),(75,'',' Good mobility and comfort','Recommended for bulk procurement','2026-06-26','2026-07-07','SSB',18,'COMPLETED'),(79,'sdfsdfdsf','sdfsdf','sfdsdfsd','2026-06-03','2026-06-29','dfgdfg',20,'NOT_STARTED'),(80,'','','','2026-07-10','2026-07-29','ertetet',20,'TESTING'),(82,'','','','2026-06-24','2026-06-27','vsdvsdv',14,'TESTING'),(85,'ssdfsfs','sfgsfgfgfsdg','fsfsfsfsjjjjjjjjjj','2026-06-17','2026-07-11','sffsgsg',16,'IN_PROGRESS'),(86,'','','',NULL,NULL,'svsfsd',16,'ON_HOLD'),(88,'No correction','Nothing','Nothing','2026-07-23','2026-07-24','CRPF',13,'COMPLETED'),(91,'Improved wrist seal, increased zipper durability, enhanced hood adjustment mechanism.','Excellent thermal insulation and wind protection. Mobility remained satisfactory during prolonged exposure to sub-zero environments.','Proceed for bulk production and induction after final quality clearance and acceptance trials.','2026-07-21','2026-08-07','CRPF',22,'ON_HOLD'),(94,'sdfsdf','sfdsf','sdfdsf','2026-06-16','2026-06-10','sfdsf',21,'TESTING'),(95,'dfgdfg','dfgdfg','dgdfg','2026-06-11','2026-07-02','dgdfg',21,'COMPLETED'),(97,'No','Good','Later on','2026-07-15','2026-07-30','CRPF',23,'TESTING'),(102,'','Excellent thermal retention and comfort during prolonged deployment in sub-zero conditions.','Recommended for bulk procurement.','2026-06-18','2026-06-30','ITBP',19,'TESTING'),(103,'Improve zipper durability.','Good insulation performance and compact storage capability.','Approved after minor modification.','2026-07-02','2026-07-11','Army',19,'TESTING');
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_r43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,_binary '','2026-06-09 04:15:29.761341','admin@ims.gov.in','Admin User','$2a$10$kDy1revQ1Ak0Z7I/APHaxepCSOxkKp3/ySL8bb2/cikG1ZVioOIsG','ADMIN','2026-06-09 04:15:29.761341','admin'),(2,_binary '','2026-06-09 04:15:29.786022','user@ims.gov.in','Staff User','$2a$10$7W7UQT/rWAHWGtEa10R39uxw5ig9BMRMsepBuC5xduHn.S1G8lVVq','USER','2026-06-09 04:15:29.786022','user');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-12 11:11:54
