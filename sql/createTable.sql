CREATE DATABASE IF NOT EXISTS promotion;

drop table if exists `promotion`.`Current`;

DROP TABLE if exists `promotion`.`Suppliers`;

DROP TABLE if exists `promotion`.`UpdateHistory`;

CREATE TABLE  `promotion`.`Suppliers` (
  `id` int(11) NOT NULL,
  `Name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE  `promotion`.`Current` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supplierId` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `newPrice` varchar(60) DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `oldPrice` varchar(60) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `save` int(11) DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `supplierId_idx` (`supplierId`),
  CONSTRAINT `supplierId` FOREIGN KEY (`supplierId`) REFERENCES `Suppliers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=41291 DEFAULT CHARSET=utf8;

CREATE TABLE  `promotion`.`UpdateHistory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `updateTime` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;


CREATE TABLE `promotion`.`Items` (
  `id` INT,
  `name` TEXT NOT NULL,
  PRIMARY KEY (`id`)
)
CHARACTER SET utf8;

CREATE TABLE  `promotion`.`QueryHistory` (
  `id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `querytime` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

