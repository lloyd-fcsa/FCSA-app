// Dev-only middleware that runs the /api/members scraping logic locally
// (vite dev doesn't execute Vercel serverless functions).

const WP = 'https://www.fcsa.org.uk/wp-json/wp/v2/fcsa-member'

async function scrapeLogo(slug, fm) {
  if (!fm) return null
  try {
    const r = await fetch(`https://www.fcsa.org.uk/fcsa-member/${slug}/`, {
      headers: { 'User-Agent': 'fcsa-app/1.0' },
    })
    if (!r.ok) return null
    const t = await r.text()
    const re = new RegExp(`<img[^>]*wp-image-${fm}[^>]*>`, 'i')
    const m = t.match(re)
    if (!m) return null
    const src = m[0].match(/src="([^"]+)"/)
    return src ? src[1] : null
  } catch {
    return null
  }
}

export function membersDevMiddleware(app) {
  console.log('[fcsa-dev] /api/members dev middleware registered')
  app.use(async (req, res, next) => {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname !== '/api/members') return next()
    console.log('[fcsa-dev] handling /api/members')

    const per_page = url.searchParams.get('per_page') || '100'
    try {
      const r = await fetch(`${WP}?per_page=${encodeURIComponent(per_page)}&_embed=wp:featuredmedia,wp:term`, {
        headers: { 'User-Agent': 'fcsa-app/1.0' },
      })
      const text = await r.text()
      let posts
      try {
        posts = JSON.parse(text)
      } catch {
        console.log('[fcsa-dev] WP returned non-JSON (status', r.status + '); using []')
        posts = []
      }
      const enriched = await Promise.all(
        (posts || []).map(async (p) => {
          const m =
            p._embedded &&
            p._embedded['wp:featuredmedia'] &&
            p._embedded['wp:featuredmedia'][0]
          let img = m ? m.source_url : null
          if (!img && p.featured_media) {
            img = await scrapeLogo(p.slug, p.featured_media)
          }
          return { ...p, _scraped_logo: img }
        })
      )
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(enriched))
    } catch (e) {
      console.log('[fcsa-dev] /api/members error:', e.message)
      res.setHeader('Content-Type', 'application/json')
      res.end('[]')
    }
  })
}