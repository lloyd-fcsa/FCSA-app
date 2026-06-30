export async function loadForum() {
  const r = await fetch('/api/forum')
  if (!r.ok) throw new Error('forum fetch failed')
  return r.json()
}

export function img(sizes, which = 'preview') {
  if (!sizes || !sizes.sizes) return null
  return sizes.sizes[which] || sizes.sizes.preview || sizes.sizes.original || null
}

export function fmtTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London',
  })
}

export function fmtDay(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/London',
  })
}

export function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}