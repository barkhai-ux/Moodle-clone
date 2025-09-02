/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: false,
  experimental: {
    forceSwcTransforms: false,
  },
};

module.exports = nextConfig;
