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

  const loadPosts = useCallback((tag) => {
    if (!supabase) { setLoading(false); return }
    let query = supabase
      .from('community_posts')
      .select('id, title, body, author_id, created_at, score, tags')
      .eq('status', 'approved')
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })
    if (tag) query = query.contains('tags', [tag])
    query.then(({ data }) => {
      if (data) setPosts(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPosts(searchTag)
  }, [searchTag, loadPosts])

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

  const refresh = useCallback(() => {
    loadPosts(searchTag)
  }, [loadPosts, searchTag])

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
