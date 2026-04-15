module.exports = {
  apps: [
    {
      name: 'excel-to-word',
      cwd: '/var/www/EXCELtoWORD/projects',
      script: 'bash',
      args: './scripts/start.sh',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '700M',
      env: {
        NODE_ENV: 'production',
        COZE_PROJECT_ENV: 'PROD',
        COZE_WORKSPACE_PATH: '/var/www/EXCELtoWORD/projects',
        HOST: '0.0.0.0',
        PORT: '5000',
        DEPLOY_RUN_PORT: '5000',
      },
    },
  ],
};
