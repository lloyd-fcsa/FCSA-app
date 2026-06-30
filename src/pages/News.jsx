import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function excerpt(p) {
  if (!p.excerpt?.rendered) return ''
  return p.excerpt.rendered.replace(/<[^>]*>/g, '').trim()
}

function featuredImage(p) {
  const m = p._embedded && p._embedded['wp:featuredmedia'] && p._embedded['wp:featuredmedia'][0]
  return m ? { src: m.source_url, alt: m.alt_text || '' } : null
}

export default function News() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let alive = true
    fetch('/api/news')
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return
        setPosts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        if (!alive) return
        setError(true)
        setLoading(false)
      })
    return () => { alive = false }
  }, [])

  return (
    <section className="section">
      <div className="container">
        <p className="section__kicker">News</p>
        <h1 className="section__title">Industry News</h1>
        <p className="muted">Latest from fcsa.org.uk.</p>

        {loading && <p className="muted">Loading…</p>}

        {!loading && error && (
          <div className="empty">
            <p>Couldn’t load news.</p>
            <span className="muted">There was a problem reaching the news feed.</span>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="empty">
            <p>No news yet.</p>
            <span className="muted">Stories will appear here as they’re published.</span>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="news-list">
            {posts.map((p) => {
              const img = featuredImage(p)
              return (
                <Link key={p.id} to={`/news/${p.slug}`} className="news-card">
                  {img && (
                    <span className="news-card__media">
                      <img src={img.src} alt={img.alt} loading="lazy" />
                    </span>
                  )}
                  <span className="news-card__body">
                    <span className="news-card__date">{fmtDate(p.date)}</span>
                    <span className="news-card__title" dangerouslySetInnerHTML={{ __html: p.title?.rendered }} />
                    <span className="news-card__excerpt">{excerpt(p)}</span>
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}