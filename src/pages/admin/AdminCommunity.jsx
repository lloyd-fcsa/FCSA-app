import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import AdminShell from '../../components/AdminShell.jsx'

export default function AdminCommunity() {
  const [pendingPosts, setPendingPosts] = useState([])
  const [approvedPosts, setApprovedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')

  useEffect(() => {
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    let alive = true
    setLoading(true)
    Promise.all([
      supabase
        .from('community_posts')
        .select('id, title, body, author_id, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      supabase
        .from('community_posts')
        .select('id, title, body, author_id, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false }),
    ]).then(([pendingRes, approvedRes]) => {
      if (!alive) return
      if (pendingRes.data) setPendingPosts(pendingRes.data)
      if (approvedRes.data) setApprovedPosts(approvedRes.data)
      setLoading(false)
    })
    return () => { alive = false }
  }, [])

  async function updateStatus(id, status) {
    await supabase.from('community_posts').update({ status }).eq('id', id)
    const [pendingRes, approvedRes] = await Promise.all([
      supabase
        .from('community_posts')
        .select('id, title, body, author_id, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      supabase
        .from('community_posts')
        .select('id, title, body, author_id, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false }),
    ])
    if (pendingRes.data) setPendingPosts(pendingRes.data)
    if (approvedRes.data) setApprovedPosts(approvedRes.data)
  }

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
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : tab === 'pending' && pendingPosts.length === 0 ? (
        <div className="empty">
          <p>No pending posts.</p>
          <span className="muted">All caught up.</span>
        </div>
      ) : tab === 'approved' && approvedPosts.length === 0 ? (
        <div className="empty">
          <p>No approved posts yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(tab === 'pending' ? pendingPosts : approvedPosts).map((post) => (
            <div key={post.id} className="card">
              <p className="card__badge" style={{ marginBottom: 8 }}>{post.status}</p>
              <h3 style={{ margin: '0 0 6px' }}>{post.title}</h3>
              <p className="muted" style={{ fontSize: '0.85rem', margin: '0 0 4px' }}>
                {new Date(post.created_at).toLocaleDateString()}
              </p>
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
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
