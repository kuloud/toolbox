// Vercel Serverless function: proxies requests to a LibreTranslate instance.
// Environment variables:
// - LIBRETRANSLATE_API_URL (default: https://libretranslate.de)
// - LIBRETRANSLATE_API_KEY (optional)


export default async function handler(req: any, res: any) {
  // Allow CORS from anywhere (you can scope this in production)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const baseUrl = process.env.LIBRETRANSLATE_API_URL || "https://libretranslate.de";
  const apiKey = process.env.LIBRETRANSLATE_API_KEY;

  try {
    // Support a GET /api/translate?action=languages to retrieve languages
    if (req.method === "GET") {
      const url = `${baseUrl}/languages`;
      const r = await fetch(url);
      const json = await r.json();
      return res.status(r.status).json(json);
    }

    if (req.method === "POST") {
      const { q, source = "auto", target, format = "text" } = req.body || {};

      if (!q || !target) {
        return res.status(400).json({ error: "Missing required fields: q and target" });
      }

      const url = `${baseUrl}/translate`;

      const body: any = { q, source, target, format };
      if (apiKey) body.api_key = apiKey; // supported by some LibreTranslate deployments

      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await r.json().catch(() => ({}));

      // Mirror status and body
      return res.status(r.status).json(json);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("/api/translate error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
