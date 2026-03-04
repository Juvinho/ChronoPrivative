const express = require('express');
const router = express.Router();
const { addReaction, getReactions } = require('../controllers/reactionController');
const { reactionLimiter } = require('../middlewares/rateLimiter');

router.post('/', reactionLimiter, addReaction);
router.get('/:postId', getReactions);

module.exports = router;
