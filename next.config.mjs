

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot: projectRoot,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dev-rubik.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
    ]
  },
  turbopack: {
  },
};

export default nextConfig;
