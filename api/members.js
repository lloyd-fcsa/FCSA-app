const WP = "https://www.fcsa.org.uk/wp-json/wp/v2/fcsa-member";

async function scrapeLogo(slug, fm) {
  if (!fm) return null;
  try {
    const r = await fetch(`https://www.fcsa.org.uk/fcsa-member/${slug}/`, {
      headers: { "User-Agent": "fcsa-app/1.0" },
    });
    if (!r.ok) return null;
    const t = await r.text();
    const re = new RegExp(`<img[^>]*wp-image-${fm}[^>]*>`, "i");
    const m = t.match(re);
    if (!m) return null;
    const src = m[0].match(/src="([^"]+)"/);
    return src ? src[1] : null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { per_page = "100" } = req.query;

  try {
    const url = `${WP}?per_page=${encodeURIComponent(per_page)}&_embed=wp:featuredmedia,wp:term`;
    const r = await fetch(url, { headers: { "User-Agent": "fcsa-app/1.0" } });
    const text = await r.text();
    let posts;
    try {
      posts = JSON.parse(text);
    } catch {
      posts = [];
    }

    const enriched = await Promise.all(
      (posts || []).map(async (p) => {
        const m =
          p._embedded &&
          p._embedded["wp:featuredmedia"] &&
          p._embedded["wp:featuredmedia"][0];
        let img = m ? m.source_url : null;
        if (!img && p.featured_media) {
          img = await scrapeLogo(p.slug, p.featured_media);
        }
        return { ...p, _scraped_logo: img };
      })
    );

    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=3600");
    res.status(200).json(enriched);
  } catch {
    res.status(500).json([]);
  }
}