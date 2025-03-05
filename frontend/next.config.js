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
};

module.exports = nextConfig;
