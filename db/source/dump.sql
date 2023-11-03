/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: categories
# ------------------------------------------------------------

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` varchar(100) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: items
# ------------------------------------------------------------

DROP TABLE IF EXISTS `items`;
CREATE TABLE `items` (
  `id` int unsigned NOT NULL,
  `tag` varchar(1) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tag` (`tag`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: products
# ------------------------------------------------------------

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` varchar(100) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `index` int unsigned NOT NULL DEFAULT '0',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shop` varchar(100) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  `category` varchar(100) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  `tags` varchar(500) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  `createAt` bigint unsigned DEFAULT '0',
  `sort` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: shops
# ------------------------------------------------------------

DROP TABLE IF EXISTS `shops`;
CREATE TABLE `shops` (
  `id` varchar(100) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `index` int unsigned NOT NULL DEFAULT '0',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createAt` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: tags
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` varchar(1) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  `age` int unsigned NOT NULL DEFAULT '0',
  `favorites` varchar(500) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  `createAt` bigint unsigned DEFAULT '0',
  `amount` int unsigned NOT NULL DEFAULT '0',
  `data` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '{}',
  PRIMARY KEY (`id`),
  KEY `name` (`name`)
) ENGINE = InnoDB AUTO_INCREMENT = 8943 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: categories
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: items
# ------------------------------------------------------------

INSERT INTO `items` (`id`,`tag`) VALUES (0,'a'),(3,'a'),(6,'a'),(9,'a'),(12,'a'),(15,'a'),(18,'a'),(21,'a'),(24,'a'),(27,'a'),(30,'a'),(33,'a'),(36,'a'),(39,'a'),(42,'a'),(45,'a'),(48,'a'),(51,'a'),(54,'a'),(57,'a'),(60,'a'),(63,'a'),(66,'a'),(69,'a'),(72,'a'),(75,'a'),(78,'a'),(81,'a'),(84,'a'),(87,'a'),(90,'a'),(93,'a'),(96,'a'),(1,'b'),(4,'b'),(7,'b'),(10,'b'),(13,'b'),(16,'b'),(19,'b'),(22,'b'),(25,'b'),(28,'b'),(31,'b'),(34,'b'),(37,'b'),(40,'b'),(43,'b'),(46,'b'),(49,'b'),(52,'b'),(55,'b'),(58,'b'),(61,'b'),(64,'b'),(67,'b'),(70,'b'),(73,'b'),(76,'b'),(79,'b'),(82,'b'),(85,'b'),(88,'b'),(91,'b'),(94,'b'),(97,'b'),(2,'c'),(5,'c'),(8,'c'),(11,'c'),(14,'c'),(17,'c'),(20,'c'),(23,'c'),(26,'c'),(29,'c'),(32,'c'),(35,'c'),(38,'c'),(41,'c'),(44,'c'),(47,'c'),(50,'c'),(53,'c'),(56,'c'),(59,'c'),(62,'c'),(65,'c'),(68,'c'),(71,'c'),(74,'c'),(77,'c'),(80,'c'),(83,'c'),(86,'c'),(89,'c'),(92,'c'),(95,'c'),(98,'c');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: products
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: shops
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: tags
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: users
# ------------------------------------------------------------


/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
