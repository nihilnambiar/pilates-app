// api/send-announcement.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const TYPE_EMOJI = {
  general:  '📢',
  urgent:   '🚨',
  event:    '🎉',
  reminder: '⏰',
};

const TYPE_COLOR = {
  general:  '#458361',
  urgent:   '#c85a49',
  event:    '#c9a84c',
  reminder: '#1E80C2',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { title, message, type = 'general', recipients = [] } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Missing title or message' });
  if (!recipients.length)  return res.status(400).json({ error: 'No recipients' });

  const emoji = TYPE_EMOJI[type] || '📢';
  const color = TYPE_COLOR[type] || '#458361';
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

  const buildHtml = (name) => {
    const firstName = name ? name.split(' ')[0] : 'Member';
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f6f1;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 24px 40px;">

  <p style="margin:0 0 36px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a84c;font-weight:600;">Vigour Pilates Studio</p>

  <div style="display:inline-block;padding:6px 14px;border-radius:20px;background:${color}18;border:1px solid ${color}40;margin-bottom:24px;">
    <span style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${color};">${emoji} ${typeLabel}</span>
  </div>

  <h1 style="font-size:24px;color:#1a1a1a;margin:0 0 20px;line-height:1.3;font-weight:normal;">${title}</h1>

  <p style="font-size:16px;color:#3a3a3a;line-height:1.85;margin:0 0 28px;">Hi ${firstName},</p>

  <p style="font-size:16px;color:#3a3a3a;line-height:1.85;margin:0 0 32px;white-space:pre-line;">${message}</p>

  <div style="margin:0 0 28px;border-top:1px solid #e8e0d4;"></div>

  <p style="font-size:15px;color:#3a3a3a;line-height:1.8;margin:0 0 8px;">Warm regards,</p>
  <p style="font-size:15px;color:#1a1a1a;font-weight:bold;margin:0 0 4px;">The Vigour Team</p>
  <p style="font-family:Arial,sans-serif;font-size:13px;color:#999;margin:0;">Vigour Pilates Studio, Pune</p>

  <div style="margin:36px 0 20px;border-top:1px solid #e8e0d4;"></div>

  <p style="font-family:Arial,sans-serif;font-size:12px;color:#bbb;margin:0;line-height:1.8;">
    Questions? Reply to this email or call us at <a href="tel:+917070211070" style="color:#c9a84c;text-decoration:none;">+91 70702 11070</a><br>
    <a href="https://vigourpilates.com" style="color:#bbb;text-decoration:none;">vigourpilates.com</a>
  </p>

</div>
</body></html>`;
  };

  try {
    const emails = recipients.map(({ email, name }) => ({
      from: 'Vigour Pilates Studio <hello@vigourpilates.com>',
      to:   email,
      subject: `${emoji} ${title} — Vigour Pilates`,
      html: buildHtml(name),
    }));

    // Resend batch limit is 100 per call — chunk if needed
    const chunks = [];
    for (let i = 0; i < emails.length; i += 100) chunks.push(emails.slice(i, i + 100));
    await Promise.all(chunks.map(chunk => resend.batch.send(chunk)));

    res.status(200).json({ success: true, sent: emails.length });
  } catch (err) {
    console.error('Announcement email error:', err);
    res.status(500).json({ error: 'Failed to send emails' });
  }
}
