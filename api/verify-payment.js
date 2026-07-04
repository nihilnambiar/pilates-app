import crypto   from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    name, email, phone,
    planName, amount, sessions, perSession,
  } = req.body;

  // ── Verify HMAC signature ──────────────────────────────────────
  const body     = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification failed' });
  }

  const firstName = name.trim().split(' ')[0];
  const amountFmt = Number(amount).toLocaleString('en-IN');
  const isElite   = planName === 'Elite';

  // ── Standard customer email ────────────────────────────────────
  const standardHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f5f3;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:540px;margin:0 auto;padding:48px 24px;">

  <p style="margin:0 0 40px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#999;">Vigour Pilates Studio</p>

  <p style="font-size:18px;color:#1a1a1a;line-height:1.7;margin:0 0 20px;">Hi ${firstName},</p>

  <p style="font-size:16px;color:#333;line-height:1.8;margin:0 0 20px;">
    You're all set. Your <strong style="color:#1a1a1a;">${planName}</strong> membership (${sessions}) is confirmed and ₹${amountFmt} has been received.
  </p>

  <p style="font-size:16px;color:#333;line-height:1.8;margin:0 0 32px;">
    We'll be in touch within the next day to help you book your first session and get you set up on the member portal. If you'd like to sort a time sooner, just reply here or give us a call.
  </p>

  <div style="border-left:2px solid #ddd;padding:16px 20px;margin:0 0 32px;">
    <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:12px;color:#999;">Payment reference</p>
    <p style="margin:0;font-family:'Courier New',monospace;font-size:13px;color:#555;">${razorpay_payment_id}</p>
  </div>

  <p style="font-size:16px;color:#333;line-height:1.8;margin:0 0 20px;">
    One thing worth knowing — wear something comfortable, bring a water bottle, and arrive a few minutes early for your first session. That's genuinely all you need.
  </p>

  <p style="font-size:16px;color:#333;line-height:1.8;margin:0 0 32px;">
    Looking forward to having you in.
  </p>

  <div style="height:1px;background:#e8e8e8;margin:0 0 28px;"></div>

  <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 4px;">Team Vigour Pilates</p>
  <p style="font-size:13px;margin:0;">
    <a href="tel:7070211070" style="color:#888;text-decoration:none;">+91 70702 11070</a>
    &nbsp;·&nbsp;
    <a href="https://vigourpilates.com" style="color:#888;text-decoration:none;">vigourpilates.com</a>
  </p>

