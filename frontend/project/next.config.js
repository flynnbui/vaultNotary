/** @type {import('next').NextConfig} */
const nextConfig = {
  // Commented out 'output: export' to enable middleware for Auth0
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
