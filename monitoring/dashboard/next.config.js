/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    COLLECTOR_URL: process.env.COLLECTOR_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig
