import { Link, useNavigate } from 'react-router-dom'

const subTiles = [
  { to: '/forum/schedule', label: 'Schedule', icon: 'M7 3v2M17 3v2M4 7h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z' },
  { to: '/forum/speakers', label: 'Speakers', icon: 'M12 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM5 20v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z' },
  { to: '/forum/sponsors', label: 'Sponsors', icon: 'M12 2 15 8h-6zM2 8h20v12H2zM6 12h12v1H6zm0 3h12v1H6z' },
  { to: '/forum/venue', label: 'Venue', icon: 'M12 2a6 6 0 0 0-6 6c0 4 6 12 6 12s6-8 6-12a6 6 0 0 0-6-6zm0 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6z' },
  { to: '/forum/info', label: 'Info', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2zm0-8h-2V7h2z' },
]

export default function Forum() {
  const navigate = useNavigate()
  return (
    <section className="section">
      <div className="container">
        <div className="hub__bar">
          <button type="button" className="back-link" onClick={() => navigate(-1)}>← Back</button>
        </div>
        <p className="section__kicker">The forum</p>
        <h1 className="section__title">Forum 2026</h1>
        <p>
          Our forum is more than an annual event. This is the home for everything forum — this year's
          gathering, past editions, and news in between.
        </p>

        <div className="tiles__grid">
          {subTiles.map((t) => (
            <Link key={t.to} to={t.to} className="tile">
              <span className="tile__icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d={t.icon} />
                </svg>
              </span>
              <span className="tile__label">{t.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}