import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import AdminShell from '../../components/AdminShell.jsx'

export default function AdminCommunity() {
  const [pendingPosts, setPendingPosts] = useState([])
  const [approvedPosts, setApprovedPosts] = useState([])
  const [flaggedPosts, setFlaggedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')

  function loadAll() {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    Promise.all([
      supabase
        .from('community_posts')
        .select('id, title, body, author_id, created_at, score, tags, flagged, flagged_reason, status')
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      supabase
        .from('community_posts')
        .select('id, title, body, author_id, created_at, score, tags, flagged, flagged_reason, status')
        .eq('status', 'approved')
        .order('created_at', { ascending: false }),
      supabase
        .from('community_posts')
        .select('id, title, body, author_id, created_at, score, tags, flagged, flagged_reason, status')
        .eq('flagged', true)
        .order('created_at', { ascending: false }),
    ]).then(([pendingRes, approvedRes, flaggedRes]) => {
      if (pendingRes.data) setPendingPosts(pendingRes.data)
      if (approvedRes.data) setApprovedPosts(approvedRes.data)
      if (flaggedRes.data) setFlaggedPosts(flaggedRes.data)
      setLoading(false)
    })
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll()
  }, [])

  async function updateStatus(id, status) {
    await supabase.from('community_posts').update({ status }).eq('id', id)
    loadAll()
  }

  async function ignoreFlag(id) {
    await supabase.from('community_posts').update({ flagged: false, flagged_reason: null }).eq('id', id)
    loadAll()
  }

  async function hidePost(id) {
    await supabase.from('community_posts').update({ flagged: false, flagged_reason: null, status: 'rejected' }).eq('id', id)
    loadAll()
  }

  function currentPosts() {
    if (tab === 'pending') return pendingPosts
    if (tab === 'approved') return approvedPosts
    return flaggedPosts
  }

  const posts = currentPosts()

  return (
    <AdminShell title="Community moderation">
      <div className="day-toggle" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'pending'}
          className={'day-toggle__btn' + (tab === 'pending' ? ' is-active' : '')}
          onClick={() => setTab('pending')}
        >
          Pending ({pendingPosts.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'approved'}
          className={'day-toggle__btn' + (tab === 'approved' ? ' is-active' : '')}
          onClick={() => setTab('approved')}
        >
          Approved ({approvedPosts.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'flagged'}
          className={'day-toggle__btn' + (tab === 'flagged' ? ' is-active' : '')}
          onClick={() => setTab('flagged')}
        >
          Flagged ({flaggedPosts.length})
        </button>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : posts.length === 0 ? (
        <div className="empty">
          <p>No {tab} posts.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {posts.map((post) => (
            <div key={post.id} className="card">
              <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                <p className="card__badge" style={{ margin: 0 }}>{post.status}</p>
                {post.flagged && <p className="card__badge" style={{ margin: 0, background: '#c0392b' }}>flagged</p>}
              </div>
              {post.flagged && post.flagged_reason && (
                <p className="muted" style={{ fontSize: '0.85rem', margin: '-4px 0 8px', fontStyle: 'italic' }}>
                  reason: {post.flagged_reason}
                </p>
              )}
              <h3 style={{ margin: '0 0 6px' }}>{post.title}</h3>
              <p className="muted" style={{ fontSize: '0.85rem', margin: '0 0 4px' }}>
                score: {post.score ?? 0} · {new Date(post.created_at).toLocaleDateString()}
              </p>
              {post.tags && post.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                  {post.tags.map(t => (
                    <span key={t} style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', background: 'var(--accent-soft)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 999 }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <p style={{ fontSize: '0.92rem', margin: '0 0 12px' }}>{post.body}</p>

              {tab === 'pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="button" onClick={() => updateStatus(post.id, 'approved')}>
                    Approve
                  </button>
                  <button type="button" className="button button--ghost" style={{ borderColor: '#c0392b', color: '#c0392b' }} onClick={() => updateStatus(post.id, 'rejected')}>
                    Reject
                  </button>
                </div>
              )}

              {tab === 'flagged' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="button button--ghost" onClick={() => ignoreFlag(post.id)}>
                    Ignore
                  </button>
                  <button type="button" className="button button--ghost" style={{ borderColor: '#c0392b', color: '#c0392b' }} onClick={() => hidePost(post.id)}>
                    Hide Post
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
