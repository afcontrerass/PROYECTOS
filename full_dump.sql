-- Dump completo de gestion_proyectos
-- Generado por scripts/export_full_dump.js
-- Fecha: 2025-11-05T21:27:00.768Z

SET FOREIGN_KEY_CHECKS=0;

-- Tabla: entregables

DROP TABLE IF EXISTS `entregables`;
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

INSERT INTO `entregables` (`id_entregable`, `id_proyecto`, `nombre`, `descripcion`, `fecha_entrega`, `estado`, `id_usuario`, `id_nota`) VALUES
(1, 1, 'Informe Técnico', 'Documento que resume el avance del proyecto', '\"2025-04-15T07:00:00.000Z\"', 'completado', 1, 1),
(2, 1, 'Manual de Usuario', 'Guía de uso del sistema académico', '\"2025-05-20T07:00:00.000Z\"', 'completado', 2, 2),
(3, 2, 'Mockups de la App', 'Diseño visual y flujo de usuario', '\"2025-05-20T07:00:00.000Z\"', 'en_progreso', 3, NULL),
(4, 3, 'Repositorio Git', 'Entrega del código fuente del portal', '\"2025-10-15T07:00:00.000Z\"', 'pendiente', 2, NULL),
(5, 4, 'Informe de Pruebas', 'Reporte de resultados de test unitarios', '\"2025-06-30T07:00:00.000Z\"', 'pendiente', 6, 6),
(6, 5, 'Prototipo RRHH', 'Primer prototipo funcional', '\"2025-07-05T07:00:00.000Z\"', 'en_progreso', 7, 7),
(7, 2, 'Presentación Final', 'Diapositivas con resumen del proyecto', '\"2025-07-20T07:00:00.000Z\"', 'pendiente', 4, NULL);

-- Tabla: notas

DROP TABLE IF EXISTS `notas`;
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

INSERT INTO `notas` (`id_nota`, `id_usuario`, `id_proyecto`, `evaluacion`, `nota`, `porcentaje`, `fecha`, `observaciones`) VALUES
(1, 1, 1, 'Entrega final', '4.80', 30, '\"2025-05-30T07:00:00.000Z\"', 'Excelente resultado final.'),
(2, 2, 1, 'Documentación técnica', '4.50', 20, '\"2025-05-25T07:00:00.000Z\"', 'Documentación detallada y clara.'),
(3, 3, 2, 'Desarrollo backend', '4.20', 25, '\"2025-07-10T07:00:00.000Z\"', 'Cumple con los requisitos funcionales.'),
(4, 4, 2, 'Diseño UI', '3.90', 15, '\"2025-06-30T07:00:00.000Z\"', 'Necesita mejorar consistencia visual.'),
(5, 5, 3, 'Propuesta inicial', '4.00', 10, '\"2025-06-10T07:00:00.000Z\"', 'Propuesta aceptada sin observaciones.'),
(6, 6, 4, 'Entrega intermedia', '4.60', 25, '\"2025-05-15T07:00:00.000Z\"', 'Buen avance general.'),
(7, 7, 5, 'Análisis de requerimientos', '4.70', 20, '\"2025-04-20T07:00:00.000Z\"', 'Bien estructurado y completo.');

-- Tabla: proyectos

DROP TABLE IF EXISTS `proyectos`;
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

