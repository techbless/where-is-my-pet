-- --------------------------------------------------------
-- 호스트:                          localhost
-- 서버 버전:                        5.7.29 - MySQL Community Server (GPL)
-- 서버 OS:                        Linux
-- HeidiSQL 버전:                  10.2.0.5599
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- 테이블 laon.markers 구조 내보내기
CREATE TABLE IF NOT EXISTS `markers` (
  `m_id` int(11) NOT NULL AUTO_INCREMENT,
  `latitude` varchar(18) NOT NULL DEFAULT '0',
  `longitude` varchar(18) NOT NULL DEFAULT '0',
  `comment` varchar(1000) NOT NULL DEFAULT '0',
  `type` varchar(7) NOT NULL DEFAULT '0',
  `f_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `img_url` varchar(200) DEFAULT NULL,
  `auth` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`m_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- 내보낼 데이터가 선택되어 있지 않습니다.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
