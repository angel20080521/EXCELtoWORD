import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/EXCELtoWORD',
  allowedDevOrigins: ['*.dev.coze.site'],
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