INSERT INTO `proyectos` (`id`, `titulo`, `descripcion`, `fecha_inicio`, `fecha_fin`, `integrantes`, `estado`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Sistema de Gestión Académica', 'Desarrollo de una plataforma para gestionar notas y estudiantes', '\"2025-01-15T08:00:00.000Z\"', '\"2025-05-30T07:00:00.000Z\"', '[\"Ana Martínez\",\"Carlos Gómez\",\"Lucía Ramírez\"]', 'completado', '\"2025-10-29T21:10:43.000Z\"', '\"2025-10-29T21:10:43.000Z\"'),
(2, 'App de Tareas Colaborativas', 'Aplicación web para asignación y seguimiento de tareas de equipo', '\"2025-03-01T08:00:00.000Z\"', '\"2025-07-15T07:00:00.000Z\"', '[\"Juan Torres\",\"Sofía Delgado\",\"Pedro Pineda\"]', 'activo', '\"2025-10-29T21:10:43.000Z\"', '\"2025-10-29T21:10:43.000Z\"'),
(3, 'Portal de Proyectos Universitarios', 'Sitio web para registrar y evaluar proyectos finales', '\"2025-06-01T07:00:00.000Z\"', '\"2025-11-30T08:00:00.000Z\"', '[\"Carlos Gómez\",\"Lucía Ramírez\",\"Valentina López\"]', 'pendiente', '\"2025-10-29T21:10:43.000Z\"', '\"2025-10-29T21:10:43.000Z\"'),
(4, 'Control de Inventarios', 'Sistema para administrar productos, stock y proveedores', '\"2025-02-10T08:00:00.000Z\"', '\"2025-06-25T07:00:00.000Z\"', '[\"Miguel Suárez\",\"Diana Cárdenas\",\"Andrés Rojas\"]', 'activo', '\"2025-10-29T21:10:43.000Z\"', '\"2025-10-29T21:10:43.000Z\"'),
(5, 'Gestión de Recursos Humanos', 'Aplicación para registrar empleados y gestionar nómina', '\"2025-04-01T07:00:00.000Z\"', '\"2025-09-30T07:00:00.000Z\"', '[\"Sofía Delgado\",\"Pedro Pineda\"]', 'pendiente', '\"2025-10-29T21:10:43.000Z\"', '\"2025-10-29T21:10:43.000Z\"');

-- Tabla: tareas

DROP TABLE IF EXISTS `tareas`;
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

INSERT INTO `tareas` (`id`, `titulo`, `materia`, `descripcion`, `fecha_vencimiento`, `estado`, `fecha_creacion`) VALUES
(1, 'Diseñar interfaz del portal', 'Diseño Web', 'Crear prototipo de la página principal', '\"2025-04-10T07:00:00.000Z\"', 'completada', '\"2025-10-29T21:10:43.000Z\"'),
(2, 'Configurar base de datos MySQL', 'Bases de Datos', 'Diseñar tablas y relaciones del sistema', '\"2025-05-01T07:00:00.000Z\"', 'pendiente', '\"2025-10-29T21:10:43.000Z\"'),
(3, 'Implementar autenticación', 'Programación Web', 'Desarrollar módulo de login y registro', '\"2025-06-20T07:00:00.000Z\"', 'urgente', '\"2025-10-29T21:10:43.000Z\"'),
(4, 'Crear API REST', 'Backend', 'Programar endpoints para proyectos y usuarios', '\"2025-05-10T07:00:00.000Z\"', 'completada', '\"2025-10-29T21:10:43.000Z\"'),
(5, 'Diseñar dashboard de usuario', 'Frontend', 'Maquetar panel visual con estadísticas', '\"2025-05-20T07:00:00.000Z\"', 'pendiente', '\"2025-10-29T21:10:43.000Z\"'),
(6, 'Validar formularios', 'Programación Web', 'Agregar validaciones en cliente y servidor', '\"2025-07-15T07:00:00.000Z\"', 'pendiente', '\"2025-10-29T21:10:43.000Z\"'),
(7, 'Pruebas unitarias', 'Calidad de Software', 'Implementar pruebas en Jest', '\"2025-08-05T07:00:00.000Z\"', 'pendiente', '\"2025-10-29T21:10:43.000Z\"'),
(8, 'Optimizar consultas SQL', 'Bases de Datos', 'Analizar índices y tiempos de respuesta', '\"2025-06-15T07:00:00.000Z\"', 'completada', '\"2025-10-29T21:10:43.000Z\"'),
(9, 'Diseñar logotipo', 'Diseño Gráfico', 'Crear imagen corporativa para el sistema', '\"2025-03-30T07:00:00.000Z\"', 'completada', '\"2025-10-29T21:10:43.000Z\"');

-- Tabla: usuario_roles

DROP TABLE IF EXISTS `usuario_roles`;
CREATE TABLE `usuario_roles` (
  `idUsuario_Roles` int NOT NULL,
  `id_usuario` varchar(45) DEFAULT NULL,
  `roles` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idUsuario_Roles`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `usuario_roles` (`idUsuario_Roles`, `id_usuario`, `roles`) VALUES
(1, '1', 'estudiante'),
(2, '2', 'Gestor de proyectos'),
(3, '3', 'rector');

-- Tabla: usuarios

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `id_usuarios_roles` varchar(45) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `correo`, `id_usuarios_roles`, `password_hash`) VALUES
(1, 'Ana Martínez', 'ana.martinez@empresa.com', '1', 'ana123'),
(2, 'Carlos Gómez', 'carlos.gomez@empresa.com', '2', 'carlitos'),
(3, 'Lucía Ramírez', 'lucia.ramirez@empresa.com', '2', 'luciaR'),
(4, 'Juan Torres', 'juan.torres@empresa.com', '3', 'juanT'),
(5, 'Sofía Delgado', 'sofia.delgado@empresa.com', '1', 'sof123'),
(6, 'Pedro Pineda', 'pedro.pineda@empresa.com', '3', 'pedroP'),
(7, 'Valentina López', 'valentina.lopez@empresa.com', '2', 'valenL'),
(8, 'Miguel Suárez', 'miguel.suarez@empresa.com', '2', 'migueS'),
(9, 'Diana Cárdenas', 'diana.cardenas@empresa.com', '3', 'dianaC'),
(10, 'Andrés Rojas', 'andres.rojas@empresa.com', '3', 'andresR'),
(11, 'PruebaPost Usuario', 'prueba_post@example.com', '1', '$2a$10$5vgjIa5GVSMF1E47hm00NePsOVYS9LTI11FTEpNq1ZAYh/cs0jPUO'),
(12, 'DupTest User', 'duptest@example.com', '1', '$2a$10$OH.aRDFyqUNHpTKaOnVhOuDrJD/PUOtBramKlqm0G7dITQuM3F6r6'),
(14, 'DupTest2 User', 'duptest2@example.com', '1', '$2a$10$lC56Y0vQmu8e528IqLh3oezIeWeUmVVf4O.kakQF30gTgjUEdJWXO');

SET FOREIGN_KEY_CHECKS=1;
