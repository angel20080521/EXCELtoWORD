module.exports = {
  apps: [
    {
      name: 'excel-to-word',
      cwd: '/home/ubuntu/EXCELtoWORD/projects',
      script: 'bash',
      args: './scripts/start.sh',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '700M',
      env: {
        NODE_ENV: 'production',
        COZE_PROJECT_ENV: 'DEV',
        COZE_WORKSPACE_PATH: '/home/ubuntu/EXCELtoWORD/projects',
        HOST: '0.0.0.0',
        NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: 'z3qknrVwhiyucD5wGOi+PBAf2Dvp+cL2NfeX57czL40=',
        PORT: '5000',
        DEPLOY_RUN_PORT: '5000',
      },
    },
  ],
};