// ═══════════════════════════════════════════
// Controller de Posts
// ═══════════════════════════════════════════

const { query, transaction } = require('../db/pool');
const { uniqueSlug } = require('../utils/slugify');

// ─── ROTAS PÚBLICAS ──────────────────────

// GET /api/posts — Lista posts publicados com paginação
async function listPublishedPosts(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let whereClause = "WHERE p.status = 'published'";
    const params = [];
    let paramIndex = 1;

    if (search.trim()) {
      whereClause += ` AND (p.title ILIKE $${paramIndex} OR p.content ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Conta total de posts
    const countResult = await query(
      `SELECT COUNT(*) FROM posts p ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Busca posts com tags
    const postsResult = await query(
      `SELECT 
        p.id, p.title, p.slug, p.excerpt, p.cover_image_url, 
        p.views, p.created_at, p.updated_at,
        u.username AS author,
        COALESCE(
          json_agg(
            json_build_object('id', t.id, 'name', t.name, 'slug', t.slug)
          ) FILTER (WHERE t.id IS NOT NULL), '[]'
        ) AS tags
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      ${whereClause}
      GROUP BY p.id, u.username
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      posts: postsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[POSTS] Erro ao listar posts:', error.message);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'Erro interno.' });
  }
}

// GET /api/posts/:slug — Retorna post por slug + incrementa views
async function getPostBySlug(req, res) {
  try {
    const { slug } = req.params;

    const result = await query(
      `SELECT 
        p.id, p.title, p.slug, p.content, p.excerpt, p.cover_image_url,
        p.status, p.views, p.created_at, p.updated_at,
        u.username AS author,
        COALESCE(
          json_agg(
            json_build_object('id', t.id, 'name', t.name, 'slug', t.slug)
          ) FILTER (WHERE t.id IS NOT NULL), '[]'
        ) AS tags
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.slug = $1 AND p.status = 'published'
      GROUP BY p.id, u.username`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Post não encontrado.' });
    }

    const post = result.rows[0];

    // Incrementa views e registra no log (async, não bloqueia resposta)
    const viewerIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || '';

    query('UPDATE posts SET views = views + 1 WHERE id = $1', [post.id]).catch(() => {});
    query(
      'INSERT INTO views_log (post_id, viewer_ip, user_agent) VALUES ($1, $2, $3)',
      [post.id, viewerIp, userAgent]
    ).catch(() => {});

    return res.status(200).json({ post });
  } catch (error) {
    console.error('[POSTS] Erro ao buscar post:', error.message);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'Erro interno.' });
  }
}

// ─── ROTAS PROTEGIDAS (ADMIN) ────────────

// POST /api/admin/posts — Cria novo post
async function createPost(req, res) {
  try {
    const { title, content, excerpt, cover_image_url, status, tags, metadata } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'Title e content são obrigatórios.',
      });
    }

    const validStatuses = ['draft', 'published', 'archived'];
    const postStatus = validStatuses.includes(status) ? status : 'draft';
    const slug = await uniqueSlug(title, query);

    const result = await transaction(async (client) => {
      // Insere o post
      const postResult = await client.query(
        `INSERT INTO posts (title, slug, content, excerpt, cover_image_url, author_id, status, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, title, slug, status, created_at`,
        [title, slug, content, excerpt || null, cover_image_url || null, req.user.id, postStatus, metadata ? JSON.stringify(metadata) : '{}']
      );

      const post = postResult.rows[0];

      // Processa tags se fornecidas
      if (tags && Array.isArray(tags) && tags.length > 0) {
        for (const tagName of tags) {
          const tagSlug = tagName.toLowerCase().trim().replace(/\s+/g, '-');

          // Upsert tag
          const tagResult = await client.query(
            `INSERT INTO tags (name, slug) VALUES ($1, $2)
             ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
             RETURNING id`,
            [tagName.trim(), tagSlug]
          );

          // Associa tag ao post
          await client.query(
            'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [post.id, tagResult.rows[0].id]
          );
        }
      }

      return post;
    });

    return res.status(201).json({ message: 'POST_CREATED', post: result });
  } catch (error) {
    console.error('[POSTS] Erro ao criar post:', error.message);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'Erro interno.' });
  }
}

// PUT /api/admin/posts/:id — Edita post
async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { title, content, excerpt, cover_image_url, status, tags, metadata } = req.body;

    // Verifica se o post existe
    const existing = await query('SELECT id FROM posts WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Post não encontrado.' });
    }

    const validStatuses = ['draft', 'published', 'archived'];

    const result = await transaction(async (client) => {
      // Monta a query dinamicamente para campos fornecidos
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (title !== undefined) {
        const slug = await uniqueSlug(title, async (text, params) => client.query(text, params), parseInt(id));
        fields.push(`title = $${paramIndex}`, `slug = $${paramIndex + 1}`);
        values.push(title, slug);
        paramIndex += 2;
      }
      if (content !== undefined) {
        fields.push(`content = $${paramIndex}`);
        values.push(content);
        paramIndex++;
      }
      if (excerpt !== undefined) {
        fields.push(`excerpt = $${paramIndex}`);
        values.push(excerpt);
        paramIndex++;
      }
      if (cover_image_url !== undefined) {
        fields.push(`cover_image_url = $${paramIndex}`);
        values.push(cover_image_url);
        paramIndex++;
      }
      if (status !== undefined && validStatuses.includes(status)) {
        fields.push(`status = $${paramIndex}`);
        values.push(status);
        paramIndex++;
      }
      if (metadata !== undefined) {
        fields.push(`metadata = $${paramIndex}`);
        values.push(JSON.stringify(metadata));
        paramIndex++;
      }

      if (fields.length === 0 && (!tags || !Array.isArray(tags))) {
        return { message: 'Nenhum campo para atualizar.' };
      }

      let post;
      if (fields.length > 0) {
        values.push(parseInt(id));
        const postResult = await client.query(
          `UPDATE posts SET ${fields.join(', ')} WHERE id = $${paramIndex}
           RETURNING id, title, slug, status, updated_at`,
          values
        );
        post = postResult.rows[0];
      } else {
        const postResult = await client.query(
          'SELECT id, title, slug, status, updated_at FROM posts WHERE id = $1',
          [parseInt(id)]
        );
        post = postResult.rows[0];
      }

      // Atualiza tags se fornecidas
      if (tags && Array.isArray(tags)) {
        // Remove tags antigas
        await client.query('DELETE FROM post_tags WHERE post_id = $1', [parseInt(id)]);

        // Adiciona novas
        for (const tagName of tags) {
          const tagSlug = tagName.toLowerCase().trim().replace(/\s+/g, '-');
          const tagResult = await client.query(
            `INSERT INTO tags (name, slug) VALUES ($1, $2)
             ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
             RETURNING id`,
            [tagName.trim(), tagSlug]
          );
          await client.query(
            'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [parseInt(id), tagResult.rows[0].id]
          );
        }
      }

      return post;
    });

    return res.status(200).json({ message: 'POST_UPDATED', post: result });
  } catch (error) {
    console.error('[POSTS] Erro ao atualizar post:', error.message);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'Erro interno.' });
  }
}

// DELETE /api/admin/posts/:id — Deleta post
async function deletePost(req, res) {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM posts WHERE id = $1 RETURNING id, title',
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Post não encontrado.' });
    }

    return res.status(200).json({ message: 'POST_DELETED', post: result.rows[0] });
  } catch (error) {
    console.error('[POSTS] Erro ao deletar post:', error.message);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'Erro interno.' });
  }
}

// PATCH /api/admin/posts/:id/status — Muda status
async function updatePostStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['draft', 'published', 'archived'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'INVALID_STATUS',
        message: `Status deve ser um de: ${validStatuses.join(', ')}`,
      });
    }

    const result = await query(
      'UPDATE posts SET status = $1 WHERE id = $2 RETURNING id, title, slug, status, updated_at',
      [status, parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Post não encontrado.' });
    }

    return res.status(200).json({ message: 'STATUS_UPDATED', post: result.rows[0] });
  } catch (error) {
    console.error('[POSTS] Erro ao atualizar status:', error.message);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'Erro interno.' });
  }
}

// GET /api/posts/archives — Meses com ao menos 1 post publicado
async function getArchives(req, res) {
  try {
    const result = await query(
      `SELECT
        DATE_TRUNC('month', created_at) AS month,
        COUNT(*) AS total
       FROM posts
       WHERE status = 'published'
       GROUP BY month
       HAVING COUNT(*) > 0
       ORDER BY month DESC`
    );

    return res.status(200).json({
      success: true,
      data: result.rows.map(row => ({
        month: row.month,
        total: parseInt(row.total, 10),
      })),
    });
  } catch (error) {
    console.error('[POSTS] Erro ao buscar archives:', error.message);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'Erro interno.' });
  }
}

module.exports = {
  listPublishedPosts,
  getPostBySlug,
  getArchives,
  createPost,
  updatePost,
  deletePost,
  updatePostStatus,
};
