/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: false,
  experimental: {
    forceSwcTransforms: false,
  },
  // Skip static generation for pages that use dynamic features
  trailingSlash: false,
  // Disable static optimization during build
  generateEtags: false,
  // Disable image optimization for better compatibility
  images: {
    unoptimized: true,
  },
  // Ensure proper asset handling
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
};

module.exports = nextConfig;
