const WP = "https://www.fcsa.org.uk/wp-json/wp/v2/event";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { per_page = "20", slug } = req.query;

  try {
    const base = slug
      ? `${WP}?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia,author`
      : `${WP}?per_page=${encodeURIComponent(per_page)}&_embed=wp:featuredmedia,author`;
    const r = await fetch(base, { headers: { "User-Agent": "fcsa-app/1.0" } });
    const posts = await r.json();
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=3600");
    res.status(200).json(posts);
  } catch {
    res.status(500).json([]);
  }
}