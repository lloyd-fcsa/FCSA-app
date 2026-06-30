export default function Community() {
  return (
    <section className="section">
      <div className="container">
        <p className="section__kicker">Community</p>
        <h1 className="section__title">Ask the Community</h1>
        <p className="muted">Discussions, questions and posts from the FCSA community.</p>

        <div className="empty">
          <div className="empty__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h16v10H7l-3 3z"/></svg>
          </div>
          <p>No posts yet.</p>
          <span className="muted">Threads and comments will appear here once the community is live.</span>
        </div>
      </div>
    </section>
  )
}