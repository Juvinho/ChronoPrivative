const express = require('express');
const router = express.Router();
const {
  getApprovedComments,
  createComment,
  approveComment,
  deleteComment,
} = require('../controllers/commentController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Rotas públicas
router.get('/:postId', getApprovedComments);
router.post('/', createComment);

// Rotas protegidas (admin)
router.patch('/admin/:id/approve', authMiddleware, approveComment);
router.delete('/admin/:id', authMiddleware, deleteComment);

module.exports = router;
