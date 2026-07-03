import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

export default function Community() {
  const { user, loading: authLoading } = useAuth()
  const { posts, myVotes, loading, vote, refresh, searchTag, setSearchTag } = useCommunity()
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { refresh() }, [refresh])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    setSearchTag(searchTag.trim())
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setSubmitting(true)
    setError('')
    const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
    const { error: err } = await supabase
      .from('community_posts')
      .insert({ title: title.trim(), body: body.trim(), tags })
    if (err) {
      setError(err.message)
      setSubmitting(false)
    } else {
      setTitle('')
      setBody('')
      setTagsInput('')
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
            <Link to="/auth" state={{ from: '/community' }}>Sign in</Link> to post or vote.
          </p>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="auth-form" style={{ marginBottom: 28 }}>
            <div className="auth-field">
              <label htmlFor="post-title">Title</label>
              <input id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's on your mind?" required />
            </div>
            <div className="auth-field">
              <label htmlFor="post-body">Post</label>
              <textarea id="post-body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share your question or comment…" rows={4} required style={{ padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontFamily: 'inherit', background: '#fafafa', resize: 'vertical' }} />
            </div>
            <div className="auth-field">
              <label htmlFor="post-tags">Tags (comma-separated)</label>
              <input id="post-tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="e.g. tax, compliance, apprenticeships" />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="button" disabled={submitting}>{submitting ? 'Posting…' : 'Submit for Review'}</button>
              <button type="button" className="button button--ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        <form onSubmit={handleSearch} style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
          <input value={searchTag} onChange={(e) => setSearchTag(e.target.value)} placeholder="Filter by tag…" style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontFamily: 'inherit', background: '#fafafa' }} />
          <button type="submit" className="button">Search</button>
          {searchTag && <button type="button" className="button button--ghost" onClick={() => setSearchTag('')}>Clear</button>}
        </form>

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {posts.map((post) => {
              const myVote = myVotes[post.id]
              return (
                <div key={post.id} className="card" style={{ padding: 14 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0, minWidth: 40 }}>
                      <button type="button" onClick={() => vote(post.id, 'up')} disabled={!user} style={{ background: 'none', border: 'none', cursor: user ? 'pointer' : 'not-allowed', padding: 2, color: myVote === 'up' ? 'var(--accent)' : '#ccc', lineHeight: 0 }} aria-label="Upvote">
                        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 4 4 16h16z"/></svg>
                      </button>
                      <span style={{ fontWeight: 900, fontSize: '0.9rem', lineHeight: 1.2 }}>{post.score ?? 0}</span>
                      <button type="button" onClick={() => vote(post.id, 'down')} disabled={!user} style={{ background: 'none', border: 'none', cursor: user ? 'pointer' : 'not-allowed', padding: 2, color: myVote === 'down' ? 'var(--accent)' : '#ccc', lineHeight: 0 }} aria-label="Downvote">
                        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 20 4 8h16z"/></svg>
                      </button>
                    </div>
                    <Link to={`/community/${post.id}`} style={{ flex: 1, textDecoration: 'none', color: 'var(--text)' }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{post.title}</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>{post.body}</p>
                      {post.tags?.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                          {post.tags.map(t => (
                            <span key={t} style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', background: 'var(--accent-soft)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 999 }}>{t}</span>
                          ))}
                        </div>
                      )}
                      <p className="news-card__date" style={{ margin: '8px 0 0' }}>{timeAgo(post.created_at)}</p>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
