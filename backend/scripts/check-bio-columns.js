require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('../src/db/pool');

async function check() {
  try {
    const result = await pool.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'users' AND column_name IN ('bio', 'bio_updated_at')
       ORDER BY column_name`
    );
    console.log('\n✅ BLOCO 1 — Colunas encontradas:');
    console.log(result.rows);
    if (result.rows.length === 2) {
      console.log('✅ Ambas as colunas existem — BLOCO 1 VALIDADO');
    } else {
      console.log(`⚠️ Apenas ${result.rows.length}/2 colunas encontradas — rodar ALTER TABLE`);
    }
    process.exit(0);
  } catch (e) {
    console.error('❌ Erro:', e.message);
    process.exit(1);
  }
}
check();
