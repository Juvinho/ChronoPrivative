// Script de migration — executa src/db/migrations.sql contra o banco configurado
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const sqlFile = path.join(__dirname, '..', 'src', 'db', 'migrations.sql');

if (!process.env.DATABASE_URL) {
  console.error('❌  DATABASE_URL não definida. Verifique o arquivo .env');
  process.exit(1);
}

if (!fs.existsSync(sqlFile)) {
  console.error('❌  Arquivo não encontrado:', sqlFile);
  process.exit(1);
}

const sql = fs.readFileSync(sqlFile, 'utf8');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  console.log('🔄  Executando migrations em:', process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@'));
  try {
    await pool.query(sql);
    console.log('✅  Migrations executadas com sucesso!');

    // Confirmar tabelas criadas
    const result = await pool.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema='public' ORDER BY table_name`
    );
    console.log('📋  Tabelas no banco:', result.rows.map(r => r.table_name).join(', '));
  } catch (err) {
    console.error('❌  Erro ao executar migrations:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
