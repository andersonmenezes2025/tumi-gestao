module.exports = {
  apps: [{
    name: 'tumigestao-backend',
    script: './server/dist/index.js',
    interpreter: 'node',
    cwd: '/var/www/tumi/gestao',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_file: '/var/log/pm2/tumigestao-combined.log',
    out_file: '/var/log/pm2/tumigestao-out.log',
    error_file: '/var/log/pm2/tumigestao-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true,
    error_file: '/var/log/pm2/tumigestao-error.log'
  }]
};