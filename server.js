const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 3000;

// ==========================
// 🔧 CONFIGURACIÓN GENERAL
// ==========================
app.use(cors({ 
    origin: true, 
    credentials: true 
}));
app.use(bodyParser.json());
app.use(session({
    secret: 'cambio-este-secreto-en-produccion',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 4, // 4 horas
        secure: false,
        httpOnly: true
    }
}));

// Servir archivos estáticos (frontend)
app.use(express.static(path.join(__dirname)));

// Logger de peticiones
app.use((req, res, next) => {
    const now = new Date().toISOString();
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    console.log(`[${now}] ${req.method} ${req.originalUrl} - ${ip}`);
    next();
});

// ==========================
// 💾 CONEXIÓN BASE DE DATOS
// ==========================
//const db = mysql.createConnection({
   // host: 'localhost',
   // user: 'root',
  //  password: 'root123',
  //  database: 'gestion_proyectos'
//});
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('❌ Error al conectar con la BD:', err);
        return;
    }
    console.log('✅ Conexión a MySQL establecida.');
});

// ==========================
// 🔐 MIDDLEWARES DE AUTENTICACIÓN
// ==========================
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        console.log('✅ Usuario autenticado:', req.session.user.nombre);
        return next();
    }
    console.log('❌ Usuario no autenticado');
    return res.status(401).json({ error: 'No autorizado' });
}

function permit(...roles) {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        
        const userRole = req.session.user.role;
        console.log('🔐 Verificando permisos:', {
            usuario: req.session.user.nombre,
            rol: userRole,
            rolesPermitidos: roles
        });
        
        // Normalizar roles para comparación (case-insensitive)
        const userRoleNormalized = userRole ? userRole.toLowerCase() : '';
        const rolesNormalized = roles.map(role => role.toLowerCase());
        
        if (rolesNormalized.includes(userRoleNormalized)) {
            console.log('✅ Permiso concedido');
            return next();
        }
        
        console.log('❌ Acceso denegado. Rol del usuario:', userRole, 'Roles permitidos:', roles);
        return res.status(403).json({ error: 'Permisos insuficientes' });
    };
}

// ==========================
// 🧱 CRUD PROYECTOS - CORREGIDO
// ==========================
app.get('/api/proyectos', requireAuth, (req, res) => {
    console.log('📋 Obteniendo lista de proyectos');
    db.query('SELECT * FROM proyectos', (err, results) => {
        if (err) {
            console.error('❌ Error al obtener proyectos:', err);
            return res.status(500).json({ error: err });
        }
        console.log(`✅ Proyectos encontrados: ${results.length}`);
        res.json(results);
    });
});

app.post('/api/proyectos', requireAuth, permit('docente', 'administrador'), (req, res) => {
    const { titulo, descripcion, fecha_inicio, fecha_fin, integrantes } = req.body;
    
    console.log('📦 Creando proyecto:', { 
        titulo, 
        integrantes,
        usuario: req.session.user.nombre 
    });
    
    // Validar campos requeridos
    if (!titulo || !fecha_inicio || !fecha_fin) {
        return res.status(400).json({ error: 'Título, fecha_inicio y fecha_fin son obligatorios' });
    }
    
    // Convertir array de integrantes a JSON
    const integrantesJSON = integrantes && integrantes.length > 0 
        ? JSON.stringify(integrantes) 
        : JSON.stringify([]);
    
    const sql = 'INSERT INTO proyectos (titulo, descripcion, fecha_inicio, fecha_fin, integrantes) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [titulo, descripcion, fecha_inicio, fecha_fin, integrantesJSON], (err, result) => {
        if (err) {
            console.error('❌ Error en BD al crear proyecto:', err);
            return res.status(500).json({ error: err });
        }
        console.log('✅ Proyecto creado ID:', result.insertId);
        res.json({ id: result.insertId, ...req.body });
    });
});

