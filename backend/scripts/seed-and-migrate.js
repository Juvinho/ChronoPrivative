// Script de migração e seed
require('dotenv').config();
const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DATABASE_URL });

const steps = [
  {
    name: 'CREATE topics table',
    sql: `CREATE TABLE IF NOT EXISTS topics (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      slug VARCHAR(100) NOT NULL UNIQUE,
      count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )`,
  },
  {
    name: 'CREATE index topics_slug',
    sql: `CREATE INDEX IF NOT EXISTS idx_topics_slug ON topics(slug)`,
  },
  {
    name: 'SEED topics',
    sql: `INSERT INTO topics (name, slug) VALUES
      ('LIFE','life'),('THOUGHTS','thoughts'),('TRAVEL','travel'),
      ('MUSIC','music'),('RANDOM','random')
      ON CONFLICT (slug) DO NOTHING`,
  },
  {
    name: 'SEED admin user (if not exists)',
    sql: `INSERT INTO users (username, password_hash, role)
      VALUES ('admin', 'placeholder_hash_not_for_login', 'admin')
      ON CONFLICT (username) DO NOTHING`,
  },
  {
    name: 'SEED published posts for archives',
    sql: `INSERT INTO posts (title, slug, content, author_id, status, created_at)
      VALUES
        ('First Entry', 'first-entry', 'Hello world.',
         (SELECT id FROM users WHERE username='admin' LIMIT 1),
         'published', NOW() - INTERVAL '1 month'),
        ('Second Entry', 'second-entry', 'Another entry.',
         (SELECT id FROM users WHERE username='admin' LIMIT 1),
         'published', NOW() - INTERVAL '2 months')
      ON CONFLICT (slug) DO NOTHING`,
  },
];

(async () => {
  for (const step of steps) {
    try {
      await p.query(step.sql);
      console.log('✅', step.name);
    } catch (e) {
      console.error('❌', step.name, '->', e.message);
    }
  }

  // Verify
  const topics = await p.query('SELECT id, name, slug, count FROM topics ORDER BY id');
  console.log('\nTOPICS TABLE:', JSON.stringify(topics.rows));

  const posts = await p.query(
    `SELECT id, title, status, created_at::date FROM posts WHERE status='published' ORDER BY created_at DESC`
  );
  console.log('PUBLISHED POSTS:', JSON.stringify(posts.rows));

  // Test the archives query
  const archives = await p.query(
    `SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) AS total
     FROM posts WHERE status = 'published'
     GROUP BY month HAVING COUNT(*) > 0
     ORDER BY month DESC`
  );
  console.log('ARCHIVES QUERY RESULT:', JSON.stringify(archives.rows));

  await p.end();
})();
