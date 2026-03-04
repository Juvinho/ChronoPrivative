// ═══════════════════════════════════════════
// Controller de Reações
// ═══════════════════════════════════════════

const { query } = require('../db/pool');

// POST /api/reactions — Adiciona reação
async function addReaction(req, res) {
  try {
    const { post_id, type, session_id } = req.body;

    const validTypes = ['like', 'love', 'fire', 'clap', 'sad'];
    if (!post_id || !type || !validTypes.includes(type)) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: `post_id e type são obrigatórios. Types válidos: ${validTypes.join(', ')}`,
      });
    }

    if (!session_id) {
      return res.status(400).json({
        error: 'MISSING_SESSION',
        message: 'session_id é obrigatório para evitar duplicatas.',
      });
    }

    // Verifica se o post existe
    const postExists = await query('SELECT id FROM posts WHERE id = $1', [post_id]);
    if (postExists.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Post não encontrado.' });
    }

    const userIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';

    const result = await query(
      `INSERT INTO reactions (post_id, type, user_ip, session_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (post_id, session_id, type) DO NOTHING
       RETURNING id`,
      [post_id, type, userIp, session_id]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({
        error: 'ALREADY_REACTED',
        message: 'Você já reagiu com este tipo neste post.',
      });
    }

    return res.status(201).json({ message: 'REACTION_ADDED' });
  } catch (error) {
    console.error('[REACTIONS] Erro ao adicionar reação:', error.message);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'Erro interno.' });
  }
}

// GET /api/reactions/:postId — Contagem de reações por tipo
async function getReactions(req, res) {
  try {
    const { postId } = req.params;

    const result = await query(
      `SELECT type, COUNT(*)::integer AS count
       FROM reactions
       WHERE post_id = $1
       GROUP BY type`,
      [parseInt(postId)]
    );

    // Monta objeto com todos os tipos, mesmo os com 0
    const reactions = {
      like: 0,
      love: 0,
      fire: 0,
      clap: 0,
      sad: 0,
    };

    result.rows.forEach((row) => {
      reactions[row.type] = row.count;
    });

    return res.status(200).json({ post_id: parseInt(postId), reactions });
  } catch (error) {
    console.error('[REACTIONS] Erro ao buscar reações:', error.message);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'Erro interno.' });
  }
}

module.exports = { addReaction, getReactions };