app.put('/api/proyectos/:id', requireAuth, permit('docente', 'administrador'), (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, fecha_inicio, fecha_fin, integrantes } = req.body;
    
    console.log('✏️ Editando proyecto ID:', id);
    
    // Convertir array de integrantes a JSON
    const integrantesJSON = integrantes && integrantes.length > 0 
        ? JSON.stringify(integrantes) 
        : JSON.stringify([]);
    
    const sql = 'UPDATE proyectos SET titulo=?, descripcion=?, fecha_inicio=?, fecha_fin=?, integrantes=? WHERE id=?';
    db.query(sql, [titulo, descripcion, fecha_inicio, fecha_fin, integrantesJSON, id], (err) => {
        if (err) {
            console.error('❌ Error en BD al actualizar proyecto:', err);
            return res.status(500).json({ error: err });
        }
        console.log('✅ Proyecto actualizado ID:', id);
        res.json({ id, ...req.body });
    });
});

app.delete('/api/proyectos/:id', requireAuth, permit('docente', 'administrador'), (req, res) => {
    const { id } = req.params;
    console.log('🗑️ Eliminando proyecto ID:', id);
    
    db.query('DELETE FROM proyectos WHERE id=?', [id], (err) => {
        if (err) {
            console.error('❌ Error en BD al eliminar proyecto:', err);
            return res.status(500).json({ error: err });
        }
        console.log('✅ Proyecto eliminado ID:', id);
        res.json({ message: 'Proyecto eliminado correctamente' });
    });
}); // ← ESTA ERA LA LLAVE QUE FALTABA

// ==========================
// 📋 CRUD TAREAS - CORREGIDO
// ==========================
app.get('/api/tareas', requireAuth, (req, res) => {
    console.log('📋 Obteniendo lista de tareas');
    db.query('SELECT * FROM tareas', (err, results) => {
        if (err) {
            console.error('❌ Error al obtener tareas:', err);
            return res.status(500).json({ error: err });
        }
        console.log(`✅ Tareas encontradas: ${results.length}`);
        res.json(results);
    });
});

// ==========================
// 📤 GESTIÓN DE ENTREGAS
// ==========================
app.post('/api/entregas', requireAuth, (req, res) => {
    const { id_tarea, archivo_url, comentarios } = req.body;
    const id_usuario = req.session.user.id;
    
    console.log('📤 Creando entrega:', { 
        id_tarea, 
        id_usuario: req.session.user.nombre 
    });
    
    const sql = 'INSERT INTO entregas (id_tarea, id_usuario, archivo_url, comentarios, fecha_entrega) VALUES (?, ?, ?, ?, NOW())';
    db.query(sql, [id_tarea, id_usuario, archivo_url, comentarios], (err, result) => {
        if (err) {
            console.error('❌ Error en BD al crear entrega:', err);
            return res.status(500).json({ error: err });
        }
        
        // Actualizar estado de la tarea a "completada"
        db.query('UPDATE tareas SET estado = "completada" WHERE id = ?', [id_tarea], (updateErr) => {
            if (updateErr) {
                console.error('❌ Error al actualizar estado de tarea:', updateErr);
            }
        });
        
        console.log('✅ Entrega creada ID:', result.insertId);
        res.json({ id: result.insertId, message: 'Entrega realizada exitosamente' });
    });
});

