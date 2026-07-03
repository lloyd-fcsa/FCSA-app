import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase.js'
import { useAuth } from './auth.jsx'

const CommunityContext = createContext({
  posts: [],
  myVotes: {},
  loading: true,
  vote: () => {},
  refresh: () => {},
  searchTag: '',
  setSearchTag: () => {},
})

export function CommunityProvider({ children }) {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [myVotes, setMyVotes] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTag, setSearchTag] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  function fetchPosts(tag) {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    let q = supabase.from('community_posts').select('id, title, body, author_id, created_at, score, tags').eq('status', 'approved').order('score', { ascending: false }).order('created_at', { ascending: false })
    if (tag) q = q.contains('tags', [tag])
    q.then(({ data }) => {
      if (data) setPosts(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts(searchTag)

    if (!supabase) return
    const channel = supabase
      .channel('community-context')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts', filter: 'status=eq.approved' }, (payload) => {
        setPosts(prev => prev.some(p => p.id === payload.new.id) ? prev : [payload.new, ...prev])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'community_posts' }, (payload) => {
        const p = payload.new
        setPosts(prev =>
          prev.some(x => x.id === p.id)
            ? prev.map(x => x.id === p.id ? { ...x, ...p } : x)
            : p.status === 'approved' ? [p, ...prev] : prev
        )
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'community_posts' }, (payload) => {
        setPosts(prev => prev.filter(p => p.id !== payload.old.id))
      })
      .subscribe()

    function refetch() {
      if (!supabase) return
      let q = supabase.from('community_posts').select('id, title, body, author_id, created_at, score, tags').eq('status', 'approved').order('score', { ascending: false }).order('created_at', { ascending: false })
      if (searchTag) q = q.contains('tags', [searchTag])
      q.then(({ data }) => { if (data) setPosts(data) })
    }
    const handleFocus = () => refetch()
    document.addEventListener('visibilitychange', handleFocus)
    window.addEventListener('focus', handleFocus)

    return () => { supabase.removeChannel(channel); document.removeEventListener('visibilitychange', handleFocus); window.removeEventListener('focus', handleFocus) }
  }, [searchTag, refreshKey])

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  useEffect(() => {
    if (!supabase || !user || posts.length === 0) return
    const ids = posts.map(p => p.id)
    supabase
      .from('community_votes')
      .select('post_id, vote_type')
      .in('post_id', ids)
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (!data) return
        const map = {}
        data.forEach(v => { map[v.post_id] = v.vote_type })
        setMyVotes(map)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, posts.length])

  const vote = useCallback(async (postId, voteType) => {
    if (!user) return
    const existing = myVotes[postId]
    const { error } = await supabase.rpc('vote_post', { p_post_id: postId, p_vote_type: voteType })
    if (error) return

    let delta
    if (!existing) delta = voteType === 'up' ? 1 : -1
    else if (existing === voteType) delta = voteType === 'up' ? -1 : 1
    else delta = voteType === 'up' ? 2 : -2

    setPosts(prev => prev.map(p => p.id === postId ? { ...p, score: (p.score || 0) + delta } : p))
    setMyVotes(prev => {
      if (!existing || existing !== voteType) return { ...prev, [postId]: voteType }
      const next = { ...prev }
      delete next[postId]
      return next
    })
  }, [user, myVotes])

  return (
    <CommunityContext.Provider value={{ posts, myVotes, loading, vote, refresh, searchTag, setSearchTag }}>
      {children}
    </CommunityContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCommunity() {
  return useContext(CommunityContext)
}
