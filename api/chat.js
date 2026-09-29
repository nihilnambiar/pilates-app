// Proxies chat requests to NVIDIA's NIM API. This has to happen server-side —
// integrate.api.nvidia.com doesn't send CORS headers, so the browser can't
// call it directly (unlike Groq, which the frontend used to hit directly).
// As a bonus, the API key now never reaches the client bundle.
//
// Model: the small, fast meta/llama-3.1-8b-instruct this used to run on was
// deprecated by NVIDIA (Aug 2026) and is gone (410). Of the alternatives,
// only the vision-instruct Llama models are actually enabled on this NVIDIA
// account — everything smaller/faster (Mistral, Gemma, Granite, etc.)
// 404s as "not found for account," meaning it'd need to be subscribed on
// NVIDIA's dashboard first. 11B is the smallest working option right now.
const NVIDIA_MODEL = 'meta/llama-3.2-11b-vision-instruct';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Chat is not configured' });

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Missing messages' });
  }

  try {
    const nvidiaRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        // Lower cap so replies finish sooner — this model runs ~100ms/token
        // on this account's tier, so trimming the ceiling directly cuts
        // worst-case latency. Chat answers are meant to stay focused anyway.
        max_tokens: 250,
        messages,
        stream: true,
      }),
    });

    if (!nvidiaRes.ok || !nvidiaRes.body) {
      const errText = await nvidiaRes.text().catch(() => '');
      console.error('NVIDIA chat error:', nvidiaRes.status, errText);
      return res.status(502).json({ error: 'Chat provider error' });
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    const reader = nvidiaRes.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (err) {
    console.error('chat proxy error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Server error' });
    else res.end();
  }
}
