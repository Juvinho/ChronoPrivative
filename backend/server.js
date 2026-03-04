// ═══════════════════════════════════════════
// CHRONOPRIVATIVE — SERVER ENTRY POINT
// ═══════════════════════════════════════════

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { apiLimiter } = require('./src/middlewares/rateLimiter');
const { pool } = require('./src/db/pool');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;

// ─── MIDDLEWARES GLOBAIS ─────────────────

// Segurança HTTP
app.use(helmet());

// CORS — aceita apenas o domínio do frontend
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting geral
app.use('/api', apiLimiter);

// Trust proxy (para IP correto atrás de reverse proxy)
app.set('trust proxy', 1);

// ─── ROTAS ───────────────────────────────

// Root endpoint — Raiz da API
app.get('/', (req, res) => {
  res.status(200).json({
    api: 'ChronoPrivative Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      posts: '/api/posts',
      reactions: '/api/reactions',
      comments: '/api/comments',
      tags: '/api/tags',
      user: '/api/user',
    },
  });
});

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/posts', require('./src/routes/posts'));
app.use('/api/reactions', require('./src/routes/reactions'));
app.use('/api/comments', require('./src/routes/comments'));
app.use('/api/tags', require('./src/routes/tags'));
app.use('/api/user', require('./src/routes/users'));

// ─── HEALTH CHECK APRIMORADO ────────────

// Rastreia saúde do servidor
const health = {
  startTime: Date.now(),
  requestCount: 0,
  lastRequest: null,
  memoryWarnings: 0,
};

// Middleware para rastrear requisições
app.use((req, res, next) => {
  health.requestCount++;
  health.lastRequest = new Date().toISOString();
  next();
});

// Health check detalhado com monitoramento
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await Promise.race([
      pool.query('SELECT NOW()'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('DB timeout')), 5000)
      ),
    ]);

    const uptime = Math.floor((Date.now() - health.startTime) / 1000);
    const memUsage = process.memoryUsage();
    const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    res.status(200).json({
      status: 'ONLINE',
      database: 'CONNECTED',
      timestamp: new Date().toISOString(),
      uptime: `${uptime}s`,
      health: {
        requests: health.requestCount,
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
          total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
          percent: Math.round(memPercent) + '%',
          warning: memPercent > 80,
        },
        lastRequest: health.lastRequest,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'DEGRADED',
      database: 'DISCONNECTED',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ─── MONITORAMENTO DE MEMÓRIA ────────────

// Alerta se memória exceder 80%
setInterval(() => {
  const memUsage = process.memoryUsage();
  const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  
  if (memPercent > 80) {
    health.memoryWarnings++;
    console.warn(`[MEMORY WARNING] ${Math.round(memPercent)}% de heap utilizado`);
    
    // Se exceeder 90%, force garbage collection se disponível
    if (memPercent > 90 && global.gc) {
      console.warn('[MEMORY] Executando garbage collection...');
      global.gc();
    }
  }
}, 30000); // A cada 30 segundos

// ─── INICIALIZAÇÃO COM RETRY ────────────

// ─── 404 HANDLER ─────────────────────────

app.use((req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Rota ${req.method} ${req.path} não encontrada.`,
  });
});

// ─── ERROR HANDLER GLOBAL ────────────────

app.use((err, req, res, next) => {
  console.error('[SERVER] Erro não tratado:', err);
  res.status(500).json({
    error: 'SERVER_ERROR',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor.',
  });
});

// ─── INICIALIZAÇÃO COM RETRY ────────────

let server;
let isShuttingDown = false;

const startServer = () => {
  try {
    server = app.listen(PORT, () => {
      console.log(`
  ╔═══════════════════════════════════════════╗
  ║   CHRONOPRIVATIVE BACKEND — ONLINE        ║
  ║   ✅ Porta ativa: ${PORT}                    ║
  ║   🔗 URL: http://localhost:${PORT}        ║
  ║   Env: ${process.env.NODE_ENV || 'development'}                    ║
  ║   PID: ${process.pid}                             ║
  ║   Health: /api/health                     ║
  ║   Config: PORT=${process.env.PORT || '(fallback 3002)'}         ║
  ╚═══════════════════════════════════════════╝
      `);
    });

    // Listener para erros de servidor
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[ERROR] Porta ${PORT} já está em uso!`);
        console.log('[RETRY] Tentando novamente em 3 segundos...');
        setTimeout(startServer, 3000);
      } else {
        console.error('[ERROR] Erro no servidor:', err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('[ERROR] Falha ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Inicia servidor
startServer();

// ───────────────────────────────────────────
// GRACEFUL SHUTDOWN — Tratamento Inteligente
// ───────────────────────────────────────────

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n[SHUTDOWN] ${signal} recebido. Encerrando gracefully...`);
  console.log('[SHUTDOWN] Aguardando requisições ativas...');

  // Timeout para encerramento (max 10s)
  const shutdownTimeout = setTimeout(() => {
    console.warn('[SHUTDOWN] Timeout atingido. Forçando encerramento...');
    process.exit(1);
  }, 10000);

  try {
    // 1. Parar de aceitar novas conexões
    if (server) {
      server.close(() => {
        console.log('[SHUTDOWN] HTTP server fechado');
      });
    }

    // 2. Fechar conexões com banco de dados
    console.log('[SHUTDOWN] Fechando pool de conexões PostgreSQL...');
    await pool.end();
    console.log('[SHUTDOWN] Pool fechado com sucesso');

    clearTimeout(shutdownTimeout);
    console.log('[SHUTDOWN] ✓ Encerramento graceful concluído');
    process.exit(0);
  } catch (error) {
    console.error('[SHUTDOWN] Erro durante encerramento:', error);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
};

// Sinais de encerramento
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));

// ─── TRATAMENTO DE ERROS NÃO CAPTURADOS ────

process.on('uncaughtException', (error) => {
  console.error('[FATAL] Exceção não capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Promise rejection não tratado:', reason);
  process.exit(1);
});
