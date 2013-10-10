drop table if exists `promotion`.`Current`;

DROP TABLE if exists `promotion`.`Suppliers`;

CREATE TABLE `promotion`.`Suppliers` (
  `id` int(11) NOT NULL,
  `Name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `promotion`.`Current` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supplierId` int(11) DEFAULT NULL,
  `content` varchar(255) DEFAULT NULL,
  `category` varchar(45) DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `supplierId_idx` (`supplierId`),
  CONSTRAINT `supplierId` FOREIGN KEY (`supplierId`) REFERENCES `Suppliers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;