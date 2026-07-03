import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Forum from './pages/Forum.jsx'
import ForumSchedule from './pages/ForumSchedule.jsx'
import ForumSpeakers from './pages/ForumSpeakers.jsx'
import ForumSponsors from './pages/ForumSponsors.jsx'
import ForumVenue from './pages/ForumVenue.jsx'
import ForumInfo from './pages/ForumInfo.jsx'
import Event from './pages/Event.jsx'
import EventPost from './pages/EventPost.jsx'
import About from './pages/About.jsx'
import Codes from './pages/Codes.jsx'
import CodesHub from './pages/CodesHub.jsx'
import Directory from './pages/Directory.jsx'
import News from './pages/News.jsx'
import NewsPost from './pages/NewsPost.jsx'
import NewsHub from './pages/NewsHub.jsx'
import CeoBlog from './pages/CeoBlog.jsx'
import Resources from './pages/Resources.jsx'
import Community from './pages/Community.jsx'
import CommunityPost from './pages/CommunityPost.jsx'
import Auth from './pages/Auth.jsx'
import AdminHome from './pages/admin/AdminHome.jsx'
import AdminForum from './pages/admin/AdminForum.jsx'
import AdminCommunity from './pages/admin/AdminCommunity.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/schedule" element={<ForumSchedule />} />
        <Route path="/forum/speakers" element={<ForumSpeakers />} />
        <Route path="/forum/sponsors" element={<ForumSponsors />} />
        <Route path="/forum/venue" element={<ForumVenue />} />
        <Route path="/forum/info" element={<ForumInfo />} />
        <Route path="/event" element={<Event />} />
        <Route path="/event/:slug" element={<EventPost />} />
        <Route path="/about" element={<About />} />
        <Route path="/codes" element={<CodesHub />} />
        <Route path="/codes/fcsa-codes" element={<Codes />} />
        <Route path="/codes/directory" element={<Directory />} />
        <Route path="/news" element={<NewsHub />} />
        <Route path="/news/feed" element={<News />} />
        <Route path="/news/ceo-blog" element={<CeoBlog />} />
        <Route path="/news/:slug" element={<NewsPost />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/:id" element={<CommunityPost />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/forum" element={<AdminForum />} />
        <Route path="/admin/community" element={<AdminCommunity />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}