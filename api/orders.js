const STORE_ID = process.env.NUVEMSHOP_STORE_ID || '5191961';
const TOKEN = process.env.NUVEMSHOP_TOKEN || '05fce3e924caa8a1447f6387fda922c31e8f00a0';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const { per_page = 50, page = 1 } = req.query;

    const now = new Date();
    const brasiliaOffsetMs = -3 * 60 * 60 * 1000;
    const brasiliaNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + brasiliaOffsetMs);

    const year = brasiliaNow.getFullYear();
    const month = String(brasiliaNow.getMonth() + 1).padStart(2, '0');
    const day = String(brasiliaNow.getDate()).padStart(2, '0');

    const since = `${year}-${month}-${day}T00:00:00-03:00`;

    const url = `https://api.nuvemshop.com.br/v1/${STORE_ID}/orders?per_page=${per_page}&page=${page}&created_at_min=${encodeURIComponent(since)}`;
    const response = await fetch(url, {
      headers: {
        'Authentication': `bearer ${TOKEN}`,
        'User-Agent': 'DashboardFFH (fandomfashionhouse2@gmail.com)',
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
