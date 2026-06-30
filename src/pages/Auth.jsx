import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

export default function Auth() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setError('Check your email to confirm your account.')
      }
    } catch (e) {
      setError(e.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (user) {
    return (
      <section className="section">
        <div className="container narrow">
          <p className="section__kicker">Account</p>
          <h1 className="section__title">Signed in</h1>
          <p>You're signed in as <strong>{user.email}</strong>.</p>
          {profile?.display_name && <p className="muted">Display name: {profile.display_name}</p>}
          {profile?.role && <p className="muted">Role: {profile.role}</p>}
          {profile?.role === 'admin' && (
            <p><Link to="/admin" className="button">Go to admin</Link></p>
          )}
          <p><button type="button" className="button button--ghost" onClick={signOut}>Sign out</button></p>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container narrow">
        <p className="section__kicker">Account</p>
        <h1 className="section__title">{mode === 'signin' ? 'Sign in' : 'Sign up'}</h1>

        <form className="auth-form" onSubmit={submit}>
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="button button-block" disabled={busy}>
            {busy ? '…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'signin' ? (
            <>Don't have an account? <button type="button" className="link-btn" onClick={() => setMode('signup')}>Sign up</button></>
          ) : (
            <>Already have an account? <button type="button" className="link-btn" onClick={() => setMode('signin')}>Sign in</button></>
          )}
        </p>

        <button type="button" className="link-btn muted" onClick={() => navigate(from)}>← Back</button>
      </div>
    </section>
  )
}