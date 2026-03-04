// ═══════════════════════════════════════════
// Rate Limiting
// ═══════════════════════════════════════════

const rateLimit = require('express-rate-limit');

// Rate limiter para login: máx 5 tentativas por IP por minuto
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5,
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Muitas tentativas de login. Aguarde 1 minuto.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
});

// Rate limiter geral para API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Muitas requisições. Tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para reações (evita spam)
const reactionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Muitas reações enviadas. Aguarde um momento.',
  },
});

module.exports = { loginLimiter, apiLimiter, reactionLimiter };
