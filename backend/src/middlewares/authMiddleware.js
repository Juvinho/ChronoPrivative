// ═══════════════════════════════════════════
// Middleware de Autenticação JWT
// ═══════════════════════════════════════════

const jwt = require('jsonwebtoken');

// Set para tokens invalidados (em produção, use Redis)
const blacklistedTokens = new Set();

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'ACCESS_DENIED',
      message: 'Token de autenticação não fornecido.',
    });
  }

  const token = authHeader.split(' ')[1];

  // Verifica se o token foi invalidado (logout)
  if (blacklistedTokens.has(token)) {
    return res.status(401).json({
      error: 'TOKEN_REVOKED',
      message: 'Token foi revogado. Faça login novamente.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role }
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'TOKEN_EXPIRED',
        message: 'Token expirado. Faça login novamente.',
      });
    }
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Token inválido.',
    });
  }
}

function blacklistToken(token) {
  blacklistedTokens.add(token);
  // Limpa tokens expirados a cada 1h para não acumular memória
  setTimeout(() => blacklistedTokens.delete(token), 24 * 60 * 60 * 1000);
}

module.exports = { authMiddleware, blacklistToken };
