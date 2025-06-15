/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'cloudflare.com'],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  // Disable static optimization for auth pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Ensure dynamic rendering for auth pages
  trailingSlash: false,
}

module.exports = nextConfig