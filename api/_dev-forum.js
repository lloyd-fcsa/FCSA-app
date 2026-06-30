// Dev-only middleware for /api/forum (proxies Lineupr public event data endpoint)

const ID = '695ce96664f08dd0774bf000'

export function forumDevMiddleware(app) {
  app.use(async (req, res, next) => {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname !== '/api/forum') return next()

    try {
      const r = await fetch(`https://api.lineupr.com/v2/events/${ID}/data`, {
        headers: {
          Accept: 'application/json',
          Origin: 'https://fcsa.lineupr.com',
          Referer: 'https://fcsa.lineupr.com/fcsa-forum-2026',
        },
      })
      const text = await r.text()
      res.setHeader('Content-Type', 'application/json')
      res.end(text)
    } catch {
      res.setHeader('Content-Type', 'application/json')
      res.end('{}')
    }
  })
}