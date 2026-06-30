import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function featuredImage(p) {
  const m = p._embedded && p._embedded['wp:featuredmedia'] && p._embedded['wp:featuredmedia'][0]
  return m ? { src: m.source_url, alt: m.alt_text || '' } : null
}

function authorName(p) {
  const a = p._embedded && p._embedded.author && p._embedded.author[0]
  return a?.name || 'FCSA'
}

export default function NewsPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let alive = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus('loading')
    fetch(`/api/news?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return
        if (Array.isArray(data) && data.length > 0) {
          setPost(data[0])
          setStatus('ok')
        } else {
          setStatus('error')
        }
      })
      .catch(() => {
        if (!alive) return
        setStatus('error')
      })
    return () => { alive = false }
  }, [slug])

  return (
    <section className="section news-post">
      <div className="container news-post__bar">
        <button type="button" className="back-link" onClick={() => navigate(-1)}>← Back</button>
        <Link to="/news" className="back-link">All news</Link>
      </div>

      {status === 'loading' && <div className="container"><p className="muted">Loading…</p></div>}

      {status === 'error' && (
        <div className="container">
          <div className="empty">
            <p>Couldn’t load this story.</p>
            <span className="muted">It may have been moved or removed.</span>
          </div>
        </div>
      )}

      {status === 'ok' && post && (
        <article className="news-post__article">
          {featuredImage(post) && (
            <span className="news-post__hero">
              <img src={featuredImage(post).src} alt={featuredImage(post).alt} />
            </span>
          )}
          <div className="container news-post__content">
            <p className="news-post__meta">
              {fmtDate(post.date)} · {authorName(post)}
            </p>
            <h1
              className="news-post__title"
              dangerouslySetInnerHTML={{ __html: post.title?.rendered }}
            />
            <div
              className="wp-content"
              dangerouslySetInnerHTML={{ __html: post.content?.rendered || '' }}
            />
            <div className="news-post__bar news-post__bar--bottom">
              <button type="button" className="back-link" onClick={() => navigate(-1)}>← Back</button>
              <a href={post.link} className="back-link" target="_blank" rel="noreferrer">View on fcsa.org.uk</a>
            </div>
          </div>
        </article>
      )}
    </section>
  )
}