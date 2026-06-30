const resources = []

export default function Resources() {
  return (
    <section className="section">
      <div className="container">
        <p className="section__kicker">Resources</p>
        <h1 className="section__title">Webinars &amp; Resources</h1>
        <p className="muted">Videos and fact sheets from FCSA.</p>

        {resources.length === 0 ? (
          <div className="empty">
            <div className="empty__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 2h8l4 4v16H6zM14 2v4h4"/></svg>
            </div>
            <p>No resources yet.</p>
            <span className="muted">Vimeo embeds and PDF fact sheets will appear here.</span>
          </div>
        ) : (
          <div className="cards">
            {resources.map((r) => (
              <article key={r.id} className="card">
                <h3>{r.title}</h3>
                <p>{r.summary}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}