import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'
import { useCommunity } from '../lib/community.jsx'

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
  const { posts, myVotes, vote } = useCommunity()

  const contextPost = posts.find(p => p.id === parseInt(id))
  const contextVote = myVotes[parseInt(id)]

  const [fallbackPost, setFallbackPost] = useState(null)
  const [fallbackVote, setFallbackVote] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(!contextPost)
  const [notFound, setNotFound] = useState(false)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [reported, setReported] = useState(false)

  const post = contextPost || fallbackPost
  const myVote = contextVote || fallbackVote

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let alive = true
    supabase.from('community_posts').select('id, title, body, author_id, created_at, status, score, tags').eq('id', id).maybeSingle().then(({ data }) => {
      if (!alive) return
      if (!data || (data.status !== 'approved' && data.author_id !== user?.id)) {
        if (!contextPost) setNotFound(true)
      } else if (!contextPost) {
        setFallbackPost(data)
      }
      setLoading(false)
    })
    return () => { alive = false }
  }, [id, user, contextPost])

  useEffect(() => {
    if (!supabase || !user) return
    supabase.from('community_votes').select('vote_type').eq('post_id', id).eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (data && !contextVote) setFallbackVote(data.vote_type)
    })
  }, [id, user, contextVote])

  useEffect(() => {
    if (!supabase) return
    const channel = supabase
      .channel('post-comments-' + id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_comments', filter: `post_id=eq.${id}` }, (payload) => {
        setComments(prev => [...prev, payload.new])
      })
      .subscribe()

    supabase.from('community_comments').select('id, body, author_id, created_at').eq('post_id', id).order('created_at', { ascending: true }).then(({ data }) => {
      if (data) setComments(data)
    })

    return () => { supabase.removeChannel(channel) }
  }, [id])

  async function handleComment(e) {
    e.preventDefault()
    if (!body.trim()) return
    const optimistic = { id: Date.now(), body: body.trim(), author_id: user?.id, created_at: new Date().toISOString() }
    setComments(prev => [...prev, optimistic])
    setBody('')
    const { error: err } = await supabase.from('community_comments').insert({ post_id: id, body: optimistic.body })
    if (err) { setComments(prev => prev.filter(c => c.id !== optimistic.id)); setError(err.message) }
  }

  async function handleDelete() {
    if (!confirm('Delete this post? This cannot be undone.')) return
    const { error } = await supabase.from('community_posts').delete().eq('id', id)
    if (!error) window.location.href = '/community'
  }

  async function handleFlag() {
    const reason = prompt('Why are you flagging this post? (optional)')
    if (reason === null) return
    setReported(true)
    await supabase.rpc('flag_post', { p_post_id: parseInt(id), p_reason: reason || '' })
  }

  if (loading) {
    return <section className="section"><div className="container"><p className="muted">Loading…</p></div></section>
  }

  if (notFound || !post) {
    return (
      <section className="section"><div className="container narrow">
        <div className="empty">
          <p>Post not found.</p>
          <span className="muted">It may still be pending approval.</span>
          <p><Link to="/community" className="back-link" style={{ marginTop: 14, display: 'inline-block' }}>← Back to Community</Link></p>
        </div>
      </div></section>
    )
  }

  return (
    <section className="section">
      <div className="container">
        <p className="news-post__bar"><Link to="/community" className="back-link">← Community</Link></p>

        <article className="news-post" style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <p className="news-post__meta" style={{ marginBottom: 4 }}>{timeAgo(post.created_at)}</p>
              <h1 className="news-post__title" style={{ marginBottom: 16 }}>{post.title}</h1>
              {post.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
                  {post.tags.map(t => (
                    <span key={t} style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', background: 'var(--accent-soft)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 999 }}>{t}</span>
                  ))}
                </div>
              )}
              <div className="wp-content"><p>{post.body}</p></div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                {user?.id === post.author_id && (
                  <button type="button" onClick={handleDelete} style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', color: '#c0392b', fontSize: '0.82rem', fontWeight: 400, textDecoration: 'underline', fontFamily: 'inherit' }}>delete post</button>
                )}
                {reported ? (
                  <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>reported</span>
                ) : (
                  <button type="button" onClick={handleFlag} style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.82rem', fontWeight: 400, textDecoration: 'underline', fontFamily: 'inherit' }}>report post</button>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0, minWidth: 40 }}>
              <button type="button" onClick={() => vote(parseInt(id), 'up')} disabled={!user} style={{ background: 'none', border: 'none', cursor: user ? 'pointer' : 'not-allowed', padding: 2, color: myVote === 'up' ? 'var(--accent)' : '#ccc', lineHeight: 0 }} aria-label="Upvote">
                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 4 4 16h16z"/></svg>
              </button>
              <span style={{ fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>{post.score ?? 0}</span>
              <button type="button" onClick={() => vote(parseInt(id), 'down')} disabled={!user} style={{ background: 'none', border: 'none', cursor: user ? 'pointer' : 'not-allowed', padding: 2, color: myVote === 'down' ? 'var(--accent)' : '#ccc', lineHeight: 0 }} aria-label="Downvote">
                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 20 4 8h16z"/></svg>
              </button>
            </div>
          </div>
        </article>

        <div style={{ marginTop: 36, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: '0 0 16px' }}>Comments ({comments.length})</h2>
          {comments.length === 0 && <p className="muted" style={{ marginBottom: 18 }}>No comments yet.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            {comments.map(c => (
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
                <textarea id="comment-body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your comment…" rows={3} required style={{ padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontFamily: 'inherit', background: '#fafafa', resize: 'vertical' }} />
              </div>
              {error && <p className="auth-error">{error}</p>}
              <div><button type="submit" className="button" disabled={submitting}>{submitting ? 'Posting…' : 'Post Comment'}</button></div>
            </form>
          ) : (
            <p className="muted"><Link to="/auth" state={{ from: `/community/${id}` }}>Sign in</Link> to leave a comment.</p>
          )}
        </div>
      </div>
    </section>
  )
}
