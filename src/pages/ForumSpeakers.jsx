import { useEffect, useState } from 'react'
import { loadForum, img, stripHtml } from '../lib/forum.js'

export default function ForumSpeakers() {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let alive = true
    loadForum()
      .then((d) => { if (alive) { setData(d); setStatus('ok') } })
      .catch(() => { if (alive) setStatus('error') })
    return () => { alive = false }
  }, [])

  const speakers = (data?.contributors || [])
    .slice()
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))

  return (
    <section className="section">
      <div className="container">
        <p className="section__kicker">Forum 2026</p>
        <h1 className="section__title">Speakers</h1>
        <p className="muted">People speaking at this year's forum.</p>

        {status === 'loading' && <p className="muted">Loading…</p>}
        {status === 'error' && (
          <div className="empty"><p>Couldn’t load speakers.</p></div>
        )}

        {status === 'ok' && speakers.length > 0 && (
          <div className="speaker-grid">
            {speakers.map((s) => {
              const photo = img(s.teaser)
              return (
                <article key={s._id} className="speaker-card">
                  <span className="speaker-card__photo">
                    {photo
                      ? <img src={photo} alt={s.name} loading="lazy" />
                      : <span className="speaker-card__placeholder">{(s.name || '?').charAt(0)}</span>}
                  </span>
                  <span className="speaker-card__body">
                    <span className="speaker-card__name">{s.name}</span>
                    {s.subtitle && <span className="speaker-card__sub">{s.subtitle}</span>}
                    {s.textHtml && <span className="speaker-card__bio">{stripHtml(s.textHtml).slice(0, 160)}…</span>}
                  </span>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}