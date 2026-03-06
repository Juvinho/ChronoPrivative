// ═══════════════════════════════════════════
// User Controller — Bio, Avatar & Username
// ═══════════════════════════════════════════

const { pool } = require('../db/pool');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

// ─── GET PROFILE ────────────────────────

async function getProfile(req, res) {
  try {
    const result = await pool.query(
      `SELECT username, avatar_url FROM users LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    const user = result.rows[0];
    const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 4000}`;

    return res.status(200).json({
      success: true,
      data: {
        username: user.username,
        avatarUrl: user.avatar_url ? `${apiUrl}${user.avatar_url}` : null,
      },
    });
  } catch (error) {
    console.error('[USER_CONTROLLER] Erro ao buscar perfil:', error.message);
    return res.status(500).json({ success: false, message: 'Erro ao carregar perfil' });
  }
}

// ─── UPDATE USERNAME ─────────────────────

async function updateUsername(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { username } = req.body;
  const userId = req.user.id;
  const usernameTrimmed = username.trim();

  try {
    // Verifica se o username já está em uso por outro usuário
    const existing = await pool.query(
      'SELECT id FROM users WHERE username = $1 AND id != $2',
      [usernameTrimmed, userId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Username já está em uso.' });
    }

    const result = await pool.query(
      `UPDATE users
       SET username = $1, username_updated_at = NOW()
       WHERE id = $2
       RETURNING username`,
      [usernameTrimmed, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Username atualizado com sucesso.',
      data: { username: result.rows[0].username },
    });
  } catch (error) {
    console.error('[USER_CONTROLLER] Erro ao atualizar username:', error.message);
    return res.status(500).json({ success: false, message: 'Erro ao atualizar username.' });
  }
}

// ─── UPLOAD AVATAR ───────────────────────

async function uploadAvatarHandler(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nenhuma imagem enviada.' });
  }

  const userId = req.user.id;
  const avatarPath = `/uploads/avatars/${req.file.filename}`;

  try {
    // Remove o arquivo antigo do disco se existir
    const old = await pool.query('SELECT avatar_url FROM users WHERE id = $1', [userId]);
    const oldUrl = old.rows[0]?.avatar_url;
    if (oldUrl) {
      const oldFile = path.join(__dirname, '../../', oldUrl);
      if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
    }

    await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarPath, userId]);

    const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 4000}`;
    return res.status(200).json({
      success: true,
      message: 'Avatar atualizado com sucesso.',
      data: { avatarUrl: `${apiUrl}${avatarPath}` },
    });
  } catch (error) {
    console.error('[USER_CONTROLLER] Erro ao salvar avatar:', error.message);
    return res.status(500).json({ success: false, message: 'Erro ao salvar avatar.' });
  }
}

// ─── GET BIO ─────────────────────────────

async function getBio(req, res) {
  try {
    // Bio é pública — retorna a bio do admin (único autor do blog)
    const result = await pool.query(
      `SELECT bio, bio_updated_at FROM users WHERE username = 'admin' LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        bio: result.rows[0].bio || '',
        updatedAt: result.rows[0].bio_updated_at,
      },
    });
  } catch (error) {
    console.error('[USER_CONTROLLER] Error fetching bio:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erro ao carregar bio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

// ─── UPDATE BIO ──────────────────────────

async function updateBio(req, res) {
  try {
    // Validação de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validação falhou',
        errors: errors.array(),
      });
    }

    const { bio } = req.body;
    const userId = req.user.id;

    // Validação de tamanho (redundante, mas fail-safe)
    if (!bio || typeof bio !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Bio deve ser uma string',
      });
    }

    const bioTrimmed = bio.trim();

    if (bioTrimmed.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Bio excede o limite de 500 caracteres',
      });
    }

    if (bioTrimmed.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Bio não pode estar vazia',
      });
    }

    // Atualizar bio no banco
    const result = await pool.query(
      `UPDATE users 
       SET bio = $1, bio_updated_at = NOW()
       WHERE id = $2
       RETURNING id, username, bio, bio_updated_at`,
      [bioTrimmed, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    const user = result.rows[0];

    return res.status(200).json({
      success: true,
      message: 'Bio atualizada com sucesso',
      data: {
        bio: user.bio,
        updatedAt: user.bio_updated_at,
      },
    });
  } catch (error) {
    console.error('[USER_CONTROLLER] Error updating bio:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar bio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

// ─── GET TOPICS ──────────────────────────

async function getTopics(req, res) {
  try {
    const result = await pool.query(
      // TODO D-04: ajustar JOIN após decisão de produto sobre topics × tags
      // Assumindo post_tags → tags → topics via slug como estrutura provisória
      `SELECT
         t.id,
         t.name,
         t.slug,
         COUNT(DISTINCT pt.post_id)::integer AS count
       FROM topics t
       LEFT JOIN tags tg ON tg.slug = t.slug
       LEFT JOIN post_tags pt ON pt.tag_id = tg.id
       LEFT JOIN posts p ON p.id = pt.post_id AND p.status = 'published'
       GROUP BY t.id
       ORDER BY count DESC, t.name ASC`
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('[USER_CONTROLLER] Error fetching topics:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erro ao carregar tópicos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

// ─── SEED TOPICS ──────────────────────────
// Função auxiliar para popular topics iniciais

async function seedTopics() {
  try {
    const defaultTopics = [
      { name: 'LIFE', slug: 'life' },
      { name: 'THOUGHTS', slug: 'thoughts' },
      { name: 'TRAVEL', slug: 'travel' },
      { name: 'MUSIC', slug: 'music' },
      { name: 'RANDOM', slug: 'random' },
    ];

    for (const topic of defaultTopics) {
      await pool.query(
        `INSERT INTO topics (name, slug, count) 
         VALUES ($1, $2, 0)
         ON CONFLICT (name) DO NOTHING`,
        [topic.name, topic.slug]
      );
    }

    console.log('[TOPICS] Seed completado');
  } catch (error) {
    console.error('[TOPICS] Seed error:', error.message);
  }
}

// ─── VALIDATORS ──────────────────────────

const bioValidators = [
  body('bio')
    .isString()
    .withMessage('Bio deve ser uma string')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Bio deve ter entre 1 e 500 caracteres'),
];

const usernameValidators = [
  body('username')
    .isString()
    .withMessage('Username deve ser uma string')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username deve ter entre 3 e 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username só pode conter letras, números e underscore (_)'),
];

module.exports = {
  getProfile,
  getBio,
  updateBio,
  updateUsername,
  uploadAvatarHandler,
  getTopics,
  seedTopics,
  bioValidators,
  usernameValidators,
};
