import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const CLASS_INFO = {
  reformer: { name: 'Reformer',                 emoji: '⚡', color: '#1E80C2' },
  barrel:   { name: 'Barrel Ladder',            emoji: '🌀', color: '#9DC230' },
  restore:  { name: 'Core & Restore',           emoji: '🌿', color: '#88c8a8' },
  chair:    { name: 'Chair Pilates',            emoji: '🔥', color: '#e87a4a' },
  cadillac: { name: 'Cadillac Machine Pilates', emoji: '✨', color: '#c084fc' },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, topClass, analysis, radarData } = req.body;
  if (!email || !name || !topClass) return res.status(400).json({ error: 'Missing fields' });

  const cls = CLASS_INFO[topClass] || CLASS_INFO.reformer;
  const firstName = name.split(' ')[0];

  const analysisText = analysis
    ? analysis.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/<[^>]+>/g, '').trim()
    : '';

  const analysisHtml = analysis
    ? analysis.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#1a1a1a;">$1</strong>').replace(/\n/g, '<br>')
    : '';

  const scoresHtml = (radarData || []).map(r => `
    <tr>
      <td style="padding:8px 0;font-family:Arial,sans-serif;font-size:14px;color:#555;width:40%;">${r.subject}</td>
      <td style="padding:8px 0;">
        <div style="background:#ece8e0;border-radius:4px;overflow:hidden;height:6px;">
          <div style="width:${r.value}%;height:6px;background:${cls.color};border-radius:4px;"></div>
        </div>
      </td>
      <td style="padding:8px 0 8px 12px;font-family:Arial,sans-serif;font-size:13px;color:#888;width:32px;">${r.value}%</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f6f1;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 24px 40px;">

  <!-- Logo -->
  <div style="margin-bottom:40px;">
    <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a84c;font-weight:600;">Vigour Pilates Studio</p>
  </div>

  <!-- Greeting -->
  <p style="font-size:22px;color:#1a1a1a;margin:0 0 24px;line-height:1.4;font-weight:normal;">
    Hi ${firstName},
  </p>

  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 20px;">
    Here's what your quiz results say about you.
  </p>

  <!-- Class recommendation -->
  <div style="margin:28px 0;padding:24px;background:#fff;border-left:3px solid ${cls.color};border-radius:0 8px 8px 0;">
    <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${cls.color};">Your best match</p>
    <p style="margin:0 0 4px;font-size:24px;">${cls.emoji} <span style="font-size:20px;color:#1a1a1a;font-weight:bold;">${cls.name}</span></p>
  </div>

  ${analysisHtml ? `
  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 20px;">
    ${analysisHtml}
  </p>` : ''}

  ${scoresHtml ? `
  <!-- Fitness profile -->
  <div style="margin:28px 0;padding:24px;background:#fff;border-radius:8px;">
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#888;">Your fitness profile</p>
    <table style="width:100%;border-collapse:collapse;">${scoresHtml}</table>
  </div>` : ''}

  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 20px;">
    If you'd like to experience it for yourself, we'd love to have you in for a trial session — it's just ₹1,000 and you'll know right away if it's the right fit.
  </p>

  <div style="margin:28px 0;">
    <a href="https://vigourpilates.com/#trial" style="display:inline-block;background:#c9a84c;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif;font-weight:600;font-size:14px;">Book a trial session →</a>
  </div>

  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 8px;">
    Any questions at all — just reply to this email. We're happy to help.
  </p>

  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 8px;">
    Warmly,
  </p>
  <p style="font-size:16px;color:#1a1a1a;font-weight:bold;margin:0 0 4px;">The Vigour Team</p>
  <p style="font-family:Arial,sans-serif;font-size:13px;color:#999;margin:0;">Vigour Pilates Studio, Pune</p>

  <div style="margin:40px 0 24px;border-top:1px solid #e8e0d4;"></div>

  <p style="font-family:Arial,sans-serif;font-size:12px;color:#bbb;margin:0;line-height:1.8;">
    <a href="https://vigourpilates.com" style="color:#bbb;text-decoration:none;">vigourpilates.com</a> · +91 70702 11070
  </p>

</div>
</body></html>`;

  const text = `Hi ${firstName},\n\nHere's what your quiz results say about you.\n\nYour best match: ${cls.name} ${cls.emoji}\n\n${analysisText}\n\nWant to experience it? Book a trial session for ₹1,000 at vigourpilates.com/#trial\n\nAny questions — just reply to this email.\n\nWarmly,\nThe Vigour Team\nVigour Pilates Studio, Pune\nvigourpilates.com | +91 70702 11070`;

  const adminHtml = `<p>New quiz result</p><table><tr><td>Name</td><td>${name}</td></tr><tr><td>Email</td><td>${email}</td></tr><tr><td>Top class</td><td>${cls.name} ${cls.emoji}</td></tr></table>`;

  try {
    await Promise.allSettled([
      resend.emails.send({
        from: 'Vigour Pilates Studio <hello@vigourpilates.com>',
        to: email,
        subject: `${firstName}, your quiz result is here — ${cls.name} is your match`,
        html,
        text,
      }),
      resend.emails.send({
        from: 'Vigour Pilates Studio <hello@vigourpilates.com>',
        to: 'get2nihil17@gmail.com',
        subject: `Quiz result — ${name} matched with ${cls.name}`,
        html: adminHtml,
      }),
    ]);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
