// ═══════════════════════════════════════════
// Middleware de Autenticação JWT
// ═══════════════════════════════════════════

const jwt = require('jsonwebtoken');
const { pool } = require('../db/pool');

// A-03: blacklist persistida em PostgreSQL (decisão D-03 — 04/03/2026)
// Substitui Set em memória que resetava a cada restart do servidor.
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'ACCESS_DENIED',
      message: 'Token de autenticação não fornecido.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verifica se o token foi revogado no banco
    const { rows } = await pool.query(
      'SELECT 1 FROM revoked_tokens WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    if (rows.length > 0) {
      return res.status(401).json({
        error: 'TOKEN_REVOKED',
        message: 'Token foi revogado. Faça login novamente.',
      });
    }

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
    // JsonWebTokenError ou erros de DB
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Token inválido.',
    });
  }
}

// Persiste token revogado no PostgreSQL com a data de expiração original do JWT
async function blacklistToken(token) {
  try {
    const decoded = jwt.decode(token); // decode sem verify — já foi verificado pelo middleware
    const expiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // fallback: 24h

    await pool.query(
      'INSERT INTO revoked_tokens (token, expires_at) VALUES ($1, $2) ON CONFLICT (token) DO NOTHING',
      [token, expiresAt]
    );
  } catch (err) {
    console.error('[AUTH] Erro ao revogar token no banco:', err.message);
  }
}

// Limpeza periódica de tokens já expirados (a cada hora)
// Evita crescimento ilimitado da tabela revoked_tokens
setInterval(async () => {
  try {
    const { rowCount } = await pool.query('DELETE FROM revoked_tokens WHERE expires_at < NOW()');
    if (rowCount > 0) {
      console.log(`[AUTH] ${rowCount} token(s) expirado(s) removido(s) da blacklist`);
    }
  } catch (err) {
    console.error('[AUTH] Erro ao limpar tokens expirados:', err.message);
  }
}, 60 * 60 * 1000);

module.exports = { authMiddleware, blacklistToken };
