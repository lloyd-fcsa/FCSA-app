import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function cleanContent(html) {
  if (!html) return ''
  let out = html
  // strip formidable registration form and everything after it
  out = out.split(/<div class="frm_forms[\s\S]*$/i)[0]
  return out.trim()
}

const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december']
const MONTHS_SHORT = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']

function parseEventDate(p) {
  const html = p.content?.rendered || ''
  const legends = [...html.matchAll(/<legend[^>]*>([\s\S]*?)<\/legend>/gi)].map((m) =>
    m[1].replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
  )
  const haystack = legends.join(' · ')
  if (!haystack) return null
  const re = new RegExp(
    '(\\d{1,2})(?:st|nd|rd|th)?\\s+(' + [...MONTHS, ...MONTHS_SHORT].join('|') + ')(?:\\s+(\\d{4}))?',
    'i'
  )
  const m = haystack.match(re)
  if (!m) return null
  const day = parseInt(m[1], 10)
  const monthIdx = [...MONTHS, ...MONTHS_SHORT].indexOf(m[2].toLowerCase())
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

function fmtEventDateFull(d) {
  if (!d) return ''
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function EventPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let alive = true
    fetch(`/api/events?slug=${encodeURIComponent(slug)}`)
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
      .catch(() => { if (alive) setStatus('error') })
    return () => { alive = false }
  }, [slug])

  return (
    <section className="section news-post">
      <div className="container news-post__bar">
        <button type="button" className="back-link" onClick={() => navigate(-1)}>← Back</button>
        <Link to="/event" className="back-link">All events</Link>
      </div>

      {status === 'loading' && <div className="container"><p className="muted">Loading…</p></div>}

      {status === 'error' && (
        <div className="container">
          <div className="empty">
            <p>Couldn’t load this event.</p>
            <span className="muted">It may have been moved or removed.</span>
          </div>
        </div>
      )}

      {status === 'ok' && post && (
        <article className="news-post__article">
          <div className="container news-post__content">
            {(() => {
              const when = parseEventDate(post)
              return when
                ? <p className="news-post__meta">{fmtEventDateFull(when)}</p>
                : <p className="news-post__meta">posted {fmtDate(post.date)}</p>
            })()}
            <h1
              className="news-post__title"
              dangerouslySetInnerHTML={{ __html: post.title?.rendered }}
            />
            <div
              className="wp-content"
              dangerouslySetInnerHTML={{ __html: cleanContent(post.content?.rendered) }}
            />
            <a href={post.link} className="button" target="_blank" rel="noreferrer">Register on fcsa.org.uk</a>
            <div className="news-post__bar news-post__bar--bottom">
              <button type="button" className="back-link" onClick={() => navigate(-1)}>← Back</button>
              <Link to="/event" className="back-link">All events</Link>
            </div>
          </div>
        </article>
      )}
    </section>
  )
}