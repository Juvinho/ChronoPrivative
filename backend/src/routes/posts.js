const express = require('express');
const router = express.Router();
const {
  listPublishedPosts,
  getPostBySlug,
  getRandomPost,
  getArchives,
  createPost,
  updatePost,
  deletePost,
  updatePostStatus,
} = require('../controllers/postController');
const { getPostsByTag } = require('../controllers/tagController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Rotas públicas
router.get('/', listPublishedPosts);
router.get('/archives', getArchives);  // deve ficar ANTES de /:slug
router.get('/random', getRandomPost);  // deve ficar ANTES de /:slug
router.get('/tag/:slug', getPostsByTag);
router.get('/:slug', getPostBySlug);

// Rotas protegidas (admin)
router.post('/admin', authMiddleware, createPost);
router.put('/admin/:id', authMiddleware, updatePost);
router.delete('/admin/:id', authMiddleware, deletePost);
router.patch('/admin/:id/status', authMiddleware, updatePostStatus);

module.exports = router;
