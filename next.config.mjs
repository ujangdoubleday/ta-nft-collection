import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'
import withBundleAnalyzer from '@next/bundle-analyzer'

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
}

const nextConfig = withAnalyzer(baseConfig)

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform()
}

export default nextConfig
