import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { supabaseReady } from '../lib/supabase.js'

const sections = [
  { to: '/admin/forum', label: 'Forum', icon: 'M4 4h16v12H7l-3 3z' },
  { to: '/admin/news', label: 'News', icon: 'M4 4h16v16H4z', disabled: true },
  { to: '/admin/events', label: 'Events', icon: 'M7 3v2M17 3v2M4 7h16', disabled: true },
  { to: '/admin/members', label: 'Members', icon: 'M12 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z', disabled: true },
  { to: '/admin/codes', label: 'Codes', icon: 'M6 2h8l4 4v16H6z', disabled: true },
  { to: '/admin/community', label: 'Community', icon: 'M4 4h16v10H7l-3 3z' },
]

export default function AdminShell({ children, title }) {
  const { user, isAdmin, loading } = useAuth()
  const loc = useLocation()

  if (!supabaseReady) {
    return (
      <section className="section">
        <div className="container narrow">
          <div className="empty">
            <p>Supabase not connected.</p>
            <span className="muted">Add your keys to .env to enable admin.</span>
          </div>
        </div>
      </section>
    )
  }

  if (loading) {
    return <section className="section"><div className="container"><p className="muted">Loading…</p></div></section>
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: loc.pathname }} replace />
  }

  if (!isAdmin) {
    return (
      <section className="section">
        <div className="container narrow">
          <div className="empty">
            <p>Admins only.</p>
            <span className="muted">Your account doesn't have admin access.</span>
          </div>
          <p><Link to="/" className="back-link">← Home</Link></p>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container">
        <p className="section__kicker">Admin</p>
        <h1 className="section__title">{title}</h1>

        <nav className="admin-nav">
          {sections.map((s) =>
            s.disabled ? (
              <span key={s.to} className="admin-nav__tab admin-nav__tab--disabled" title="Coming soon">
                {s.label}
              </span>
            ) : (
              <Link
                key={s.to}
                to={s.to}
                className={loc.pathname.startsWith(s.to) ? 'admin-nav__tab is-active' : 'admin-nav__tab'}
              >
                {s.label}
              </Link>
            )
          )}
        </nav>

        <div className="admin-body">{children}</div>
      </div>
    </section>
  )
}