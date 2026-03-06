// ═══════════════════════════════════════════
// Middleware de Upload — Avatar (multer)
// ═══════════════════════════════════════════

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Garante que o diretório de destino existe
const AVATAR_DIR = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, AVATAR_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uid = req.user?.id ?? 'unknown';
    const unique = crypto.randomBytes(8).toString('hex');
    cb(null, `avatar_${uid}_${unique}${ext}`);
  },
});

const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Formato não suportado. Use JPG, PNG, GIF ou WEBP.'), false);
  }
};

const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

module.exports = { uploadAvatar };
