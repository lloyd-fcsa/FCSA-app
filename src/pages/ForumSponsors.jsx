import { useEffect, useState } from 'react'
import { loadForum, img, stripHtml } from '../lib/forum.js'

export default function ForumSponsors() {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let alive = true
    loadForum()
      .then((d) => { if (alive) { setData(d); setStatus('ok') } })
      .catch(() => { if (alive) setStatus('error') })
    return () => { alive = false }
  }, [])

  const sponsors = (data?.sponsors || [])
    .slice()
    .sort((a, b) => (a.sortOrder || '').localeCompare(b.sortOrder || '') || (a.name || '').localeCompare(b.name || ''))

  return (
    <section className="section">
      <div className="container">
        <p className="section__kicker">Forum 2026</p>
        <h1 className="section__title">Sponsors</h1>
        <p className="muted">Our forum sponsors and partners.</p>

        {status === 'loading' && <p className="muted">Loading…</p>}
        {status === 'error' && (
          <div className="empty"><p>Couldn’t load sponsors.</p></div>
        )}

        {status === 'ok' && sponsors.length > 0 && (
          <div className="sponsor-list">
            {sponsors.map((s) => {
              const logo = img(s.teaser)
              const link = s.attachments && s.attachments[0] && s.attachments[0].link
              const Card = link ? 'a' : 'div'
              const cardProps = link ? { href: link, target: '_blank', rel: 'noreferrer' } : {}
              return (
                <Card key={s._id} className="sponsor-card" {...cardProps}>
                  {logo && (
                    <span className="sponsor-card__logo">
                      <img src={logo} alt={s.name} loading="lazy" />
                    </span>
                  )}
                  <span className="sponsor-card__body">
                    <span className="sponsor-card__name">{s.name}</span>
                    {s.textHtml && <span className="sponsor-card__desc">{stripHtml(s.textHtml).slice(0, 220)}…</span>}
                    {link && <span className="sponsor-card__link">Visit website →</span>}
                  </span>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}