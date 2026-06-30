import { Link } from 'react-router-dom'

const tiles = [
  { to: '/codes', label: 'Directory & Codes', icon: 'M6 2h8l4 4v16H6zM14 2v4h4M9 13h6v1H9zm0-3h6v1H9z', feature: true },
  { to: '/news', label: 'Industry News', icon: 'M4 4h16v16H4zM8 8h8v1H8zm0 3h8v1H8zm0 3h5v1H8z' },
  { to: '/forum', label: 'Forum 2026', icon: 'M4 4h16v12H7l-3 3z' },
  { to: '/event', label: 'Upcoming Events', icon: 'M7 3v2M17 3v2M4 7h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z' },
  { to: '/resources', label: 'Webinars & Resources', icon: 'M6 2h8l4 4v16H6zM14 2v4h4M9 13h6v1H9zm0-3h6v1H9z' },
  { to: '/community', label: 'Ask the Community', icon: 'M4 4h16v10H7l-3 3z' },
  { to: '/about', label: 'About FCSA', icon: 'M12 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM5 20v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z' },
]

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <h1 className="hero__title">FCSA — bringing the community together.</h1>
        </div>
      </section>

      <section className="tiles">
        <div className="container tiles__grid">
          {tiles.map((t) => (
            <Link key={t.to} to={t.to} className={t.feature ? 'tile tile--feature' : 'tile'}>
              <span className="tile__icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d={t.icon} />
                </svg>
              </span>
              <span className="tile__label">{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}