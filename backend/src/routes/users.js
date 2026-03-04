// ═══════════════════════════════════════════
// Routes — User Management (Bio & Topics)
// ═══════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { updateBio, getTopics, bioValidators } = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');

/**
 * PUT /api/user/bio
 * Atualiza a bio do usuário autenticado
 * 
 * @requires JWT Token (Bearer)
 * @body { bio: string (1-500 chars) }
 * @returns { success, message, data: { bio, updatedAt } }
 */
router.put('/bio', authMiddleware, bioValidators, updateBio);

/**
 * GET /api/user/topics
 * Retorna lista de tópicos disponíveis
 * 
 * @returns { success, data: [{ id, name, slug, count }] }
 */
router.get('/topics', getTopics);

module.exports = router;
