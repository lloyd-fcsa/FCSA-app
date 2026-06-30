import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

const subTiles = [
  { to: '/news', label: 'News', icon: 'M4 4h16v16H4zM8 8h8v1H8zm0 3h8v1H8zm0 3h5v1H8z' },
  { to: '/news/ceo-blog', label: 'CEO Blog', icon: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM7 7h10v1H7zm0 3h10v1H7zm0 3h7v1H7z' },
]

export default function NewsHub() {
  const navigate = useNavigate()
  return (
    <section className="section">
      <div className="container">
        <div className="hub__bar">
          <button type="button" className="back-link" onClick={() => navigate(-1)}>← Back</button>
        </div>
        <p className="section__kicker">Industry News</p>
        <h1 className="section__title">Industry News</h1>

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