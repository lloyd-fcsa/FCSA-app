const id = "695ce96664f08dd0774bf000"

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const r = await fetch(`https://api.lineupr.com/v2/events/${id}/data`, {
      headers: {
        "Accept": "application/json",
        "Origin": "https://fcsa.lineupr.com",
        "Referer": "https://fcsa.lineupr.com/fcsa-forum-2026",
      },
    });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = {}; }
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=3600");
    res.status(200).json(data);
  } catch {
    res.status(500).json({});
  }
}