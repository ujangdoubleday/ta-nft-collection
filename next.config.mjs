import withBundleAnalyzer from '@next/bundle-analyzer'
import withPlaiceholder from '@plaiceholder/next'

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  experimental: {
    authInterrupts: true,
  },
  // Add headers configuration for cookie handling
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXTAUTH_URL || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ]
  },
  // Configure allowed image domains
  images: {
    domains: [
      'gateway.pinata.cloud',
      'ipfs.io',
      'dweb.link',
      'cyan-dead-reptile-256.mypinata.cloud',
      'eth-sepolia.g.alchemy.com',
      'res.cloudinary.com',
    ],
  }
}

// Apply plaiceholder and bundle analyzer
const nextConfig = withPlaiceholder(withAnalyzer(baseConfig))

export default nextConfig
