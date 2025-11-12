-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: gestion_proyectos
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `entregables`
--

DROP TABLE IF EXISTS `entregables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entregables` (
  `id_entregable` int NOT NULL AUTO_INCREMENT,
  `id_proyecto` int DEFAULT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `fecha_entrega` date NOT NULL,
  `estado` enum('pendiente','en_progreso','completado') DEFAULT 'pendiente',
  `id_usuario` int DEFAULT NULL,
  `id_nota` int DEFAULT NULL,
  PRIMARY KEY (`id_entregable`),
  KEY `fk_entregable_proyecto` (`id_proyecto`),
  KEY `fk_entregable_usuario` (`id_usuario`),
  KEY `fk_entregable_nota` (`id_nota`),
  CONSTRAINT `fk_entregable_nota` FOREIGN KEY (`id_nota`) REFERENCES `notas` (`id_nota`),
  CONSTRAINT `fk_entregable_proyecto` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id`),
  CONSTRAINT `fk_entregable_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entregables`
--

LOCK TABLES `entregables` WRITE;
/*!40000 ALTER TABLE `entregables` DISABLE KEYS */;
INSERT INTO `entregables` VALUES (1,1,'Informe Técnico','Documento que resume el avance del proyecto','2025-04-15','completado',1,1),(2,1,'Manual de Usuario','Guía de uso del sistema académico','2025-05-20','completado',2,2),(3,2,'Mockups de la App','Diseño visual y flujo de usuario','2025-05-20','en_progreso',3,NULL),(4,3,'Repositorio Git','Entrega del código fuente del portal','2025-10-15','pendiente',2,NULL),(5,4,'Informe de Pruebas','Reporte de resultados de test unitarios','2025-06-30','pendiente',6,6),(6,5,'Prototipo RRHH','Primer prototipo funcional','2025-07-05','en_progreso',7,7),(7,2,'Presentación Final','Diapositivas con resumen del proyecto','2025-07-20','pendiente',4,NULL);
/*!40000 ALTER TABLE `entregables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notas`
--

DROP TABLE IF EXISTS `notas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notas` (
  `id_nota` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_proyecto` int NOT NULL,
  `evaluacion` varchar(80) NOT NULL,
  `nota` decimal(3,2) NOT NULL,
  `porcentaje` smallint NOT NULL,
  `fecha` date DEFAULT NULL,
  `observaciones` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_nota`),
  KEY `fk_nota_usuario` (`id_usuario`),
  KEY `fk_nota_proyecto` (`id_proyecto`),
  CONSTRAINT `fk_nota_proyecto` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id`),
  CONSTRAINT `fk_nota_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notas`
--

LOCK TABLES `notas` WRITE;
/*!40000 ALTER TABLE `notas` DISABLE KEYS */;
INSERT INTO `notas` VALUES (1,1,1,'Entrega final',4.80,30,'2025-05-30','Excelente resultado final.'),(2,2,1,'Documentación técnica',4.50,20,'2025-05-25','Documentación detallada y clara.'),(3,3,2,'Desarrollo backend',4.20,25,'2025-07-10','Cumple con los requisitos funcionales.'),(4,4,2,'Diseño UI',3.90,15,'2025-06-30','Necesita mejorar consistencia visual.'),(5,5,3,'Propuesta inicial',4.00,10,'2025-06-10','Propuesta aceptada sin observaciones.'),(6,6,4,'Entrega intermedia',4.60,25,'2025-05-15','Buen avance general.'),(7,7,5,'Análisis de requerimientos',4.70,20,'2025-04-20','Bien estructurado y completo.');
/*!40000 ALTER TABLE `notas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proyectos`
--

DROP TABLE IF EXISTS `proyectos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proyectos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `integrantes` json DEFAULT NULL,
  `estado` enum('activo','completado','pendiente') DEFAULT 'pendiente',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proyectos`
--

LOCK TABLES `proyectos` WRITE;
/*!40000 ALTER TABLE `proyectos` DISABLE KEYS */;
INSERT INTO `proyectos` VALUES (1,'Sistema de Gestión Académica','Desarrollo de una plataforma para gestionar notas y estudiantes','2025-01-15','2025-05-30','[1, 2, 3]','completado','2025-10-29 21:10:43','2025-11-11 23:32:04'),(2,'App de Tareas Colaborativas','Aplicación web para asignación y seguimiento de tareas de equipo','2025-03-01','2025-07-15','[4, 5, 6]','activo','2025-10-29 21:10:43','2025-11-11 23:32:04'),(3,'Portal de Proyectos Universitarios','Sitio web para registrar y evaluar proyectos finales','2025-06-01','2025-11-30','[2, 3, 7]','pendiente','2025-10-29 21:10:43','2025-11-11 23:32:04'),(4,'Control de Inventarios','Sistema para administrar productos, stock y proveedores','2025-02-10','2025-06-25','[8, 9, 10]','activo','2025-10-29 21:10:43','2025-11-11 23:32:04'),(5,'Gestión de Recursos Humanos','Aplicación para registrar empleados y gestionar nómina','2025-04-01','2025-09-30','[5, 6]','pendiente','2025-10-29 21:10:43','2025-11-11 23:32:04');
/*!40000 ALTER TABLE `proyectos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tareas`
--

DROP TABLE IF EXISTS `tareas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tareas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `materia` varchar(100) NOT NULL,
  `descripcion` text,
  `fecha_vencimiento` date NOT NULL,
  `estado` enum('pendiente','completada','urgente') DEFAULT 'pendiente',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tareas`
--

LOCK TABLES `tareas` WRITE;
/*!40000 ALTER TABLE `tareas` DISABLE KEYS */;
INSERT INTO `tareas` VALUES (1,'Diseñar interfaz del portal','Diseño Web','Crear prototipo de la página principal','2025-04-10','completada','2025-10-29 21:10:43'),(2,'Configurar base de datos MySQL','Bases de Datos','Diseñar tablas y relaciones del sistema','2025-05-01','pendiente','2025-10-29 21:10:43'),(3,'Implementar autenticación','Programación Web','Desarrollar módulo de login y registro','2025-06-20','urgente','2025-10-29 21:10:43'),(4,'Crear API REST','Backend','Programar endpoints para proyectos y usuarios','2025-05-10','completada','2025-10-29 21:10:43'),(5,'Diseñar dashboard de usuario','Frontend','Maquetar panel visual con estadísticas','2025-05-20','pendiente','2025-10-29 21:10:43'),(6,'Validar formularios','Programación Web','Agregar validaciones en cliente y servidor','2025-07-15','pendiente','2025-10-29 21:10:43'),(7,'Pruebas unitarias','Calidad de Software','Implementar pruebas en Jest','2025-08-05','pendiente','2025-10-29 21:10:43'),(8,'Optimizar consultas SQL','Bases de Datos','Analizar índices y tiempos de respuesta','2025-06-15','completada','2025-10-29 21:10:43'),(9,'Diseñar logotipo','Diseño Gráfico','Crear imagen corporativa para el sistema','2025-03-30','completada','2025-10-29 21:10:43');
/*!40000 ALTER TABLE `tareas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_roles`
--

DROP TABLE IF EXISTS `usuario_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_roles` (
  `idUsuario_Roles` int NOT NULL,
  `id_usuario` int DEFAULT NULL,
  `roles` enum('estudiante','docente','administrador') NOT NULL,
  PRIMARY KEY (`idUsuario_Roles`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_roles`
--

LOCK TABLES `usuario_roles` WRITE;
/*!40000 ALTER TABLE `usuario_roles` DISABLE KEYS */;
INSERT INTO `usuario_roles` VALUES (1,1,'estudiante'),(2,2,'docente'),(3,3,'administrador'),(4,4,'estudiante'),(5,5,'estudiante'),(6,6,'docente'),(7,7,'docente'),(8,8,'estudiante'),(9,9,'docente'),(10,10,'administrador'),(11,11,'estudiante'),(12,12,'estudiante'),(13,14,'estudiante');
/*!40000 ALTER TABLE `usuario_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `id_usuarios_roles` int DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`),
  KEY `fk_usuario_rol` (`id_usuarios_roles`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_usuarios_roles`) REFERENCES `usuario_roles` (`idUsuario_Roles`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Ana Martínez','ana.martinez@empresa.com',1,'ana123'),(2,'Carlos Gómez','carlos.gomez@empresa.com',2,'carlitos'),(3,'Lucía Ramírez','lucia.ramirez@empresa.com',2,'luciaR'),(4,'Juan Torres','juan.torres@empresa.com',3,'juanT'),(5,'Sofía Delgado','sofia.delgado@empresa.com',1,'sof123'),(6,'Pedro Pineda','pedro.pineda@empresa.com',3,'pedroP'),(7,'Valentina López','valentina.lopez@empresa.com',2,'valenL'),(8,'Miguel Suárez','miguel.suarez@empresa.com',2,'migueS'),(9,'Diana Cárdenas','diana.cardenas@empresa.com',3,'dianaC'),(10,'Andrés Rojas','andres.rojas@empresa.com',3,'andresR'),(11,'PruebaPost Usuario','prueba_post@example.com',1,'$2a$10$5vgjIa5GVSMF1E47hm00NePsOVYS9LTI11FTEpNq1ZAYh/cs0jPUO'),(12,'DupTest User','duptest@example.com',1,'$2a$10$OH.aRDFyqUNHpTKaOnVhOuDrJD/PUOtBramKlqm0G7dITQuM3F6r6'),(14,'DupTest2 User','duptest2@example.com',1,'$2a$10$lC56Y0vQmu8e528IqLh3oezIeWeUmVVf4O.kakQF30gTgjUEdJWXO'),(16,'andres contreras','andres@gmail.com',1,'$2a$10$lK0.Gfpx63pw/LPvpjV7jumnetyNsDROG.CplsA5dsSZrnGy470Ka'),(17,'mary luz','mary@gmail.com',2,'$2a$10$vECILMv2rHKtGy5dEpktQ.1n8ULSpL3bZJVIz7qt92fZeIq3piG3.'),(18,'chamorro un','chamorro@gmail.com',1,'$2a$10$iAS05uH2AE3ApoK0AdDyDulQAcm1FblMLFXMJuaGmy5qrZrqKzCjK'),(19,'andres xontreras','andresx@gmail.com',1,'$2a$10$cf4.e952/ee3w/IMrFO7BeGN7aeBWFgLmgY3VsUGRDm9MRSAz/Ph.'),(20,'ligia pineda','ligia@gmail.com',2,'$2a$10$jeyMk8c.cc6umVA0Hy3mieO47CDsoFW4nSdaGg0CSCiN9raROl6z2');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-11 19:22:53
