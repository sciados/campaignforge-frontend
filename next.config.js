/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-f90ef5581b1301b7b68addfc9fa42297.r2.dev',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
        pathname: '/**',
      },
    ],
    domains: ["localhost", "cloudflare.com"],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    // 🔥 FORCE REBUILD: Explicitly add API URL
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Force all pages to be dynamic
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // 🔥 FORCE REBUILD: Temporarily remove standalone to force different build
  // output: 'standalone',
  // Force dynamic rendering for all routes
  trailingSlash: false,

  // 🔥 FORCE REBUILD: Add build ID to force cache invalidation
  generateBuildId: async () => {
    return `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
};

module.exports = nextConfig;
