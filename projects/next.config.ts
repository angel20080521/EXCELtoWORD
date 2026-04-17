import type { NextConfig } from 'next';
///
const { join } = require('path');

module.exports = {
  turbopack: {
    root: join(__dirname, ".."),  // 设为项目根目录的上一级，允许访问外部链接
  },
};
///
const nextConfig: NextConfig = {
 // output: 'export',
 // basePath: '/EXCELtoWORD',
  allowedDevOrigins: ['*.dev.coze.site', '124.222.92.176'],
  outputFileTracingExcludes: {
    '*': [
      '**/venv/**',
      '**/.venv/**',
      '**/temp/**',
      '**/.git/**',
    ],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;