app.get('/api/dashboard/estadisticas', requireAuth, (req, res) => {
    const userId = req.session.user.id;
    
    console.log('📊 Obteniendo estadísticas para usuario:', userId);
    
    const queries = {
        tareasPendientes: `
            SELECT COUNT(*) as count 
            FROM tareas t 
            LEFT JOIN entregas e ON t.id = e.id_tarea AND e.id_usuario = ?
            WHERE e.id_entrega IS NULL 
            AND t.estado IN ('pendiente', 'urgente')
        `,
        
        archivosEntregados: `
            SELECT COUNT(*) as count 
            FROM entregas 
            WHERE id_usuario = ? 
            AND MONTH(fecha_entrega) = MONTH(CURRENT_DATE())
            AND YEAR(fecha_entrega) = YEAR(CURRENT_DATE())
        `,
        
        calificacionPromedio: `
            SELECT COALESCE(AVG(n.nota), 0) as promedio
            FROM notas n
            INNER JOIN entregas e ON n.id_entrega = e.id_entrega
            WHERE e.id_usuario = ?
        `
    };
    
    // Ejecutar todas las consultas
    db.query(queries.tareasPendientes, [userId], (err1, result1) => {
        if (err1) {
            console.error('❌ Error en tareas pendientes:', err1);
            return res.status(500).json({ error: err1 });
        }
        
        db.query(queries.archivosEntregados, [userId], (err2, result2) => {
            if (err2) {
                console.error('❌ Error en archivos entregados:', err2);
                return res.status(500).json({ error: err2 });
            }
            
            db.query(queries.calificacionPromedio, [userId], (err3, result3) => {
                if (err3) {
                    console.error('❌ Error en calificación promedio:', err3);
                    return res.status(500).json({ error: err3 });
                }
                
                // Asegurarnos de que todos los valores sean números
                const tareasPendientes = parseInt(result1[0]?.count) || 0;
                const archivosEntregados = parseInt(result2[0]?.count) || 0;
                const calificacionPromedio = parseFloat(result3[0]?.promedio) || 0;
                
                const estadisticas = {
                    tareasPendientes: tareasPendientes,
                    archivosEntregados: archivosEntregados,
                    calificacionPromedio: calificacionPromedio
                };
                
                console.log('✅ Estadísticas obtenidas:', estadisticas);
                res.json(estadisticas);
            });
        });
    });
});

// ==========================
// 📋 TAREAS POR USUARIO
// ==========================
app.get('/api/tareas/usuario', requireAuth, (req, res) => {
    const userId = req.session.user.id;
    
    console.log('📋 Obteniendo tareas para usuario:', userId);
    
    const sql = `
        SELECT t.*, 
               e.id_entrega,
               e.fecha_entrega as fecha_entrega_usuario,
               e.archivo_url,
               e.comentarios as comentarios_entrega
        FROM tareas t
        LEFT JOIN entregas e ON t.id = e.id_tarea AND e.id_usuario = ?
        ORDER BY 
            CASE 
                WHEN t.estado = 'urgente' THEN 1
                WHEN t.estado = 'pendiente' THEN 2
                ELSE 3
            END,
            t.fecha_vencimiento ASC
    `;
    
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener tareas del usuario:', err);
            return res.status(500).json({ error: err });
        }
        
        console.log(`✅ ${results.length} tareas obtenidas para usuario`);
        res.json(results);
    });
});

// ACTUALIZADO: Usar los mismos roles que en proyectos (case-insensitive)
app.post('/api/tareas', requireAuth, permit('docente', 'administrador'), (req, res) => {
    const { titulo, materia, descripcion, fecha_vencimiento, estado } = req.body;
    
    console.log('📦 Creando tarea:', { 
        titulo, 
        materia,
        usuario: req.session.user.nombre 
    });
    
    const sql = 'INSERT INTO tareas (titulo, materia, descripcion, fecha_vencimiento, estado) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [titulo, materia, descripcion, fecha_vencimiento, estado || 'pendiente'], (err, result) => {
        if (err) {
            console.error('❌ Error en BD al crear tarea:', err);
            return res.status(500).json({ error: err });
        }
        console.log('✅ Tarea creada ID:', result.insertId);
        res.json({ id: result.insertId, ...req.body });
    });
});

app.put('/api/tareas/:id', requireAuth, permit('docente', 'administrador'), (req, res) => {
    const { id } = req.params;
    const { titulo, materia, descripcion, fecha_vencimiento, estado } = req.body;
    
    console.log('✏️ Editando tarea ID:', id);
    
    const sql = 'UPDATE tareas SET titulo=?, materia=?, descripcion=?, fecha_vencimiento=?, estado=? WHERE id=?';
    db.query(sql, [titulo, materia, descripcion, fecha_vencimiento, estado, id], (err) => {
        if (err) {
            console.error('❌ Error en BD al actualizar tarea:', err);
            return res.status(500).json({ error: err });
        }
        console.log('✅ Tarea actualizada ID:', id);
        res.json({ id, ...req.body });
    });
});

