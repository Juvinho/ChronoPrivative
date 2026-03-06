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
  uploadPostImageHandler,
} = require('../controllers/postController');
const { getPostsByTag } = require('../controllers/tagController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { uploadPostImage } = require('../middlewares/upload');

// Rotas públicas
router.get('/', listPublishedPosts);
router.get('/archives', getArchives);  // deve ficar ANTES de /:slug
router.get('/random', getRandomPost);  // deve ficar ANTES de /:slug
router.get('/tag/:slug', getPostsByTag);
router.get('/:slug', getPostBySlug);

// Rotas protegidas (admin)
// Upload de imagem para post — retorna URL; deve ficar ANTES de /admin (sem param)
router.post('/admin/upload-image', authMiddleware, uploadPostImage.single('image'), uploadPostImageHandler);
router.post('/admin', authMiddleware, createPost);
router.put('/admin/:id', authMiddleware, updatePost);
router.delete('/admin/:id', authMiddleware, deletePost);
router.patch('/admin/:id/status', authMiddleware, updatePostStatus);

module.exports = router;
