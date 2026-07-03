import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import AdminShell from '../../components/AdminShell.jsx'

export default function AdminCommunity() {
  const [pendingPosts, setPendingPosts] = useState([])
  const [approvedPosts, setApprovedPosts] = useState([])
  const [flaggedPosts, setFlaggedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')

  useEffect(() => {
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    let alive = true
    Promise.all([
      supabase.from('community_posts').select('id, title, body, author_id, created_at, score, tags, flagged, flagged_reason, status').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('community_posts').select('id, title, body, author_id, created_at, score, tags, flagged, flagged_reason, status').eq('status', 'approved').order('created_at', { ascending: false }),
      supabase.from('community_posts').select('id, title, body, author_id, created_at, score, tags, flagged, flagged_reason, status').eq('flagged', true).order('created_at', { ascending: false }),
    ]).then(([pendingRes, approvedRes, flaggedRes]) => {
      if (!alive) return
      if (pendingRes.data) setPendingPosts(pendingRes.data)
      if (approvedRes.data) setApprovedPosts(approvedRes.data)
      if (flaggedRes.data) setFlaggedPosts(flaggedRes.data)
      setLoading(false)
    })
    return () => { alive = false }
  }, [])

  async function approve(id) {
    await supabase.from('community_posts').update({ status: 'approved' }).eq('id', id)
    const post = pendingPosts.find(p => p.id === id)
    if (post) {
      setPendingPosts(prev => prev.filter(p => p.id !== id))
      setApprovedPosts(prev => [...prev, { ...post, status: 'approved' }])
    }
  }

  async function reject(id) {
    await supabase.from('community_posts').update({ status: 'rejected' }).eq('id', id)
    setPendingPosts(prev => prev.filter(p => p.id !== id))
  }

  async function ignoreFlag(id) {
    await supabase.from('community_posts').update({ flagged: false, flagged_reason: null }).eq('id', id)
    setFlaggedPosts(prev => prev.filter(p => p.id !== id))
    setPendingPosts(prev => prev.map(p => p.id === id ? { ...p, flagged: false, flagged_reason: null } : p))
    setApprovedPosts(prev => prev.map(p => p.id === id ? { ...p, flagged: false, flagged_reason: null } : p))
  }

  async function hidePost(id) {
    await supabase.from('community_posts').update({ flagged: false, flagged_reason: null, status: 'rejected' }).eq('id', id)
    setFlaggedPosts(prev => prev.filter(p => p.id !== id))
    setPendingPosts(prev => prev.filter(p => p.id !== id))
    setApprovedPosts(prev => prev.filter(p => p.id !== id))
  }

  function posts() {
    if (tab === 'pending') return pendingPosts
    if (tab === 'approved') return approvedPosts
    return flaggedPosts
  }

  const visible = posts()

  return (
    <AdminShell title="Community moderation">
      <div className="day-toggle" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'pending'} className={'day-toggle__btn' + (tab === 'pending' ? ' is-active' : '')} onClick={() => setTab('pending')}>Pending ({pendingPosts.length})</button>
        <button type="button" role="tab" aria-selected={tab === 'approved'} className={'day-toggle__btn' + (tab === 'approved' ? ' is-active' : '')} onClick={() => setTab('approved')}>Approved ({approvedPosts.length})</button>
        <button type="button" role="tab" aria-selected={tab === 'flagged'} className={'day-toggle__btn' + (tab === 'flagged' ? ' is-active' : '')} onClick={() => setTab('flagged')}>Flagged ({flaggedPosts.length})</button>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="empty"><p>No {tab} posts.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {visible.map(post => (
            <div key={post.id} className="card">
              <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                <p className="card__badge" style={{ margin: 0 }}>{post.status}</p>
                {post.flagged && <p className="card__badge" style={{ margin: 0, background: '#c0392b' }}>flagged</p>}
              </div>
              {post.flagged && post.flagged_reason && (
                <p className="muted" style={{ fontSize: '0.85rem', margin: '-4px 0 8px', fontStyle: 'italic' }}>reason: {post.flagged_reason}</p>
              )}
              <h3 style={{ margin: '0 0 6px' }}>{post.title}</h3>
              <p className="muted" style={{ fontSize: '0.85rem', margin: '0 0 4px' }}>score: {post.score ?? 0} · {new Date(post.created_at).toLocaleDateString()}</p>
              {post.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                  {post.tags.map(t => (
                    <span key={t} style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', background: 'var(--accent-soft)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 999 }}>{t}</span>
                  ))}
                </div>
              )}
              <p style={{ fontSize: '0.92rem', margin: '0 0 12px' }}>{post.body}</p>

              {tab === 'pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="button" onClick={() => approve(post.id)}>Approve</button>
                  <button type="button" className="button button--ghost" style={{ borderColor: '#c0392b', color: '#c0392b' }} onClick={() => reject(post.id)}>Reject</button>
                </div>
              )}

              {tab === 'flagged' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="button button--ghost" onClick={() => ignoreFlag(post.id)}>Ignore</button>
                  <button type="button" className="button button--ghost" style={{ borderColor: '#c0392b', color: '#c0392b' }} onClick={() => hidePost(post.id)}>Hide Post</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
