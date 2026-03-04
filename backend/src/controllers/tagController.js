// ═══════════════════════════════════════════
// Controller de Tags
// ═══════════════════════════════════════════

const { query } = require('../db/pool');

// GET /api/tags — Lista todas as tags com contagem de posts
async function listTags(req, res) {
  try {
    const result = await query(
      `SELECT t.id, t.name, t.slug, COUNT(pt.post_id)::integer AS post_count
       FROM tags t
       LEFT JOIN post_tags pt ON t.id = pt.tag_id
       LEFT JOIN posts p ON pt.post_id = p.id AND p.status = 'published'
       GROUP BY t.id
       ORDER BY post_count DESC, t.name ASC`
    );

    return res.status(200).json({ tags: result.rows });
  } catch (error) {
    console.error('[TAGS] Erro ao listar tags:', error.message);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'Erro interno.' });
  }
}

// GET /api/posts/tag/:slug — Posts por tag
async function getPostsByTag(req, res) {
  try {
    const { slug } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    // Verifica se a tag existe
    const tagResult = await query('SELECT id, name, slug FROM tags WHERE slug = $1', [slug]);
    if (tagResult.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Tag não encontrada.' });
    }

    const tag = tagResult.rows[0];

    // Conta total
    const countResult = await query(
      `SELECT COUNT(*) FROM posts p
       JOIN post_tags pt ON p.id = pt.post_id
       WHERE pt.tag_id = $1 AND p.status = 'published'`,
      [tag.id]
    );
    const total = parseInt(countResult.rows[0].count);

    // Busca posts
    const postsResult = await query(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image_url,
              p.views, p.created_at, u.username AS author
       FROM posts p
       JOIN post_tags pt ON p.id = pt.post_id
       LEFT JOIN users u ON p.author_id = u.id
       WHERE pt.tag_id = $1 AND p.status = 'published'
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [tag.id, limit, offset]
    );

    return res.status(200).json({
      tag,
      posts: postsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[TAGS] Erro ao buscar posts por tag:', error.message);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'Erro interno.' });
  }
}

module.exports = { listTags, getPostsByTag };
