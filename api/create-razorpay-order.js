export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const key_id     = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return res.status(500).json({ error: 'Razorpay not configured' });

  const { amount, planName } = req.body;
  if (!amount || !planName) return res.status(400).json({ error: 'Missing amount or planName' });

  const credentials = Buffer.from(`${key_id}:${key_secret}`).toString('base64');

  try {
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method:  'POST',
      headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount:   Math.round(amount * 100), // paise
        currency: 'INR',
        receipt:  `vigour_${planName.replace(/\s+/g,'_').toLowerCase()}_${Date.now()}`,
        notes:    { planName, studio: 'Vigour Pilates Studio' },
      }),
    });

    const order = await response.json();
    if (!response.ok) {
      console.error('Razorpay order error:', order);
      return res.status(500).json({ error: order.error?.description || 'Order creation failed' });
    }

    res.status(200).json({ orderId: order.id, amount: order.amount, key: key_id });
  } catch (err) {
    console.error('create-razorpay-order:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
