require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DATABASE_URL });

bcrypt.hash('admin', 12).then(hash => {
  return p.query('UPDATE users SET password_hash=$1 WHERE username=$2 RETURNING id, username', [hash, 'admin']);
}).then(r => {
  console.log('✅ Hash atualizado:', JSON.stringify(r.rows));
  p.end();
}).catch(e => {
  console.error('❌ ERRO:', e.message);
  p.end();
});
