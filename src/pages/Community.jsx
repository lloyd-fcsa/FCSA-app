import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

export default function Community() {
  const { user, loading: authLoading } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    let alive = true
    supabase
      .from('community_posts')
      .select('id, title, body, author_id, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!alive) return
        if (data) setPosts(data)
        setLoading(false)
      })
    return () => { alive = false }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setSubmitting(true)
    setError('')
    const { error: err } = await supabase
      .from('community_posts')
      .insert({ title: title.trim(), body: body.trim() })
    if (err) {
      setError(err.message)
      setSubmitting(false)
    } else {
      setTitle('')
      setBody('')
      setShowForm(false)
      setSubmitting(false)
    }
  }

  const canPost = user && !authLoading

  return (
    <section className="section">
      <div className="container">
        <div className="news-post__bar">
          <div>
            <p className="section__kicker">Community</p>
            <h1 className="section__title">Ask the Community</h1>
          </div>
          {canPost && !showForm && (
            <button type="button" className="button" onClick={() => setShowForm(true)}>
              New Post
            </button>
          )}
        </div>
        <p className="muted" style={{ marginBottom: 20 }}>
          Discussions, questions and posts from the FCSA community.
        </p>

        {!user && !authLoading && (
          <p className="muted" style={{ marginBottom: 20 }}>
            <Link to="/auth" state={{ from: '/community' }}>Sign in</Link> to post or comment.
          </p>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="auth-form" style={{ marginBottom: 28 }}>
            <div className="auth-field">
              <label htmlFor="post-title">Title</label>
              <input
                id="post-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="post-body">Post</label>
              <textarea
                id="post-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share your question or comment…"
                rows={4}
                required
                style={{ padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontFamily: 'inherit', background: '#fafafa', resize: 'vertical' }}
              />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="button" disabled={submitting}>
                {submitting ? 'Posting…' : 'Submit for Review'}
              </button>
              <button type="button" className="button button--ghost" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="muted">Loading posts…</p>
        ) : posts.length === 0 ? (
          <div className="empty">
            <div className="empty__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h16v10H7l-3 3z"/></svg>
            </div>
            <p>No posts yet.</p>
            <span className="muted">Be the first to ask something.</span>
          </div>
        ) : (
          <div className="news-list">
            {posts.map((post) => (
              <Link key={post.id} to={`/community/${post.id}`} className="news-card" style={{ textDecoration: 'none', color: 'var(--text)' }}>
                <div className="news-card__body">
                  <p className="news-card__title" style={{ margin: 0 }}>{post.title}</p>
                  <p className="news-card__excerpt" style={{ margin: '6px 0 0' }}>{post.body}</p>
                  <p className="news-card__date" style={{ margin: '10px 0 0' }}>
                    {timeAgo(post.created_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
