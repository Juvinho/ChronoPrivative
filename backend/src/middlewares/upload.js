// ═══════════════════════════════════════════
// Middleware de Upload — Avatar e Post (multer)
// ═══════════════════════════════════════════

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Formato não suportado. Use JPG, PNG, GIF ou WEBP.'), false);
  }
}

// ─── AVATAR ──────────────────────────────

const AVATAR_DIR = path.join(__dirname, '../../uploads/avatars');
ensureDir(AVATAR_DIR);

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uid = req.user?.id ?? 'unknown';
    const unique = crypto.randomBytes(8).toString('hex');
    cb(null, `avatar_${uid}_${unique}${ext}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

// ─── POST IMAGE ───────────────────────────

const POST_IMG_DIR = path.join(__dirname, '../../uploads/posts');
ensureDir(POST_IMG_DIR);

const postImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, POST_IMG_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uid = req.user?.id ?? 'unknown';
    const unique = crypto.randomBytes(12).toString('hex');
    cb(null, `post_${uid}_${unique}${ext}`);
  },
});

const uploadPostImage = multer({
  storage: postImageStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = { uploadAvatar, uploadPostImage };
