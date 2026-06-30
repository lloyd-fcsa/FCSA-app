import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { supabaseReady } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

const tabs = [
  { to: '/', label: 'Home', end: true, icon: 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
  { to: '/forum', label: 'Forum', icon: 'M4 4h16v12H7l-3 3z' },
  { to: '/event', label: 'Event', icon: 'M7 3v2M17 3v2M4 7h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z' },
  { to: '/about', label: 'About', icon: 'M12 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM5 20v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z' },
]

function TopNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { user, profile, loading } = useAuth()

  return (
    <div className="topnav" role="navigation" aria-label="Page navigation">
      <button
        type="button"
        className="topnav__btn"
        onClick={() => {
          if (window.history.length > 1) navigate(-1)
          else navigate('/')
        }}
        aria-label="Go back"
        disabled={isHome}
        style={isHome ? { visibility: 'hidden' } : undefined}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M15 5 8 12l7 7V5z" />
        </svg>
      </button>

      <div className="topnav__right">
        <button type="button" className="topnav__btn" aria-label="Notifications" disabled>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 2a6 6 0 0 0-6 6v3l-1.5 3a1 1 0 0 0 .9 1.5h13.2a1 1 0 0 0 .9-1.5L18 11V8a6 6 0 0 0-6-6zm0 22a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3z" />
          </svg>
        </button>

        {loading ? (
          <button type="button" className="topnav__btn" aria-label="Profile" disabled>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1H5z" />
            </svg>
          </button>
        ) : user ? (
          <button
            type="button"
            className="topnav__btn topnav__btn--avatar"
            aria-label="Profile"
            onClick={() => navigate('/auth')}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" />
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1H5z" />
              </svg>
            )}
          </button>
        ) : (
          <button
            type="button"
            className="topnav__btn"
            aria-label="Sign in"
            onClick={() => navigate('/auth', { state: { from: location.pathname } })}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1H5z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default function Layout({ children }) {
  return (
    <div className="app">
      <header className="app__header">
        <Link to="/" className="brand" aria-label="FCSA home">
          <img src="/logo-white.png" alt="FCSA" className="brand__logo" />
        </Link>
      </header>

      <TopNav />

      <main className="app__main">{children}</main>

      <nav className="tabbar">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) => isActive ? 'tabbar__tab is-active' : 'tabbar__tab'}
          >
            <svg viewBox="0 0 24 24" className="tabbar__icon" aria-hidden="true">
              <path fill="currentColor" d={t.icon} />
            </svg>
            <span className="tabbar__label">{t.label}</span>
          </NavLink>
        ))}
      </nav>

      {!supabaseReady && (
        <p className="demo-flag">demo mode — connect Supabase to enable live data</p>
      )}
    </div>
  )
}