app.delete('/api/tareas/:id', requireAuth, permit('docente', 'administrador'), (req, res) => {
    const { id } = req.params;
    console.log('🗑️ Eliminando tarea ID:', id);
    
    db.query('DELETE FROM tareas WHERE id=?', [id], (err) => {
        if (err) {
            console.error('❌ Error en BD al eliminar tarea:', err);
            return res.status(500).json({ error: err });
        }
        console.log('✅ Tarea eliminada ID:', id);
        res.json({ message: 'Tarea eliminada correctamente' });
    });
});




// ==========================
// 🔐 AUTENTICACIÓN
// ==========================

// REGISTRO
app.post('/register', async (req, res) => {
    const { nombre, correo, password, id_usuarios_roles } = req.body || {};

    if (!correo || !password || !nombre) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        // Verificar si el usuario ya existe
        db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], async (err, rows) => {
            if (err) return res.status(500).json({ message: 'Error al verificar usuario', error: err });
            if (rows.length > 0) return res.status(409).json({ message: 'El correo ya está registrado' });

            const password_hash = await bcrypt.hash(password, 10);
            const rolId = id_usuarios_roles || 1;

            const sql = 'INSERT INTO usuarios (nombre, correo, password_hash, id_usuarios_roles) VALUES (?, ?, ?, ?)';
            db.query(sql, [nombre, correo, password_hash, rolId], (err2, result) => {
                if (err2) return res.status(500).json({ message: 'Error al crear usuario', error: err2 });
                res.status(201).json({ message: 'Usuario registrado correctamente', id: result.insertId });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
});

// LOGIN
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: 'Correo y contraseña requeridos' });

    const sql = `
        SELECT u.id_usuario, u.nombre, u.correo, u.password_hash, ur.roles
        FROM usuarios u
        LEFT JOIN usuario_roles ur ON u.id_usuarios_roles = ur.idUsuario_Roles
        WHERE u.correo = ?
        LIMIT 1
    `;

    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en la consulta', detail: err });

        if (!results.length) return res.status(401).json({ error: 'Usuario no encontrado' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });

        req.session.user = {
            id: user.id_usuario,
            nombre: user.nombre,
            correo: user.correo,
            role: user.roles
        };

        console.log('🔑 Login exitoso:', {
            usuario: user.nombre,
            rol: user.roles
        });

        // Redirección según el rol
        let redirectUrl = '/indexestudiante.html';
        if (user.roles.toLowerCase().includes('docente') || user.roles.toLowerCase().includes('administrador')) {
            redirectUrl = '/indexdocente.html';
        }

        res.json({ success: true, redirect: redirectUrl, role: user.roles });
    });
});

// LOGOUT
app.post('/logout', (req, res) => {
    console.log('🚪 Cerrando sesión:', req.session.user?.nombre);
    req.session.destroy(err => {
        if (err) {
            console.error('❌ Error al cerrar sesión:', err);
            return res.status(500).json({ error: 'No se pudo cerrar sesión' });
        }
        res.json({ message: 'Sesión cerrada' });
    });
});

// USUARIO ACTUAL
app.get('/me', (req, res) => {
    if (req.session && req.session.user) {
        console.log('📋 Consultando usuario actual:', req.session.user.nombre);
        return res.json(req.session.user);
    }
    console.log('❌ No hay usuario autenticado');
    return res.status(401).json({ error: 'No autenticado' });
});
// ==========================
// 👥 GESTIÓN DE USUARIOS
// ==========================

