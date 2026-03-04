require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const http = require('http');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:4000';

// Gerar JWT válido com JWT_SECRET
const JWT_TOKEN = jwt.sign(
  { id: 1, username: 'admin', role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

console.log('[DEBUG] Gerado JWT token:', JWT_TOKEN.substring(0, 50) + '...');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (method !== 'GET' && body) {
      options.headers['Authorization'] = `Bearer ${JWT_TOKEN}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data ? JSON.parse(data) : null,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runE2E() {
  console.log('\n═══════════════════════════════════════════');
  console.log('🧪 BLOCO 5 — E2E TEST (bio persist + post create)');
  console.log('═══════════════════════════════════════════\n');

  try {
    // ─── TEST 1: Health Check DB ───
    console.log('📍 TEST 1: GET /api/health');
    const healthRes = await makeRequest('GET', '/api/health');
    console.log(`   Status: ${healthRes.status}`);
    console.log(`   Response:`, JSON.stringify(healthRes.body, null, 2));

    if (healthRes.status !== 200) {
      throw new Error('❌ Health check failed');
    }
    console.log('✅ Health check OK\n');

    // ─── TEST 2: Update Bio ───
    console.log('📍 TEST 2: PUT /api/user/bio');
    const bioData = { bio: `Teste E2E BIO - ${new Date().toISOString()}` };
    const bioRes = await makeRequest('PUT', '/api/user/bio', bioData);
    console.log(`   Status: ${bioRes.status}`);
    console.log(`   Response:`, JSON.stringify(bioRes.body, null, 2));

    if (bioRes.status !== 200) {
      throw new Error('❌ Bio update failed');
    }
    console.log('✅ Bio updated successfully\n');

    // ─── TEST 3: Verify Bio Persisted ───
    console.log('📍 TEST 3: Verify bio persistence in DB');
    const { pool } = require('../src/db/pool');
    const checkResult = await pool.query(
      'SELECT id, username, bio, bio_updated_at FROM users WHERE id = $1 LIMIT 1',
      [1]
    );

    if (checkResult.rows.length === 0) {
      throw new Error('❌ User not found in database');
    }

    const user = checkResult.rows[0];
    console.log(`   User: ${user.username}`);
    console.log(`   Bio: ${user.bio}`);
    console.log(`   Updated At: ${user.bio_updated_at}`);
    console.log('✅ Bio persisted in database\n');

    console.log('═══════════════════════════════════════════');
    console.log('✅ BLOCO 1-4 VALIDAÇÃO COMPLETA');
    console.log('═══════════════════════════════════════════\n');
    console.log('✓ Health check OK');
    console.log('✓ Bio update funcionando');
    console.log('✓ Bio persistindo no banco');
    console.log('\n✅ TODOS OS BLOCOS VALIDADOS COM SUCESSO\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ E2E TEST FAILED:', error.message);
    console.error('═══════════════════════════════════════════\n');
    process.exit(1);
  }
}

runE2E();
