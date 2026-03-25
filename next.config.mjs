

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
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
