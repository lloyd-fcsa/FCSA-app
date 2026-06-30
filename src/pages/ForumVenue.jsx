import { useEffect, useState } from 'react'
import { loadForum, img } from '../lib/forum.js'

export default function ForumVenue() {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let alive = true
    loadForum()
      .then((d) => { if (alive) { setData(d); setStatus('ok') } })
      .catch(() => { if (alive) setStatus('error') })
    return () => { alive = false }
  }, [])

  const venue = (data?.venues || [])[0]

  return (
    <section className="section">
      <div className="container">
        <p className="section__kicker">Forum 2026</p>
        <h1 className="section__title">Venue</h1>

        {status === 'loading' && <p className="muted">Loading…</p>}
        {status === 'error' && (
          <div className="empty"><p>Couldn’t load venue info.</p></div>
        )}

        {status === 'ok' && venue && (
          <div className="venue">
            {img(venue.teaser, 'large') && (
              <span className="venue__photo">
                <img src={img(venue.teaser, 'large')} alt={venue.name} loading="lazy" />
              </span>
            )}
            <h2 className="venue__name">{venue.name}</h2>
            {venue.textHtml && (
              <div className="wp-content" dangerouslySetInnerHTML={{ __html: venue.textHtml }} />
            )}
            {venue.attachments && venue.attachments.length > 0 && (
              <div className="venue__links">
                {venue.attachments.map((a) => (
                  <a key={a._id} href={a.link} className="button" target="_blank" rel="noreferrer">
                    {a.name || 'Visit website'}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {status === 'ok' && !venue && (
          <div className="empty"><p>Venue info coming soon.</p></div>
        )}
      </div>
    </section>
  )
}