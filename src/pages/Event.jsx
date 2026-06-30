import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function fmtEventDate(d) {
  if (!d) return ''
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
}

const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december']
const MONTHS_SHORT = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']

function parseEventDate(p) {
  const html = p.content?.rendered || ''
  // grab text inside <legend> tags (formidable hides the real event date here)
  const legends = [...html.matchAll(/<legend[^>]*>([\s\S]*?)<\/legend>/gi)].map((m) =>
    m[1].replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
  )
  const haystack = legends.join(' · ')
  if (!haystack) return null

  // match patterns like "6 Jul 2026", "30th September 10.30am", "7th September 4pm"
  const re = new RegExp(
    '(\\d{1,2})(?:st|nd|rd|th)?\\s+(' + [...MONTHS, ...MONTHS_SHORT].join('|') + ')(?:\\s+(\\d{4}))?',
    'i'
  )
  const m = haystack.match(re)
  if (!m) return null

  const day = parseInt(m[1], 10)
  const monthIdx = [...MONTHS, ...MONTHS_SHORT].indexOf(m[2].toLowerCase())
  // guess year: prefer explicit, else next occurrence from today
  let year = m[3] ? parseInt(m[3], 10) : null
  if (!year) {
    const now = new Date()
    year = now.getFullYear()
    const candidate = new Date(year, monthIdx % 12, day)
    if (candidate < now) year += 1
  }
  const d = new Date(year, monthIdx % 12, day)
  if (isNaN(d.getTime())) return null
  return d
}

function excerpt(p) {
  const html = p.content?.rendered || ''
  const firstP = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
  if (!firstP) return ''
  return firstP[1].replace(/<[^>]*>/g, '').trim()
}

function featuredImage(p) {
  const m = p._embedded && p._embedded['wp:featuredmedia'] && p._embedded['wp:featuredmedia'][0]
  return m ? { src: m.source_url, alt: m.alt_text || '' } : null
}

function EventCard({ p, when }) {
  const img = featuredImage(p)
  return (
    <Link to={`/event/${p.slug}`} className="news-card">
      {img && (
        <span className="news-card__media">
          <img src={img.src} alt={img.alt} loading="lazy" />
        </span>
      )}
      <span className="news-card__body">
        {when && <span className="news-card__date">{fmtEventDate(when)}</span>}
        <span className="news-card__title" dangerouslySetInnerHTML={{ __html: p.title?.rendered }} />
        <span className="news-card__excerpt">{excerpt(p)}</span>
      </span>
    </Link>
  )
}

function SectionHead({ children }) {
  return <h2 className="events-group">{children}</h2>
}

export default function Event() {
  const [posts, setPosts] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let alive = true
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return
        setPosts(Array.isArray(data) ? data : [])
        setStatus('ok')
      })
      .catch(() => { if (alive) setStatus('error') })
    return () => { alive = false }
  }, [])

  const enriched = posts.map((p) => ({ p, when: parseEventDate(p) }))
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const upcoming = enriched
    .filter((e) => e.when && e.when >= now)
    .sort((a, b) => a.when - b.when)
  const undated = enriched.filter((e) => !e.when)
  const past = enriched
    .filter((e) => e.when && e.when < now)
    .sort((a, b) => b.when - a.when)

  return (
    <section className="section">
      <div className="container">
        <p className="section__kicker">Event</p>
        <h1 className="section__title">Upcoming Events</h1>
        <p className="muted">Live from fcsa.org.uk.</p>

        {status === 'loading' && <p className="muted">Loading…</p>}

        {status === 'error' && (
          <div className="empty">
            <p>Couldn’t load events.</p>
            <span className="muted">There was a problem reaching the events feed.</span>
          </div>
        )}

        {status === 'ok' && posts.length === 0 && (
          <div className="empty">
            <p>No upcoming events.</p>
            <span className="muted">New events will appear here as they’re published.</span>
          </div>
        )}

        {status === 'ok' && posts.length > 0 && (
          <>
            {upcoming.length > 0 && (
              <div className="news-list">
                <SectionHead>Upcoming</SectionHead>
                {upcoming.map(({ p, when }) => <EventCard key={p.id} p={p} when={when} />)}
              </div>
            )}

            {undated.length > 0 && (
              <div className="news-list">
                <SectionHead>Latest</SectionHead>
                {undated.map(({ p }) => <EventCard key={p.id} p={p} when={null} />)}
              </div>
            )}

            {past.length > 0 && (
              <div className="news-list events-past">
                <SectionHead>Past events</SectionHead>
                {past.map(({ p, when }) => <EventCard key={p.id} p={p} when={when} />)}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}