/** @type {import('next').NextConfig} */
// NETLIFY STATIC EXPORT VERSION - Use this if data loading issues persist
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  output: 'export', // Static export for maximum Netlify compatibility
  images: {
    unoptimized: true, // Required for static export
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Remove PWA for now to avoid cache issues
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Headers for static export
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
