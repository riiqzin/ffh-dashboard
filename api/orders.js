const STORE_ID = process.env.NUVEMSHOP_STORE_ID;
const TOKEN = process.env.NUVEMSHOP_TOKEN;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!STORE_ID || !TOKEN) {
    return res.status(500).json({
      error: 'Configuração ausente: defina NUVEMSHOP_STORE_ID e NUVEMSHOP_TOKEN nas Environment Variables do projeto na Vercel.'
    });
  }

  try {
    const { per_page = 50, page = 1 } = req.query;
    const since = '2025-06-21T00:00:00-03:00';
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

    // Se ?debug=1, retorna só os campos relevantes do primeiro pedido
    if (req.query.debug === '1' && data.length > 0) {
      const o = data[0];
      const p = o.products?.[0];
      return res.status(200).json({
        order_number: o.number,
        // Campos de nome do produto
        product_name_raw: p?.name,
        product_sku: p?.sku,
        product_variant_values: p?.variant_values,
        product_categories: p?.categories,
        product_tags: p?.tags,
        // Campos de prazo de entrega
        shipping_min_days: o.shipping_min_days,
        shipping_max_days: o.shipping_max_days,
        shipping_option: o.shipping_option,
        shipping_carrier_name: o.shipping_carrier_name,
        shipping_option_reference: o.shipping_option_reference,
        shipping_cost_owner: o.shipping_cost_owner,
        // Todas as chaves do pedido que contêm "ship" ou "day"
        all_ship_keys: Object.keys(o).filter(k => k.includes('ship') || k.includes('day') || k.includes('deliv')),
        all_ship_values: Object.fromEntries(
          Object.keys(o)
            .filter(k => k.includes('ship') || k.includes('day') || k.includes('deliv'))
            .map(k => [k, o[k]])
        ),
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
