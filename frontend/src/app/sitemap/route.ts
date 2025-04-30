import { PUBLIC_SITE_URL } from '@/lib/constants'

export async function GET() {
  // ✅ Define static routes
  const staticRoutes = ['', 'grabit', 'humanizer-ai', 'recommendr', 'contact', 'privacy']

  // ✅ Generate sitemap entries
  const sitemapEntries = [...staticRoutes.map((route) => `<url><loc>${PUBLIC_SITE_URL}/${route}</loc></url>`)]

  // ✅ Build the XML Sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${sitemapEntries.join('\n')}
    </urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
