import type { MetadataRoute } from 'next'
import { client } from '@/config/client.config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Nothing to hide; this is a five-page marketing site with no admin area.
      },
    ],
    sitemap: `${client.origin}/sitemap.xml`,
    host: client.origin,
  }
}
