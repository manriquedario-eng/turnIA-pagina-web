module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const response = await fetch('https://app.turniahealth.com.ar/api/public/commercial-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {}),
    });

    const body = await response.json().catch(() => ({ ok: false, error: 'invalid_backend_response' }));
    return res.status(response.status).json(body);
  } catch (error) {
    console.error('Commercial request proxy failed', error);
    return res.status(502).json({ ok: false, error: 'backend_unavailable' });
  }
};