// Obtener todos los usuarios
app.get('/api/usuarios', requireAuth, permit('docente', 'administrador'), (req, res) => {
    console.log('👥 Obteniendo lista de usuarios');
    
    const sql = `
        SELECT 
            u.id_usuario,
            u.nombre,
            u.correo,
            ur.roles
        FROM usuarios u
        LEFT JOIN usuario_roles ur ON u.id_usuarios_roles = ur.idUsuario_Roles
        ORDER BY u.nombre
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error al obtener usuarios:', err);
            return res.status(500).json({ error: 'Error en la base de datos: ' + err.message });
        }
        
        console.log(`✅ ${results.length} usuarios obtenidos`);
        res.json(results);
    });
});

// ==========================
// 📊 DASHBOARD DOCENTE
// ==========================

app.get('/api/dashboard/docente', requireAuth, permit('docente', 'administrador'), (req, res) => {
    console.log('📊 Obteniendo estadísticas para docente');
    
    const queries = {
        tareasPorCalificar: `
            SELECT COUNT(*) as count 
            FROM entregas e
            LEFT JOIN notas n ON e.id_entrega = n.id_entrega
            WHERE n.id_nota IS NULL
        `,
        
        alumnosInscritos: `
            SELECT COUNT(*) as count 
            FROM usuarios u
            INNER JOIN usuario_roles ur ON u.id_usuarios_roles = ur.idUsuario_Roles
            WHERE ur.roles = 'estudiante'
        `,
        
        proyectosEnCurso: `
            SELECT COUNT(*) as count 
            FROM proyectos 
            WHERE estado = 'activo'
        `
    };
    
    // Ejecutar todas las consultas
    db.query(queries.tareasPorCalificar, (err1, result1) => {
        if (err1) {
            console.error('❌ Error en tareas por calificar:', err1);
            return res.status(500).json({ error: err1 });
        }
        
        db.query(queries.alumnosInscritos, (err2, result2) => {
            if (err2) {
                console.error('❌ Error en alumnos inscritos:', err2);
                return res.status(500).json({ error: err2 });
            }
            
            db.query(queries.proyectosEnCurso, (err3, result3) => {
                if (err3) {
                    console.error('❌ Error en proyectos en curso:', err3);
                    return res.status(500).json({ error: err3 });
                }
                
                const estadisticas = {
                    tareasPorCalificar: parseInt(result1[0]?.count) || 0,
                    alumnosInscritos: parseInt(result2[0]?.count) || 0,
                    proyectosEnCurso: parseInt(result3[0]?.count) || 0
                };
                
                console.log('✅ Estadísticas docente obtenidas:', estadisticas);
                res.json(estadisticas);
            });
        });
    });
});

// ==========================
// 🚀 INICIAR SERVIDOR
// ==========================
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
// ==========================
// 📊 CALIFICACIONES ESTUDIANTE - CORREGIDO
// ==========================

// Obtener calificaciones del estudiante
app.get('/api/calificaciones/estudiante', requireAuth, (req, res) => {
    const userId = req.session.user.id;
    
    console.log('📊 Obteniendo calificaciones para estudiante:', userId);
    
    const sql = `
        SELECT 
            n.id_nota,
            n.evaluacion,
            n.nota,
            n.porcentaje,
            n.fecha,
            n.observaciones,
            p.titulo as proyecto_titulo,
            p.descripcion as proyecto_descripcion,
            p.fecha_inicio,
            p.fecha_fin,
            ur.roles,
            CASE 
                WHEN n.nota >= 4.5 THEN 'excelente'
                WHEN n.nota >= 4.0 THEN 'bueno'
                WHEN n.nota >= 3.5 THEN 'regular'
                ELSE 'bajo'
            END as categoria
        FROM notas n
        INNER JOIN proyectos p ON n.id_proyecto = p.id
        INNER JOIN usuarios u ON n.id_usuario = u.id_usuario
        INNER JOIN usuario_roles ur ON u.id_usuarios_roles = ur.idUsuario_Roles
        WHERE n.id_usuario = ?
        ORDER BY n.fecha DESC
    `;
    
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener calificaciones:', err);
            return res.status(500).json({ error: 'Error en la base de datos: ' + err.message });
        }
        
        console.log(`✅ ${results.length} calificaciones obtenidas`);
        res.json(results);
    });
});

// Obtener estadísticas de calificaciones
app.get('/api/calificaciones/estadisticas', requireAuth, (req, res) => {
    const userId = req.session.user.id;
    
    console.log('📈 Obteniendo estadísticas de calificaciones para:', userId);
    
    // Consulta más simple y robusta
    const sql = `
        SELECT 
            AVG(nota) as promedioGeneral,
            MAX(nota) as mejorCalificacion,
            MIN(nota) as peorCalificacion,
            COUNT(DISTINCT n.id_proyecto) as materiasActivas,
            COUNT(*) as totalCalificaciones,
            SUM(CASE WHEN nota >= 4.5 THEN 1 ELSE 0 END) as excelentes,
            SUM(CASE WHEN nota >= 4.0 AND nota < 4.5 THEN 1 ELSE 0 END) as buenos,
            SUM(CASE WHEN nota >= 3.5 AND nota < 4.0 THEN 1 ELSE 0 END) as regulares,
            SUM(CASE WHEN nota < 3.5 THEN 1 ELSE 0 END) as bajos
        FROM notas n
        WHERE n.id_usuario = ?
    `;
    
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener estadísticas:', err);
            return res.status(500).json({ error: 'Error en la base de datos: ' + err.message });
        }
        
        const stats = results[0] || {};
        const estadisticas = {
            promedioGeneral: parseFloat(stats.promedioGeneral) || 0,
            mejorCalificacion: parseFloat(stats.mejorCalificacion) || 0,
            peorCalificacion: parseFloat(stats.peorCalificacion) || 0,
            materiasActivas: stats.materiasActivas || 0,
            distribucion: {
                total: stats.totalCalificaciones || 0,
                excelentes: stats.excelentes || 0,
                buenos: stats.buenos || 0,
                regulares: stats.regulares || 0,
                bajos: stats.bajos || 0
            }
        };
        
        console.log('✅ Estadísticas de calificaciones obtenidas:', estadisticas);
        res.json(estadisticas);
    });
});

// Obtener calificaciones por periodo
app.get('/api/calificaciones/periodo/:periodo', requireAuth, (req, res) => {
    const userId = req.session.user.id;
    const { periodo } = req.params;
    
    console.log('📅 Obteniendo calificaciones para periodo:', periodo);
    
    // Consulta simplificada para periodos
    const sql = `
        SELECT 
            n.*,
            p.titulo,
            p.descripcion as proyecto_descripcion,
            CASE 
                WHEN n.nota >= 4.5 THEN 'excelente'
                WHEN n.nota >= 4.0 THEN 'bueno'
                WHEN n.nota >= 3.5 THEN 'regular'
                ELSE 'bajo'
            END as categoria
        FROM notas n
        INNER JOIN proyectos p ON n.id_proyecto = p.id
        WHERE n.id_usuario = ?
        ORDER BY n.fecha DESC
    `;
    
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener calificaciones por periodo:', err);
            return res.status(500).json({ error: 'Error en la base de datos: ' + err.message });
        }
        
        console.log(`✅ ${results.length} calificaciones para periodo ${periodo}`);
        res.json(results);
    });
});

// ==========================
// 📋 PROYECTOS ESTUDIANTE - OBTENER PROYECTOS DEL ESTUDIANTE
// ==========================
app.get('/api/proyectos/estudiante', requireAuth, (req, res) => {
    const userId = req.session.user.id;
    
    console.log('📋 Obteniendo proyectos para estudiante:', userId);
    
    const sql = `
        SELECT 
            p.id,
            p.titulo,
            p.descripcion,
            p.fecha_inicio,
            p.fecha_fin,
            p.integrantes,
            p.estado,
            p.fecha_creacion,
            p.fecha_actualizacion,
            CASE 
                WHEN CURDATE() > p.fecha_fin THEN 'completado'
                WHEN CURDATE() BETWEEN p.fecha_inicio AND p.fecha_fin THEN 'en_progreso'
                ELSE 'planificado'
            END as estado_actual,
            (SELECT COUNT(*) FROM entregables e WHERE e.id_proyecto = p.id) as total_entregables,
            (SELECT COUNT(*) FROM entregables e WHERE e.id_proyecto = p.id AND e.estado = 'completado') as entregables_completados
        FROM proyectos p
        WHERE JSON_CONTAINS(p.integrantes, CAST(? AS JSON))
        ORDER BY p.fecha_inicio DESC
    `;
    
    db.query(sql, [JSON.stringify(userId)], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener proyectos del estudiante:', err);
            return res.status(500).json({ error: 'Error en la base de datos: ' + err.message });
        }
        
        console.log(`✅ ${results.length} proyectos obtenidos para estudiante ${userId}`);
        
        // Procesar los resultados para parsear el campo integrantes
        const proyectosProcesados = results.map(proyecto => {
            try {
                return {
                    ...proyecto,
                    integrantes: proyecto.integrantes ? JSON.parse(proyecto.integrantes) : []
                };
            } catch (e) {
                return {
                    ...proyecto,
                    integrantes: []
                };
            }
        });
        
        res.json(proyectosProcesados);
    });
});

// Obtener entregables de un proyecto específico
app.get('/api/proyectos/:id/entregables', requireAuth, (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.id;
    
    console.log('📦 Obteniendo entregables para proyecto:', id);
    
    const sql = `
        SELECT 
            e.*,
            u.nombre as nombre_usuario,
            CASE 
                WHEN e.id_usuario = ? THEN true 
                ELSE false 
            END as es_mi_entrega
        FROM entregables e
        LEFT JOIN usuarios u ON e.id_usuario = u.id_usuario
        WHERE e.id_proyecto = ?
        ORDER BY e.fecha_entrega ASC
    `;
    
    db.query(sql, [userId, id], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener entregables:', err);
            return res.status(500).json({ error: 'Error en la base de datos: ' + err.message });
        }
        
        console.log(`✅ ${results.length} entregables obtenidos para proyecto ${id}`);
        res.json(results);
    });
});

// Entregar un entregable
app.post('/api/entregables/:id/entregar', requireAuth, (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.id;
    const { archivo_url, comentarios } = req.body;
    
    console.log('📤 Entregando entregable:', { id, userId });
    
    const sql = `
        UPDATE entregables 
        SET estado = 'completado', 
            id_usuario = ?,
            archivo_url = ?,
            comentarios_entrega = ?
        WHERE id_entregable = ?
    `;
    
    db.query(sql, [userId, archivo_url, comentarios, id], (err, result) => {
        if (err) {
            console.error('❌ Error al entregar:', err);
            return res.status(500).json({ error: 'Error en la base de datos: ' + err.message });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Entregable no encontrado' });
        }
        
        console.log('✅ Entregable completado ID:', id);
        res.json({ message: 'Entregable completado exitosamente' });
    });
});
// ==========================
// 📝 GESTIÓN DE CALIFICACIONES - DOCENTES
// ==========================

// Obtener todas las entregas pendientes de calificación
app.get('/api/entregas/pendientes', requireAuth, permit('docente', 'administrador'), (req, res) => {
    console.log('📋 Obteniendo entregas pendientes de calificación');
    
    const sql = `
        SELECT 
            e.id_entrega,
            e.id_tarea,
            e.id_usuario,
            e.archivo_url,
            e.comentarios,
            e.fecha_entrega,
            t.titulo as titulo_tarea,
            t.materia,
            t.descripcion as descripcion_tarea,
            u.nombre as nombre_estudiante,
            u.correo as correo_estudiante,
            n.nota as nota_actual,
            n.observaciones as observaciones_actual
        FROM entregas e
        INNER JOIN tareas t ON e.id_tarea = t.id
        INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
        LEFT JOIN notas n ON e.id_entrega = n.id_entrega
        WHERE n.id_nota IS NULL OR n.nota IS NULL
        ORDER BY e.fecha_entrega DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error al obtener entregas pendientes:', err);
            return res.status(500).json({ error: 'Error en la base de datos: ' + err.message });
        }
        
        console.log(`✅ ${results.length} entregas pendientes obtenidas`);
        res.json(results);
    });
});

