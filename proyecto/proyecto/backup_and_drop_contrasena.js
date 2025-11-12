const mysql = require('mysql2/promise');

(async function(){
  const config = { host: 'localhost', user: 'root', password: 'root123', database: 'gestion_proyectos' };
  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('Conectado a MySQL.');

    // 1) comprobar existencia de la tabla usuarios
    const [tables] = await conn.query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ? AND table_name = 'usuarios'", [config.database]);
    if (!tables || tables.length === 0) {
      console.error('La tabla `usuarios` no existe en la base de datos. Abortando.');
      return process.exit(1);
    }

    // 2) crear backup con timestamp
    const ts = new Date().toISOString().replace(/[:.]/g,'').replace('T','_').split('Z')[0];
    const backupName = `usuarios_backup_${ts}`;
    console.log(`Creando backup: ${backupName} ...`);
    await conn.query(`CREATE TABLE \`${backupName}\` AS SELECT * FROM usuarios`);
    console.log('Backup creado.');

    // 3) comprobar si columna `contraseña` existe
    const [cols] = await conn.query("SHOW COLUMNS FROM usuarios LIKE 'contraseña'");
    if (!cols || cols.length === 0) {
      console.log('La columna `contraseña` no existe. Nada que eliminar.');
    } else {
      console.log('La columna `contraseña` existe. Procediendo a eliminarla...');
      await conn.query('ALTER TABLE usuarios DROP COLUMN `contraseña`');
      console.log('Columna `contraseña` eliminada.');
    }

    // 4) listar columnas actuales para confirmación
    const [finalCols] = await conn.query('SHOW COLUMNS FROM usuarios');
    console.log('\nColumnas actuales en `usuarios`:');
    finalCols.forEach(c => console.log(` - ${c.Field}  (${c.Type})`));

    console.log('\nOperación completada con éxito. Backup:', backupName);
  } catch (e) {
    console.error('Error durante la operación:', e.message);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
})();
