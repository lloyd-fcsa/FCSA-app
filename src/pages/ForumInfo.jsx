import { useEffect, useState } from 'react'
import { loadForum } from '../lib/forum.js'

export default function ForumInfo() {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let alive = true
    loadForum()
      .then((d) => { if (alive) { setData(d); setStatus('ok') } })
      .catch(() => { if (alive) setStatus('error') })
    return () => { alive = false }
  }, [])

  const pages = (data?.pages || []).filter((p) => p.textHtml)

  return (
    <section className="section">
      <div className="container">
        <p className="section__kicker">Forum 2026</p>
        <h1 className="section__title">Info</h1>

        {status === 'loading' && <p className="muted">Loading…</p>}
        {status === 'error' && (
          <div className="empty"><p>Couldn’t load info.</p></div>
        )}

        {status === 'ok' && pages.length === 0 && (
          <div className="empty">
            <p>Info coming soon.</p>
            <span className="muted">FAQs and practical details will appear here.</span>
          </div>
        )}

        {status === 'ok' && pages.length > 0 && (
          <div className="info-list">
            {pages.map((p) => (
              <article key={p._id} className="info-card">
                <h2 className="info-card__title">{p.name}</h2>
                <div className="wp-content" dangerouslySetInnerHTML={{ __html: p.textHtml }} />
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}