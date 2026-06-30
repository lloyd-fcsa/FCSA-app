const WP = "https://www.fcsa.org.uk/wp-json/wp/v2/fcsa-member"
async function go() {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(`${WP}?per_page=100&_embed=wp:featuredmedia,wp:term`, { headers: { "User-Agent": "fcsa-app/1.0" } })
    console.log("attempt", i+1, "WP status:", r.status)
    if (r.ok) { const p = await r.json(); console.log("count:", p.length); return }
    await new Promise(x => setTimeout(x, 2000))
  }
}
go().catch(e => console.error(e.message))
