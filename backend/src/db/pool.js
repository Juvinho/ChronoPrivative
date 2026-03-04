// ═══════════════════════════════════════════
// Pool de Conexões PostgreSQL
// ═══════════════════════════════════════════

require('dotenv').config();

const { Pool } = require('pg');



const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log de conexão
pool.on('connect', () => {
  console.log('[DB] Nova conexão estabelecida com PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[DB] Erro no pool:', err.message);
  
  // Erros fatais — encerrando processo
  if (
    err.message.includes('password authentication') ||
    err.message.includes('does not exist') ||
    err.message.includes('permission denied')
  ) {
    console.error('[DB] ❌ Erro fatal — encerrando servidor.');
    process.exit(-1);
  }
  
  // Erros transitórios — logar e continuar
  console.error('[DB] ⚠️ Erro transitório — aguardando reconexão.');
});

// Helper para queries com tratamento de erro
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('[DB] Query executada', { text: text.substring(0, 80), duration: `${duration}ms`, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('[DB] Erro na query:', { text: text.substring(0, 80), error: error.message });
    throw error;
  }
};

// Helper para transações
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { pool, query, transaction };
