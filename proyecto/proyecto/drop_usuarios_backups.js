const mysql = require('mysql2/promise');

(async function(){
  const config = { host: 'localhost', user: 'root', password: 'root123', database: 'gestion_proyectos' };
  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('Conectado a MySQL.');

    const [backs] = await conn.query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ? AND table_name LIKE 'usuarios_backup_%'", [config.database]);
    if (!backs || backs.length === 0) {
      console.log('No se encontraron tablas de backup `usuarios_backup_%`.');
      return;
    }

    for (const r of backs) {
      const name = r.TABLE_NAME || r.table_name;
      console.log('Eliminando backup:', name);
      await conn.query(`DROP TABLE \`${name}\``);
      console.log('Eliminada:', name);
    }

    console.log('Operación de eliminación de backups completada.');
  } catch (e) {
    console.error('Error:', e.message);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
})();