// Calificar una entrega
app.post('/api/entregas/calificar', requireAuth, permit('docente', 'administrador'), (req, res) => {
    const { id_entrega, evaluacion, nota, porcentaje, observaciones } = req.body;
    const id_usuario = req.session.user.id;
    
    console.log('📝 Calificando entrega:', { id_entrega, evaluacion, nota });
    
    // Validar datos
    if (!id_entrega || !evaluacion || nota === undefined || !porcentaje) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    if (nota < 0 || nota > 5) {
        return res.status(400).json({ error: 'La nota debe estar entre 0 y 5' });
    }
    
    // Obtener información de la entrega para el id_proyecto
    const getEntregaSql = `
        SELECT t.id as id_tarea, e.id_usuario as id_estudiante 
        FROM entregas e 
        INNER JOIN tareas t ON e.id_tarea = t.id 
        WHERE e.id_entrega = ?
    `;
    
    db.query(getEntregaSql, [id_entrega], (err, entregaResults) => {
        if (err) {
            console.error('❌ Error al obtener información de la entrega:', err);
            return res.status(500).json({ error: 'Error en la base de datos: ' + err.message });
        }
        
        if (entregaResults.length === 0) {
            return res.status(404).json({ error: 'Entrega no encontrada' });
        }
        
        const entrega = entregaResults[0];
        
        // Buscar si ya existe una nota para esta entrega
        const checkNotaSql = 'SELECT id_nota FROM notas WHERE id_entrega = ?';
        
        db.query(checkNotaSql, [id_entrega], (err, notaResults) => {
            if (err) {
                console.error('❌ Error al verificar nota existente:', err);
                return res.status(500).json({ error: 'Error en la base de datos: ' + err.message });
            }
            
            if (notaResults.length > 0) {
                // Actualizar nota existente
                const updateSql = `
                    UPDATE notas 
                    SET evaluacion = ?, nota = ?, porcentaje = ?, observaciones = ?, fecha = CURDATE()
                    WHERE id_entrega = ?
                `;
                
                db.query(updateSql, [evaluacion, nota, porcentaje, observaciones, id_entrega], (err) => {
                    if (err) {
                        console.error('❌ Error al actualizar nota:', err);
                        return res.status(500).json({ error: 'Error en la base de datos: ' + err.message });
                    }
                    
                    console.log('✅ Nota actualizada para entrega:', id_entrega);
                    res.json({ message: 'Calificación actualizada exitosamente', id_entrega });
                });
            } else {
                // Crear nueva nota
                // Para este ejemplo, usaremos un id_proyecto genérico (podrías ajustar esto según tu lógica)
                const id_proyecto = 1; // O obtenerlo de la tarea/entrega
                
                const insertSql = `
                    INSERT INTO notas (id_usuario, id_proyecto, id_entrega, evaluacion, nota, porcentaje, fecha, observaciones)
                    VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?)
                `;
                
                db.query(insertSql, [entrega.id_estudiante, id_proyecto, id_entrega, evaluacion, nota, porcentaje, observaciones], (err, result) => {
                    if (err) {
                        console.error('❌ Error al crear nota:', err);
                        return res.status(500).json({ error: 'Error en la base de datos: ' + err.message });
                    }
                    
                    console.log('✅ Nota creada ID:', result.insertId, 'para entrega:', id_entrega);
                    res.json({ message: 'Calificación guardada exitosamente', id_nota: result.insertId, id_entrega });
                });
            }
        });
    });
});

// Obtener historial de calificaciones realizadas
app.get('/api/calificaciones/historial', requireAuth, permit('docente', 'administrador'), (req, res) => {
    console.log('📊 Obteniendo historial de calificaciones');
    
    const sql = `
        SELECT 
            n.id_nota,
            n.evaluacion,
            n.nota,
            n.porcentaje,
            n.fecha,
            n.observaciones,
            e.id_entrega,
            t.titulo as titulo_tarea,
            t.materia,
            u.nombre as nombre_estudiante,
            u.correo as correo_estudiante
        FROM notas n
        INNER JOIN entregas e ON n.id_entrega = e.id_entrega
        INNER JOIN tareas t ON e.id_tarea = t.id
        INNER JOIN usuarios u ON n.id_usuario = u.id_usuario
        ORDER BY n.fecha DESC
        LIMIT 50
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error al obtener historial de calificaciones:', err);
            return res.status(500).json({ error: 'Error en la base de datos: ' + err.message });
        }
        
        console.log(`✅ ${results.length} calificaciones en historial`);
        res.json(results);
    });
});