import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    /**
     * Image Optimization is off on purpose.
     *
     * The Vercel account this deploys to has exhausted its Image Optimization
     * quota. With the optimizer on, every /_next/image request answers 402 and
     * production renders with no images at all. Everything this site ships is
     * an SVG we generate ourselves, so the optimizer buys nothing here anyway.
     */
    unoptimized: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
}

export default nextConfig
