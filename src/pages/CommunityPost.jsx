import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
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

export default function CommunityPost() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
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
      .select('id, title, body, author_id, created_at, status')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return
        if (!data || (data.status !== 'approved' && data.author_id !== user?.id && profile?.role !== 'admin')) {
          setNotFound(true)
        } else {
          setPost(data)
        }
        setLoading(false)
      })
    return () => { alive = false }
  }, [id, user, profile])

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('community_comments')
      .select('id, body, author_id, created_at')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setComments(data)
      })
  }, [id])

  async function handleComment(e) {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    setError('')
    const { error: err } = await supabase
      .from('community_comments')
      .insert({ post_id: id, body: body.trim() })
    if (err) {
      setError(err.message)
      setSubmitting(false)
    } else {
      setBody('')
      setSubmitting(false)
      supabase
        .from('community_comments')
        .select('id, body, author_id, created_at')
        .eq('post_id', id)
        .order('created_at', { ascending: true })
        .then(({ data }) => {
          if (data) setComments(data)
        })
    }
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container"><p className="muted">Loading…</p></div>
      </section>
    )
  }

  if (notFound || !post) {
    return (
      <section className="section">
        <div className="container narrow">
          <div className="empty">
            <p>Post not found.</p>
            <span className="muted">It may still be pending approval.</span>
            <p><Link to="/community" className="back-link" style={{ marginTop: 14, display: 'inline-block' }}>← Back to Community</Link></p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container">
        <p className="news-post__bar">
          <Link to="/community" className="back-link">← Community</Link>
        </p>

        <article className="news-post" style={{ marginTop: 10 }}>
          <p className="news-post__meta">
            {timeAgo(post.created_at)}
          </p>
          <h1 className="news-post__title" style={{ marginBottom: 16 }}>{post.title}</h1>
          <div className="wp-content">
            <p>{post.body}</p>
          </div>
        </article>

        <div style={{ marginTop: 36, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: '0 0 16px' }}>
            Comments ({comments.length})
          </h2>

          {comments.length === 0 && (
            <p className="muted" style={{ marginBottom: 18 }}>No comments yet.</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            {comments.map((c) => (
              <div key={c.id} className="card">
                <p style={{ margin: '0 0 4px', fontWeight: 900, fontSize: '0.85rem' }}>
                  <span className="muted" style={{ fontWeight: 400, fontSize: '0.78rem' }}>{timeAgo(c.created_at)}</span>
                </p>
                <p style={{ margin: 0, fontSize: '0.92rem' }}>{c.body}</p>
              </div>
            ))}
          </div>

          {user ? (
            <form onSubmit={handleComment} className="auth-form">
              <div className="auth-field">
                <label htmlFor="comment-body">Add a comment</label>
                <textarea
                  id="comment-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your comment…"
                  rows={3}
                  required
                  style={{ padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontFamily: 'inherit', background: '#fafafa', resize: 'vertical' }}
                />
              </div>
              {error && <p className="auth-error">{error}</p>}
              <div>
                <button type="submit" className="button" disabled={submitting}>
                  {submitting ? 'Posting…' : 'Post Comment'}
                </button>
              </div>
            </form>
          ) : (
            <p className="muted">
              <Link to="/auth" state={{ from: `/community/${id}` }}>Sign in</Link> to leave a comment.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
