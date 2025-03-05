/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'airadioplayer-bucket.s3.us-east-1.amazonaws.com',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Ignore TypeScript errors
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignore ESLint errors
  },
  swcMinify: true, // Enable SWC minification for faster builds
};

module.exports = nextConfig;