const mysql = require('mysql2/promise');

(async function(){
  const config = { host: 'localhost', user: 'root', password: 'root123', database: 'gestion_proyectos' };
  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('Conectado a MySQL.');

    // 1) Añadir columna password_hash si no existe
    const [cols] = await conn.query("SHOW COLUMNS FROM usuarios LIKE 'password_hash'");
    if (cols && cols.length > 0) {
      console.log('La columna password_hash ya existe.');
    } else {
      console.log('Añadiendo columna password_hash VARCHAR(255)...');
      await conn.query("ALTER TABLE usuarios ADD COLUMN password_hash VARCHAR(255) AFTER `contraseña`");
      console.log('Columna password_hash añadida.');

      // 2) Copiar valores existentes desde `contraseña` (si existiera) a password_hash
      try {
        const [cols2] = await conn.query("SHOW COLUMNS FROM usuarios LIKE 'contraseña'");
        if (cols2 && cols2.length > 0) {
          console.log('Copiando valores desde `contraseña` a `password_hash`...');
          await conn.query("UPDATE usuarios SET password_hash = `contraseña` WHERE password_hash IS NULL OR password_hash = ''");
          console.log('Copia completada.');
        } else {
          console.log('No existe la columna `contraseña`; no hay datos que copiar.');
        }
      } catch (e) {
        console.warn('Advertencia al copiar valores:', e.message);
      }
    }

    console.log('Operación completada.');
  } catch (e) {
    console.error('Error:', e.message);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
})();