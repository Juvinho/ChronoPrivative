// ═══════════════════════════════════════════
// PM2 Ecosystem Configuration
// Auto-restart, monitoring, e graceful shutdown
// ═══════════════════════════════════════════

module.exports = {
  apps: [
    {
      // Nome da aplicação
      name: 'chronoprivative-backend',
      script: './server.js',
      
      // Ambiente
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },

      // ─── AUTO-RESTART SETTINGS ────────────────
      
      // Reinicia se morrer
      autorestart: true,
      
      // Máximo de vezes que pode crashar antes de dar up
      max_restarts: 10,
      
      // Intervalo de tempo para contar crashes (segundos)
      min_uptime: '30s',
      
      // Tempo de espera antes de reiniciar (ms)
      restart_delay: 4000,

      // ─── MONITORING ───────────────────────────
      
      // Executa health check a cada 30s
      cron_restart: '0 * * * * *',
      
      // Mata a app se usar mais de 512MB de RAM
      max_memory_restart: '512M',

      // ─── LOGGING ───────────────────────────────
      
      // Arquivo de logs combinado
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      
      // Merge logs de todos os clusters
      merge_logs: true,
      
      // Formato de log com timestamp
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // ─── GRACEFUL SHUTDOWN ─────────────────────
      
      // Timeout para graceful shutdown (ms)
      kill_timeout: 5000,
      
      // Sinal para graceful shutdown
      shutdown_with_message: true,

      // ─── CLUSTER MODE (OPCIONAL) ───────────────
      // instances: 2,  // Para usar 2 cores do processador
      // exec_mode: 'cluster',
    },
  ],

  // ─── DEPLOY CONFIGURATION ─────────────────
  
  deploy: {
    production: {
      user: 'node',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:username/chronoprivative.git',
      path: '/var/www/chronoprivative',
      'post-deploy': 'npm install && npm run migrate && pm2 reload ecosystem.config.js --env production',
    },
  },
};
