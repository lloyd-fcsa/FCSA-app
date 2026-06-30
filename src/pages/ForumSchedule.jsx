import { useEffect, useState } from 'react'
import { loadForum, fmtTime, fmtDay } from '../lib/forum.js'

export default function ForumSchedule() {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let alive = true
    loadForum()
      .then((d) => { if (alive) { setData(d); setStatus('ok') } })
      .catch(() => { if (alive) setStatus('error') })
    return () => { alive = false }
  }, [])

  const items = (data?.items || []).slice().sort((a, b) => (a.start || '').localeCompare(b.start || ''))

  // group by day
  const days = {}
  for (const it of items) {
    const day = it.start ? it.start.slice(0, 10) : '?'
    if (!days[day]) days[day] = []
    days[day].push(it)
  }
  const dayKeys = Object.keys(days).sort()

  return (
    <section className="section">
      <div className="container">
        <p className="section__kicker">Forum 2026</p>
        <h1 className="section__title">Schedule</h1>
        <p className="muted">The full agenda across both forum days.</p>

        {status === 'loading' && <p className="muted">Loading…</p>}
        {status === 'error' && (
          <div className="empty"><p>Couldn’t load the schedule.</p></div>
        )}

        {status === 'ok' && items.length === 0 && (
          <div className="empty"><p>No sessions yet.</p></div>
        )}

        {status === 'ok' && items.length > 0 && (
          <>
            {dayKeys.map((dk) => (
              <div key={dk} className="schedule-day">
                <h2 className="schedule-day__head">{fmtDay(dk)}</h2>
                <ol className="agenda">
                  {days[dk].map((it) => {
                    const speakers = (it.contributors || []).map((c) => c.name).join(', ')
                    const isBreak = /break|lunch|registration|drinks/i.test(it.name || '')
                    return (
                      <li key={it._id} className={isBreak ? 'agenda__row agenda__row--soft' : 'agenda__row'}>
                        <span className="agenda__time">
                          {fmtTime(it.start)}
                          {it.end && <span className="agenda__time-end">—{fmtTime(it.end)}</span>}
                        </span>
                        <div className="agenda__body">
                          <h3 className="agenda__title">{it.name}</h3>
                          {speakers && <p className="agenda__meta">{speakers}</p>}
                          {it.venue?.name && <p className="agenda__meta">{it.venue.name}</p>}
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  )
}