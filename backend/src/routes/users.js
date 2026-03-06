// ═══════════════════════════════════════════
// Routes — User Management (Profile, Bio & Topics)
// ═══════════════════════════════════════════

const express = require('express');
const router = express.Router();
const {
  getProfile,
  getBio,
  updateBio,
  updateUsername,
  uploadAvatarHandler,
  getTopics,
  bioValidators,
  usernameValidators,
} = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { uploadAvatar } = require('../middlewares/upload');

/**
 * GET /api/user/profile
 * Retorna username e avatarUrl do autor (público)
 */
router.get('/profile', getProfile);

/**
 * PATCH /api/user/username
 * Atualiza o username do usuário autenticado
 * @requires JWT Token (Bearer)
 * @body { username: string (3–30 chars, alfanumérico + _) }
 */
router.patch('/username', authMiddleware, usernameValidators, updateUsername);

/**
 * POST /api/user/avatar
 * Recebe um arquivo via multipart/form-data (campo 'avatar')
 * @requires JWT Token (Bearer)
 * @body FormData com campo 'avatar' (JPG/PNG/GIF/WEBP, máx 2MB)
 */
router.post(
  '/avatar',
  authMiddleware,
  uploadAvatar.single('avatar'),
  uploadAvatarHandler
);

/**
 * GET /api/user/bio
 * Retorna a bio pública do autor
 */
router.get('/bio', getBio);

/**
 * PUT /api/user/bio
 * Atualiza a bio do usuário autenticado
 * @requires JWT Token (Bearer)
 */
router.put('/bio', authMiddleware, bioValidators, updateBio);

/**
 * GET /api/user/topics
 * Retorna lista de tópicos disponíveis
 */
router.get('/topics', getTopics);

module.exports = router;
