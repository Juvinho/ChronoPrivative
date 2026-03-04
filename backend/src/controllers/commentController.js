// ═══════════════════════════════════════════
// Controller de Comentários
// ═══════════════════════════════════════════

const { query } = require('../db/pool');

// GET /api/comments/:postId — Lista comentários aprovados
async function getApprovedComments(req, res) {
  try {
    const { postId } = req.params;

    const result = await query(
      `SELECT id, author_name, content, parent_id, created_at
       FROM comments
       WHERE post_id = $1 AND is_approved = true
       ORDER BY created_at ASC`,
      [parseInt(postId)]
    );

    // Estrutura em árvore (replies aninhados)
    const commentsMap = {};
    const rootComments = [];

    result.rows.forEach((comment) => {
      commentsMap[comment.id] = { ...comment, replies: [] };
    });

    result.rows.forEach((comment) => {
      if (comment.parent_id && commentsMap[comment.parent_id]) {
        commentsMap[comment.parent_id].replies.push(commentsMap[comment.id]);
      } else {
        rootComments.push(commentsMap[comment.id]);
      }
    });

    return res.status(200).json({
      post_id: parseInt(postId),
      comments: rootComments,
      total: result.rows.length,
    });
  } catch (error) {
    console.error('[COMMENTS] Erro ao listar comentários:', error.message);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'Erro interno.' });
  }
}

// POST /api/comments — Cria comentário (pendente de aprovação)
async function createComment(req, res) {
  try {
    const { post_id, author_name, author_email, content, parent_id } = req.body;

    if (!post_id || !author_name || !content) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'post_id, author_name e content são obrigatórios.',
      });
    }

    // Sanitização básica
    const sanitizedContent = content.trim().substring(0, 5000);
    const sanitizedName = author_name.trim().substring(0, 100);

    // Verifica se o post existe
    const postExists = await query('SELECT id FROM posts WHERE id = $1', [post_id]);
    if (postExists.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Post não encontrado.' });
    }

    // Se parent_id fornecido, verifica se existe
    if (parent_id) {
      const parentExists = await query('SELECT id FROM comments WHERE id = $1 AND post_id = $2', [parent_id, post_id]);
      if (parentExists.rows.length === 0) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Comentário pai não encontrado.' });
      }
    }

    const result = await query(
      `INSERT INTO comments (post_id, author_name, author_email, content, parent_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [post_id, sanitizedName, author_email || null, sanitizedContent, parent_id || null]
    );

    return res.status(201).json({
      message: 'COMMENT_PENDING',
      comment: {
        id: result.rows[0].id,
        created_at: result.rows[0].created_at,
        note: 'Seu comentário será exibido após aprovação.',
      },
    });
  } catch (error) {
    console.error('[COMMENTS] Erro ao criar comentário:', error.message);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'Erro interno.' });
  }
}

// PATCH /api/admin/comments/:id/approve — Aprova comentário (protegido)
async function approveComment(req, res) {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE comments SET is_approved = true WHERE id = $1 RETURNING id, author_name, post_id',
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Comentário não encontrado.' });
    }

    return res.status(200).json({ message: 'COMMENT_APPROVED', comment: result.rows[0] });
  } catch (error) {
    console.error('[COMMENTS] Erro ao aprovar comentário:', error.message);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'Erro interno.' });
  }
}

// DELETE /api/admin/comments/:id — Deleta comentário (protegido)
async function deleteComment(req, res) {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM comments WHERE id = $1 RETURNING id',
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Comentário não encontrado.' });
    }

    return res.status(200).json({ message: 'COMMENT_DELETED' });
  } catch (error) {
    console.error('[COMMENTS] Erro ao deletar comentário:', error.message);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'Erro interno.' });
  }
}

module.exports = { getApprovedComments, createComment, approveComment, deleteComment };