</div>
</body>
</html>`;

  // ── Elite customer email (dark, personal) ──────────────────────
  const eliteHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0e0c08;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:540px;margin:0 auto;padding:48px 24px;">

  <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(201,164,106,0.5),transparent);margin-bottom:40px;"></div>

  <p style="margin:0 0 40px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(201,164,106,0.5);">Vigour Pilates Studio</p>

  <p style="font-size:18px;color:rgba(255,255,255,0.75);line-height:1.7;margin:0 0 20px;">Hi ${firstName},</p>

  <p style="font-size:16px;color:rgba(255,255,255,0.6);line-height:1.9;margin:0 0 20px;">
    Thank you for choosing Elite. It's our most committed membership, and we don't take that lightly.
  </p>

  <p style="font-size:16px;color:rgba(255,255,255,0.6);line-height:1.9;margin:0 0 32px;">
    Your trainer will reach out personally within a few hours to introduce themselves and get your first session scheduled at a time that works for you.
  </p>

  <div style="border-left:1px solid rgba(201,164,106,0.3);padding:16px 20px;margin:0 0 32px;">
    <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;color:rgba(201,164,106,0.45);letter-spacing:0.1em;text-transform:uppercase;">Your membership</p>
    <p style="margin:0 0 4px;font-size:15px;color:#c9a46a;font-style:italic;">Elite &nbsp;·&nbsp; ${sessions}</p>
    <p style="margin:0 0 12px;font-size:14px;color:rgba(201,164,106,0.55);">₹${amountFmt} received</p>
    <p style="margin:0;font-family:'Courier New',monospace;font-size:11px;color:rgba(201,164,106,0.35);">${razorpay_payment_id}</p>
  </div>

  <p style="font-family:Arial,sans-serif;font-size:11px;color:rgba(201,164,106,0.4);letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px;">What's included</p>
  <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
    <tr><td style="padding:5px 12px 5px 0;color:rgba(201,164,106,0.5);font-size:12px;">—</td><td style="padding:5px 0;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.6;">Personalised progress tracking each session</td></tr>
    <tr><td style="padding:5px 12px 5px 0;color:rgba(201,164,106,0.5);font-size:12px;">—</td><td style="padding:5px 0;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.6;">Nutrition guidance and lifestyle support</td></tr>
    <tr><td style="padding:5px 12px 5px 0;color:rgba(201,164,106,0.5);font-size:12px;">—</td><td style="padding:5px 0;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.6;">Direct trainer access between sessions</td></tr>
    <tr><td style="padding:5px 12px 5px 0;color:rgba(201,164,106,0.5);font-size:12px;">—</td><td style="padding:5px 0;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.6;">Priority booking, always first access to new slots</td></tr>
    <tr><td style="padding:5px 12px 5px 0;color:rgba(201,164,106,0.5);font-size:12px;">—</td><td style="padding:5px 0;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.6;">Bonus session benefits throughout your plan</td></tr>
  </table>

  <p style="font-size:16px;color:rgba(255,255,255,0.55);line-height:1.9;margin:0 0 32px;">
    This is your commitment to yourself. We take that seriously, and we'll make it count.
  </p>

  <div style="height:1px;background:rgba(201,164,106,0.12);margin:0 0 28px;"></div>

  <p style="font-size:14px;color:rgba(255,255,255,0.35);line-height:1.8;margin:0 0 4px;">Team Vigour Pilates</p>
  <p style="font-size:13px;margin:0;">
    <a href="tel:7070211070" style="color:rgba(201,164,106,0.45);text-decoration:none;">+91 70702 11070</a>
    &nbsp;·&nbsp;
    <a href="https://vigourpilates.com" style="color:rgba(201,164,106,0.45);text-decoration:none;">vigourpilates.com</a>
  </p>

  <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(201,164,106,0.2),transparent);margin-top:40px;"></div>

</div>
</body>
</html>`;

  const customerHtml = isElite ? eliteHtml : standardHtml;

  // ── Studio notification email ──────────────────────────────────
  const studioHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:32px 24px;background:#fff;font-family:Arial,sans-serif;">
  <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 4px;">${isElite ? '⭐ Elite purchase' : 'New membership'} — ${name}</p>
  <p style="font-size:13px;color:#999;margin:0 0 24px;">via vigourpilates.com</p>
  <table style="border-collapse:collapse;font-size:14px;width:100%;max-width:380px;">
    <tr><td style="padding:8px 20px 8px 0;color:#999;white-space:nowrap;">Name</td><td style="padding:8px 0;color:#111;font-weight:600;">${name}</td></tr>
    <tr><td style="padding:8px 20px 8px 0;color:#999;">Email</td><td style="padding:8px 0;color:#333;">${email}</td></tr>
    <tr><td style="padding:8px 20px 8px 0;color:#999;">Phone</td><td style="padding:8px 0;color:#333;">${phone || '—'}</td></tr>
    <tr><td style="padding:8px 20px 8px 0;color:#999;">Plan</td><td style="padding:8px 0;color:#111;font-weight:600;">${planName} &nbsp;·&nbsp; ${sessions}</td></tr>
    <tr><td style="padding:8px 20px 8px 0;color:#999;">Amount</td><td style="padding:8px 0;color:#16a34a;font-weight:700;">₹${amountFmt}</td></tr>
    <tr><td style="padding:8px 20px 8px 0;color:#999;vertical-align:top;">Payment</td><td style="padding:8px 0;font-family:'Courier New',monospace;font-size:12px;color:#555;">${razorpay_payment_id}</td></tr>
  </table>
  <p style="font-size:12px;color:#bbb;margin-top:24px;"><a href="https://vigour-studio.vercel.app" style="color:#1E80C2;text-decoration:none;">Assign membership in admin panel →</a></p>
</body></html>`;

  try {
    await Promise.all([
      resend.emails.send({
        from:    'Vigour Pilates Studio <hello@vigourpilates.com>',
        to:      email,
        subject: isElite
          ? `Welcome to Elite, ${firstName}.`
          : `You're confirmed, ${firstName} — ${planName} membership`,
        html: customerHtml,
      }),
      resend.emails.send({
        from:    'Vigour Pilates Studio <hello@vigourpilates.com>',
        to:      'get2nihil17@gmail.com',
        subject: `${isElite ? '⭐ Elite — ' : ''}${name} · ${planName} · ₹${amountFmt}`,
        html:    studioHtml,
      }),
    ]);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('verify-payment email error:', err);
    res.status(200).json({ ok: true, emailWarning: true });
  }
}
