# PROYECTO - Gestión de Proyectos (frontend + backend)

Instrucciones rápidas para ejecutar el proyecto localmente (Windows):

Requisitos:
- Node.js 16+ y npm
- MySQL con una base de datos `gestion_proyectos` y tablas mínimas: `usuarios`, `proyectos`, `tareas`.

Instalación:

1. Abrir PowerShell en la carpeta del proyecto.

2. Instalar dependencias:

```
npm install
```

3. Crear tablas mínimas (ejemplo SQL):

- Tabla usuarios:

```
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL
);
```

- Tabla proyectos y tareas según `server.js` uso básico.

4. Iniciar servidor:

```
npm start
```

5. Crear usuarios de prueba (desde Postman o curl):

```
POST http://localhost:3000/init-user
Content-Type: application/json

{ "username": "estudiante", "password": "est123", "role": "Estudiante" }
{ "username": "docente", "password": "doc123", "role": "Docente" }
{ "username": "admin", "password": "admin123", "role": "Admin" }
```

6. Abrir http://localhost:3000/login.html e iniciar sesión.

Notas:
- En producción, cambie el secreto de sesión y use HTTPS.
- Esta es una implementación mínima para desarrollo local.
