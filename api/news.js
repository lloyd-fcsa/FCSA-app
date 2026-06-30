const WP = "https://www.fcsa.org.uk/wp-json/wp/v2/posts";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { per_page = "10", slug } = req.query;

  try {
    const params = new URLSearchParams({
      per_page,
      _embed: "wp:featuredmedia,author,wp:term",
    });
    if (slug) params.set("slug", slug);
    const base = `${WP}?${params.toString()}`;
    const r = await fetch(base, { headers: { "User-Agent": "fcsa-app/1.0" } });
    const text = await r.text();
    let posts;
    try { posts = JSON.parse(text); } catch { posts = []; }
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=3600");
    res.status(200).json(posts);
  } catch {
    res.status(500).json([]);
  }
}