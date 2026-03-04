// ═══════════════════════════════════════════
// Controller de Autenticação
// ═══════════════════════════════════════════

const jwt = require('jsonwebtoken');
const { query } = require('../db/pool');
const { comparePassword } = require('../utils/hashPassword');
const { blacklistToken } = require('../middlewares/authMiddleware');

// POST /api/auth/login
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'Username e password são obrigatórios.',
      });
    }

    // Busca usuário (NUNCA retorna password_hash na resposta final)
    const result = await query(
      'SELECT id, username, password_hash, role FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Credenciais inválidas.',
      });
    }

    const user = result.rows[0];
    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Credenciais inválidas.',
      });
    }

    // Gera JWT — expira em 24h
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'ACCESS_GRANTED',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[AUTH] Erro no login:', error.message);
    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Erro interno do servidor.',
    });
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  try {
    const token = req.token;
    if (token) {
      await blacklistToken(token);
    }
    return res.status(200).json({
      message: 'LOGGED_OUT',
    });
  } catch (error) {
    console.error('[AUTH] Erro no logout:', error.message);
    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Erro interno do servidor.',
    });
  }
}

module.exports = { login, logout };
