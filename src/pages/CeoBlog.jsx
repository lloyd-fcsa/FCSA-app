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

function isCeoPost(p) {
  const terms = (p._embedded && p._embedded['wp:term']) || []
  return terms.flat().some((t) =>
    t.taxonomy === 'post_tag' && (t.slug === 'ceo' || t.slug === 'ceo-blog')
  )
}

export default function CeoBlog() {
  const [posts, setPosts] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let alive = true
    fetch('/api/news?per_page=50')
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return
        setPosts((Array.isArray(data) ? data : []).filter(isCeoPost))
        setStatus('ok')
      })
      .catch(() => { if (alive) setStatus('error') })
    return () => { alive = false }
  }, [])

  return (
    <section className="section">
      <div className="container">
        <p className="section__kicker">CEO Blog</p>
        <h1 className="section__title">CEO Blog</h1>
        <p className="muted">Posts from the FCSA Chief Executive.</p>

        {status === 'loading' && <p className="muted">Loading…</p>}

        {status === 'error' && (
          <div className="empty">
            <p>Couldn’t load posts.</p>
            <span className="muted">There was a problem reaching the feed.</span>
          </div>
        )}

        {status === 'ok' && posts.length === 0 && (
          <div className="empty">
            <p>No CEO blog posts yet.</p>
            <span className="muted">Posts tagged “ceo” will appear here.</span>
          </div>
        )}

        {status === 'ok' && posts.length > 0 && (
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