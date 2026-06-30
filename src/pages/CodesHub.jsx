import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

const subTiles = [
  { to: '/codes/directory', label: 'Directory of Members', icon: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2c-3 0-6 1.5-6 4v1h12v-1c0-2.5-3-4-6-4zm7-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm.5 2c-.6 0-1.2.1-1.7.2 1.1 1 1.7 2.2 1.7 3.8v1H21v-1c0-2.5-2-4-4.5-4z' },
  { to: '/codes/fcsa-codes', label: 'FCSA Codes', icon: 'M6 2h8l4 4v16H6zM14 2v4h4M9 13h6v1H9zm0-3h6v1H9z' },
]

export default function CodesHub() {
  const navigate = useNavigate()
  return (
    <section className="section">
      <div className="container">
        <div className="hub__bar">
          <button type="button" className="back-link" onClick={() => navigate(-1)}>← Back</button>
        </div>
        <p className="section__kicker">Directory &amp; Codes</p>
        <h1 className="section__title">Directory &amp; Codes</h1>

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