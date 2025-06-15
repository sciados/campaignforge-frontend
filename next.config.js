/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'cloudflare.com'],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  // Force all pages to be dynamic
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Disable static optimization completely
  output: 'standalone',
  // Force dynamic rendering for all routes
  trailingSlash: false,
}

module.exports = nextConfig