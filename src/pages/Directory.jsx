import { useEffect, useState, useMemo } from 'react'

function logo(p) {
  const m = p._embedded && p._embedded['wp:featuredmedia'] && p._embedded['wp:featuredmedia'][0]
  if (m) return m.source_url
  return p._scraped_logo || null
}

function certifications(p) {
  const terms = (p._embedded && p._embedded['wp:term']) || []
  return terms.flat().filter((t) => t.taxonomy === 'fcsa-certification')
}

function excerpt(p) {
  return (p.excerpt?.rendered || '').replace(/<[^>]*>/g, '').trim()
}

export default function Directory() {
  const [members, setMembers] = useState([])
  const [status, setStatus] = useState('loading')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    let alive = true
    fetch('/api/members')
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return
        setMembers(Array.isArray(data) ? data : [])
        setStatus('ok')
      })
      .catch(() => { if (alive) setStatus('error') })
    return () => { alive = false }
  }, [])

  const allCerts = useMemo(() => {
    const set = new Map()
    members.forEach((m) => {
      certifications(m).forEach((c) => set.set(c.slug, c.name))
    })
    return [...set.entries()].map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [members])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return members
      .filter((m) => filter === 'all' || certifications(m).some((c) => c.slug === filter))
      .filter((m) => {
        if (!q) return true
        const name = (m.title?.rendered || '').toLowerCase()
        const ex = excerpt(m).toLowerCase()
        return name.includes(q) || ex.includes(q)
      })
      .sort((a, b) => (a.title?.rendered || '').localeCompare(b.title?.rendered || ''))
  }, [members, query, filter])

  return (
    <section className="section">
      <div className="container">
        <p className="section__kicker">Directory</p>
        <h1 className="section__title">Directory of Members</h1>
        <p className="muted">A public register of FCSA accredited members.</p>

        <input
          type="search"
          className="dir-search"
          placeholder="Search members…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search members"
        />

        <div className="dir-filters">
          <button
            type="button"
            className={filter === 'all' ? 'dir-chip is-active' : 'dir-chip'}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {allCerts.map((c) => (
            <button
              key={c.slug}
              type="button"
              className={filter === c.slug ? 'dir-chip is-active' : 'dir-chip'}
              onClick={() => setFilter(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <p className="dir-count">
          {status === 'ok' && `${filtered.length} ${filtered.length === 1 ? 'member' : 'members'}`}
        </p>

        {status === 'loading' && <p className="muted">Loading…</p>}

        {status === 'error' && (
          <div className="empty">
            <p>Couldn’t load members.</p>
            <span className="muted">There was a problem reaching the directory.</span>
          </div>
        )}

        {status === 'ok' && filtered.length === 0 && (
          <div className="empty">
            <p>No members found.</p>
            <span className="muted">Try a different search or filter.</span>
          </div>
        )}

        {status === 'ok' && filtered.length > 0 && (
          <div className="dir-grid">
            {filtered.map((m) => {
              const img = logo(m)
              const certs = certifications(m)
              return (
                <a key={m.id} href={m.link} className="dir-card" target="_blank" rel="noreferrer">
                  <span className="dir-card__logo">
                    {img ? <img src={img} alt="" loading="lazy" /> : <span className="dir-card__placeholder">{(m.title?.rendered || '?').charAt(0)}</span>}
                  </span>
                  <span className="dir-card__body">
                    <span className="dir-card__title" dangerouslySetInnerHTML={{ __html: m.title?.rendered }} />
                    {certs.length > 0 && (
                      <span className="dir-card__certs">
                        {certs.map((c) => (
                          <span key={c.slug} className="dir-card__cert">{c.name}</span>
                        ))}
                      </span>
                    )}
                    <span className="dir-card__excerpt">{excerpt(m).slice(0, 120)}…</span>
                  </span>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}