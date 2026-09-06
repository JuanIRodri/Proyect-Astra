SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS `Maniqui`;
USE `Maniqui`;

-- Estructura de tabla para `Boca`
CREATE TABLE `Boca` (
  `idBoca` int(11) NOT NULL AUTO_INCREMENT,
  `Forma` varchar(45) DEFAULT NULL,
  `Tamanio` varchar(45) DEFAULT NULL,
  `Color` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idBoca`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estructura de tabla para `Cabello`
CREATE TABLE `Cabello` (
  `idCabello` int(11) NOT NULL AUTO_INCREMENT,
  `Corte` varchar(45) NOT NULL,
  `Tinte` varchar(45) NOT NULL,
  PRIMARY KEY (`idCabello`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estructura de tabla para `Cejas`
CREATE TABLE `Cejas` (
  `idCejas` int(11) NOT NULL AUTO_INCREMENT,
  `Tinte` varchar(45) DEFAULT NULL,
  `Forma` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idCejas`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estructura de tabla para `Cuernos`
CREATE TABLE `Cuernos` (
  `idCuernos` int(11) NOT NULL AUTO_INCREMENT,
  `Cantidad` varchar(45) DEFAULT NULL,
  `Tamanio` varchar(45) DEFAULT NULL,
  `Color` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idCuernos`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estructura de tabla para `FormaBrazo`
CREATE TABLE `FormaBrazo` (
  `idFormaBrazo` int(11) NOT NULL AUTO_INCREMENT,
  `Tamanio` int(11) NOT NULL,
  `Tipo` varchar(45) NOT NULL,
  `color` varchar(45) NOT NULL,
  PRIMARY KEY (`idFormaBrazo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estructura de tabla para `Nariz`
CREATE TABLE `Nariz` (
  `idNariz` int(11) NOT NULL AUTO_INCREMENT,
  `Forma` varchar(45) NOT NULL,
  `Tamanio` varchar(45) NOT NULL,
  PRIMARY KEY (`idNariz`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estructura de tabla para `Pestanias`
CREATE TABLE `Pestanias` (
  `idPestanias` int(11) NOT NULL AUTO_INCREMENT,
  `Forma` varchar(45) DEFAULT NULL,
  `Tamanio` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idPestanias`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estructura de tabla para `Pierna`
CREATE TABLE `Pierna` (
  `idPierna` int(11) NOT NULL AUTO_INCREMENT,
  `Tamanio` int(11) NOT NULL,
  `Tipo` varchar(45) NOT NULL,
  PRIMARY KEY (`idPierna`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estructura de tabla para `Torso`
CREATE TABLE `Torso` (
  `idTorso` int(11) NOT NULL AUTO_INCREMENT,
  `Forma` varchar(45) DEFAULT NULL,
  `Tamanio` varchar(45) DEFAULT NULL,
  `Bello` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`idTorso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estructura de tabla para `Brazo`
CREATE TABLE `Brazo` (
  `idBrazo` int(11) NOT NULL AUTO_INCREMENT,
  `Cantidad` int(11) DEFAULT NULL,
  `idFormaBrazo` int(11) NOT NULL,
  PRIMARY KEY (`idBrazo`),
  KEY `fk_brazo_formabrazo` (`idFormaBrazo`),
  CONSTRAINT `fk_brazo_formabrazo` FOREIGN KEY (`idFormaBrazo`) REFERENCES `FormaBrazo` (`idFormaBrazo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estructura de tabla para `Ojos`
CREATE TABLE `Ojos` (
  `idOjos` int(11) NOT NULL AUTO_INCREMENT,
  `idPestanias` int(11) NOT NULL,
  `idCejas` int(11) NOT NULL,
  `Color` varchar(45) NOT NULL,
  `Forma` varchar(45) NOT NULL,
  `Tamanio` varchar(45) NOT NULL,
  PRIMARY KEY (`idOjos`),
  KEY `fk_ojos_pestanias` (`idPestanias`),
  KEY `fk_ojos_cejas` (`idCejas`),
  CONSTRAINT `fk_ojos_cejas` FOREIGN KEY (`idCejas`) REFERENCES `Cejas` (`idCejas`),
  CONSTRAINT `fk_ojos_pestanias` FOREIGN KEY (`idPestanias`) REFERENCES `Pestanias` (`idPestanias`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estructura de tabla para `Cabeza`
CREATE TABLE `Cabeza` (
  `idCabeza` int(11) NOT NULL AUTO_INCREMENT,
  `idOJos` int(11) NOT NULL,
  `idCabello` int(11) NOT NULL,
  `idBoca` int(11) NOT NULL,
  `idNariz` int(11) NOT NULL,
  `idCuernos` int(11) NOT NULL,
  `Forma` varchar(45) NOT NULL,
  PRIMARY KEY (`idCabeza`),
  KEY `fk_cabeza_ojos` (`idOJos`),
  KEY `fk_cabeza_cabello` (`idCabello`),
  KEY `fk_cabeza_boca` (`idBoca`),
  KEY `fk_cabeza_nariz` (`idNariz`),
  KEY `fk_cabeza_cuernos` (`idCuernos`),
  CONSTRAINT `fk_cabeza_boca` FOREIGN KEY (`idBoca`) REFERENCES `Boca` (`idBoca`),
  CONSTRAINT `fk_cabeza_cabello` FOREIGN KEY (`idCabello`) REFERENCES `Cabello` (`idCabello`),
  CONSTRAINT `fk_cabeza_cuernos` FOREIGN KEY (`idCuernos`) REFERENCES `Cuernos` (`idCuernos`),
  CONSTRAINT `fk_cabeza_nariz` FOREIGN KEY (`idNariz`) REFERENCES `Nariz` (`idNariz`),
  CONSTRAINT `fk_cabeza_ojos` FOREIGN KEY (`idOJos`) REFERENCES `Ojos` (`idOjos`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estructura de tabla para `Cuerpo`
CREATE TABLE `Cuerpo` (
  `idCuerpo` int(11) NOT NULL AUTO_INCREMENT,
  `idBrazo` int(11) NOT NULL,
  `idPierna` int(11) NOT NULL,
  `idTorso` int(11) NOT NULL,
  `idCabeza` int(11) NOT NULL,
  PRIMARY KEY (`idCuerpo`),
  KEY `fk_cuerpo_brazo` (`idBrazo`),
  KEY `fk_cuerpo_pierna` (`idPierna`),
  KEY `fk_cuerpo_torso` (`idTorso`),
  KEY `fk_cuerpo_cabeza` (`idCabeza`),
  CONSTRAINT `fk_cuerpo_brazo` FOREIGN KEY (`idBrazo`) REFERENCES `Brazo` (`idBrazo`),
  CONSTRAINT `fk_cuerpo_cabeza` FOREIGN KEY (`idCabeza`) REFERENCES `Cabeza` (`idCabeza`),
  CONSTRAINT `fk_cuerpo_pierna` FOREIGN KEY (`idPierna`) REFERENCES `Pierna` (`idPierna`),
  CONSTRAINT `fk_cuerpo_torso` FOREIGN KEY (`idTorso`) REFERENCES `Torso` (`idTorso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estructura de tabla para `Personaje`
CREATE TABLE `Personaje` (
  `idPersonaje` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `clase` varchar(50) DEFAULT NULL,
  `nivel` int(11) DEFAULT 1,
  `altura` int(11) DEFAULT NULL,
  `musculatura` int(11) DEFAULT NULL,
  `idCuerpo` int(11) NOT NULL,
  PRIMARY KEY (`idPersonaje`),
  KEY `fk_personaje_cuerpo` (`idCuerpo`),
  CONSTRAINT `fk_personaje_cuerpo` FOREIGN KEY (`idCuerpo`) REFERENCES `Cuerpo` (`idCuerpo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estructura de tabla para `Estadistica`
CREATE TABLE `Estadistica` (
  `idPersonaje` int(11) NOT NULL,
  `fuerza` int(11) DEFAULT 10,
  `destreza` int(11) DEFAULT 10,
  `inteligencia` int(11) DEFAULT 10,
  `constitucion` int(11) DEFAULT 10,
  `agilidad` int(11) DEFAULT 10,
  PRIMARY KEY (`idPersonaje`),
  CONSTRAINT `fk_estadistica_personaje` FOREIGN KEY (`idPersonaje`) REFERENCES `Personaje` (`idPersonaje`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Objeto` (
  `idObjeto` int(11) NOT NULL AUTO_INCREMENT,
  `clave` varchar(80) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `categoria` varchar(50) NOT NULL,
  `rareza` varchar(30) NOT NULL,
  `peso` decimal(6,2) NOT NULL DEFAULT 0,
  `icono` varchar(10) NOT NULL,
  `consumible` tinyint(1) NOT NULL DEFAULT 0,
  `efectoVida` int(11) NOT NULL DEFAULT 0,
  `maxPila` int(11) NOT NULL DEFAULT 99,
  `tipoEquipamiento` varchar(20) DEFAULT NULL,
  `bonusFuerza` int(11) NOT NULL DEFAULT 0,
  `bonusDestreza` int(11) NOT NULL DEFAULT 0,
  `bonusInteligencia` int(11) NOT NULL DEFAULT 0,
  `bonusConstitucion` int(11) NOT NULL DEFAULT 0,
  `bonusAgilidad` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`idObjeto`),
  UNIQUE KEY `uk_objeto_clave` (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Equipamiento` (
  `idPersonaje` int(11) NOT NULL,
  `ranura` varchar(20) NOT NULL,
  `idObjeto` int(11) NOT NULL,
  PRIMARY KEY (`idPersonaje`, `ranura`),
  KEY `fk_equipamiento_objeto` (`idObjeto`),
  CONSTRAINT `fk_equipamiento_personaje` FOREIGN KEY (`idPersonaje`) REFERENCES `Personaje` (`idPersonaje`) ON DELETE CASCADE,
  CONSTRAINT `fk_equipamiento_objeto` FOREIGN KEY (`idObjeto`) REFERENCES `Objeto` (`idObjeto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Inventario` (
  `idPersonaje` int(11) NOT NULL,
  `ranura` int(11) NOT NULL,
  `idObjeto` int(11) DEFAULT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`idPersonaje`, `ranura`),
  KEY `fk_inventario_objeto` (`idObjeto`),
  CONSTRAINT `fk_inventario_personaje` FOREIGN KEY (`idPersonaje`) REFERENCES `Personaje` (`idPersonaje`) ON DELETE CASCADE,
  CONSTRAINT `fk_inventario_objeto` FOREIGN KEY (`idObjeto`) REFERENCES `Objeto` (`idObjeto`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

