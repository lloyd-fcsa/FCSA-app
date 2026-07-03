import { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
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
  const { user } = useAuth()
  const loc = useLocation()
  const initialState = loc.state?.post
  const initialVote = loc.state?.myVote
  const [post, setPost] = useState(initialState || null)
  const [comments, setComments] = useState([])
  const [myVote, setMyVote] = useState(initialVote || null)
  const [loading, setLoading] = useState(!initialState)
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
      .select('id, title, body, author_id, created_at, status, score, tags')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return
        if (!data || (data.status !== 'approved' && data.author_id !== user?.id)) {
          setNotFound(true)
        } else {
          setPost(data)
        }
        setLoading(false)
      })
    return () => { alive = false }
  }, [id, user])

  useEffect(() => {
    if (!supabase || !user) return
    supabase
      .from('community_votes')
      .select('vote_type')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setMyVote(data.vote_type)
      })
  }, [id, user])

  useEffect(() => {
    if (!supabase) return
    const channel = supabase
      .channel('post-live-' + id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_comments', filter: `post_id=eq.${id}` }, (payload) => {
        setComments(prev => [...prev, payload.new])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'community_posts', filter: `id=eq.${id}` }, (payload) => {
        setPost(prev => prev ? { ...prev, ...payload.new } : prev)
      })
      .subscribe()

    supabase
      .from('community_comments')
      .select('id, body, author_id, created_at')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setComments(data)
      })

    return () => { supabase.removeChannel(channel) }
  }, [id])

  async function handleDelete() {
    if (!confirm('Delete this post? This cannot be undone.')) return
    const { error } = await supabase.from('community_posts').delete().eq('id', id)
    if (!error) window.location.href = '/community'
  }

  async function handleFlag() {
    const reason = prompt('Why are you flagging this post? (optional)')
    if (reason === null) return
    await supabase.rpc('flag_post', { p_post_id: parseInt(id), p_reason: reason || '' })
  }

  async function handleVote(voteType) {
    if (!user) return
    const { error: err } = await supabase.rpc('vote_post', {
      p_post_id: parseInt(id),
      p_vote_type: voteType,
    })
    if (err) return
    const existing = myVote
    let delta
    if (!existing) delta = voteType === 'up' ? 1 : -1
    else if (existing === voteType) delta = voteType === 'up' ? -1 : 1
    else delta = voteType === 'up' ? 2 : -2
    setPost(prev => prev ? { ...prev, score: (prev.score || 0) + delta } : prev)
    if (!existing || existing !== voteType) {
      setMyVote(voteType)
    } else {
      setMyVote(null)
    }
  }

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
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0, minWidth: 40 }}>
              <button
                type="button"
                onClick={() => handleVote('up')}
                disabled={!user}
                style={{ background: 'none', border: 'none', cursor: user ? 'pointer' : 'not-allowed', padding: 2, color: myVote === 'up' ? 'var(--accent)' : '#ccc', lineHeight: 0 }}
                aria-label="Upvote"
              >
                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 4 4 16h16z"/></svg>
              </button>
              <span style={{ fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>{post.score ?? 0}</span>
              <button
                type="button"
                onClick={() => handleVote('down')}
                disabled={!user}
                style={{ background: 'none', border: 'none', cursor: user ? 'pointer' : 'not-allowed', padding: 2, color: myVote === 'down' ? 'var(--accent)' : '#ccc', lineHeight: 0 }}
                aria-label="Downvote"
              >
                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 20 4 8h16z"/></svg>
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <p className="news-post__meta" style={{ marginBottom: 4 }}>{timeAgo(post.created_at)}</p>
              <h1 className="news-post__title" style={{ marginBottom: 16 }}>{post.title}</h1>
              {post.tags && post.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
                  {post.tags.map(t => (
                    <span key={t} style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', background: 'var(--accent-soft)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 999 }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="wp-content">
                <p>{post.body}</p>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                {user?.id === post.author_id && (
                  <button type="button" onClick={handleDelete} style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', color: '#c0392b', fontSize: '0.82rem', fontWeight: 400, textDecoration: 'underline', fontFamily: 'inherit' }}>
                    delete post
                  </button>
                )}
                <button type="button" onClick={handleFlag} style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.82rem', fontWeight: 400, textDecoration: 'underline', fontFamily: 'inherit' }}>
                  report post
                </button>
              </div>
            </div>
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
