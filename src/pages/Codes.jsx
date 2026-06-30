import { useState } from 'react'

const codes = [
  {
    id: 'mandatory',
    title: 'Mandatory Questions',
    validFrom: '1 July 2026',
    validUntil: '30 June 2027',
    description: 'The core code all FCSA members are audited against. Covers compliance, transparency and conduct.',
    pdf: '/code-2026-27-mandatory.pdf',
  },
  {
    id: 'limited-company-advisor',
    title: 'Limited Company Advisor',
    validFrom: '1 July 2026',
    validUntil: '30 June 2027',
    description: 'Code of compliance for members providing limited company advisor services.',
    pdf: '/code-2026-27-limited-company-advisor.pdf',
  },
  {
    id: 'fixed-term-employment',
    title: 'Fixed Term Employment',
    validFrom: '1 July 2026',
    validUntil: '30 June 2027',
    description: 'Code of compliance for members operating fixed term employment models.',
    pdf: '/code-2026-27-fixed-term-employment.pdf',
  },
  {
    id: 'umbrella',
    title: 'Umbrella',
    validFrom: '1 July 2026',
    validUntil: '30 June 2027',
    description: 'Code of compliance for members providing umbrella company services.',
    pdf: '/code-2026-27-umbrella.pdf',
  },
  {
    id: 'umbrella-worker',
    title: 'Umbrella Worker',
    validFrom: '1 July 2026',
    validUntil: '30 June 2027',
    description: 'Code of compliance covering umbrella worker arrangements.',
    pdf: '/code-2026-27-umbrella-worker.pdf',
  },
  {
    id: 'single-employment',
    title: 'Single Employment',
    validFrom: '1 July 2026',
    validUntil: '30 June 2027',
    description: 'Code of compliance for members operating single employment models.',
    pdf: '/code-2026-27-single-employment.pdf',
  },
  {
    id: 'self-employed-cis',
    title: 'Self-Employed CIS',
    validFrom: '1 July 2026',
    validUntil: '30 June 2027',
    description: 'Code of compliance for members working with self-employed CIS contractors.',
    pdf: '/code-2026-27-self-employed-cis.pdf',
  },
  {
    id: 'peo-worker',
    title: 'PEO Worker',
    validFrom: '1 July 2026',
    validUntil: '30 June 2027',
    description: 'Code of compliance for members providing PEO worker services.',
    pdf: '/code-peo-worker.pdf',
  },
]

function PDFViewer({ url }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="pdf">
      <div className="pdf__actions">
        <button type="button" className="button" onClick={() => setOpen((v) => !v)}>
          {open ? 'Hide preview' : 'View'}
        </button>
        <a className="button button--ghost" href={url} target="_blank" rel="noreferrer">Download</a>
      </div>
      {open && (
        <object className="pdf__frame" data={url} type="application/pdf" aria-label="PDF preview">
          <p className="muted">Your browser can’t display this PDF inline. <a href={url} target="_blank" rel="noreferrer">Open it here.</a></p>
        </object>
      )}
    </div>
  )
}

export default function Codes() {
  return (
    <section className="section">
      <div className="container">
        <p className="section__kicker">Codes</p>
        <h1 className="section__title">Directory &amp; Codes</h1>

        <div className="intro">
          <p>
            FCSA codes set the standards our members are held to — covering compliance, transparency and conduct
            across the supply chain. Members are independently audited against these codes to ensure the highest
            levels of reliability for those they serve.
          </p>
          <p className="muted">
            Each code lists the date it is valid from and, where applicable, the date it is valid until. Earlier
            versions are retained for reference.
          </p>
        </div>

        {codes.length === 0 ? (
          <div className="empty">
            <div className="empty__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 2h8l4 4v16H6zM14 2v4h4"/></svg>
            </div>
            <p>No codes published yet.</p>
            <span className="muted">Codes of practice will appear here.</span>
          </div>
        ) : (
          <div className="cards">
            {codes.map((c) => (
              <article key={c.id} className="card">
                <h3 dangerouslySetInnerHTML={{ __html: c.title }} />
                <p className="card__meta">
                  <span>Valid from: <strong>{c.validFrom}</strong></span>
                  <span>Valid until: <strong>{c.validUntil}</strong></span>
                </p>
                <p dangerouslySetInnerHTML={{ __html: c.description }} />
                {c.pdf ? (
                  <PDFViewer url={c.pdf} />
                ) : (
                  <span className="muted">PDF coming soon.</span>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}