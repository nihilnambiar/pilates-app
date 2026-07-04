import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, date, time, message } = req.body;
  if (!email || !name) return res.status(400).json({ error: 'Missing fields' });

  const firstName = name.split(' ')[0];

  const preferredDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })
    : null;

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f6f1;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 24px 40px;">

  <!-- Logo -->
  <div style="margin-bottom:40px;">
    <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a84c;font-weight:600;">Vigour Pilates Studio</p>
  </div>

  <p style="font-size:22px;color:#1a1a1a;margin:0 0 24px;line-height:1.4;font-weight:normal;">Hi ${firstName},</p>

  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 16px;">
    We just received your trial session request — and we're excited to have you experience Pilates with us.
  </p>

  ${preferredDate && time ? `
  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 16px;">
    You're booked in for <strong style="color:#1a1a1a;">${preferredDate}</strong> at <strong style="color:#1a1a1a;">${time}</strong> — your spot is reserved.<br/>
    One of our team members may still reach out via call or WhatsApp to say hi before your session.
  </p>` : preferredDate ? `
  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 16px;">
    Your preferred date is <strong style="color:#1a1a1a;">${preferredDate}</strong>, and we're currently reserving a spot for you.<br/>
    One of our team members will reach out via call or WhatsApp within the next 24 hours to confirm your timing.
  </p>` : `
  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 16px;">
    We're currently reserving a spot for you. One of our team members will reach out via call or WhatsApp within the next 24 hours to confirm your timing.
  </p>`}

  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 28px;">
    Quick note: Our trial slots are limited each day to ensure personal attention, so we'll help you lock in the best available time.
  </p>

  <div style="margin:0 0 8px;border-top:1px solid #e8e0d4;"></div>

  <p style="font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#1a1a1a;margin:24px 0 12px;letter-spacing:0.01em;">Here's how to prepare for your session:</p>
  <ul style="padding-left:20px;margin:0 0 28px;">
    <li style="font-size:15px;color:#3a3a3a;line-height:2.2;">Wear comfortable, form-fitting clothes</li>
    <li style="font-size:15px;color:#3a3a3a;line-height:2.2;">Grip socks are recommended (available at the studio if needed)</li>
    <li style="font-size:15px;color:#3a3a3a;line-height:2.2;">Bring a water bottle</li>
    <li style="font-size:15px;color:#3a3a3a;line-height:2.2;">Arrive 5 minutes early so we can get you settled in</li>
  </ul>

  <div style="margin:0 0 8px;border-top:1px solid #e8e0d4;"></div>

  <p style="font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#1a1a1a;margin:24px 0 12px;letter-spacing:0.01em;">Trial Details:</p>
  <ul style="padding-left:20px;margin:0 0 28px;">
    <li style="font-size:15px;color:#3a3a3a;line-height:2.2;">Session Fee: <strong style="color:#1a1a1a;">₹1,000</strong> (pay at the studio via cash or UPI)</li>
    <li style="font-size:15px;color:#3a3a3a;line-height:2.2;">Experience Level: Absolute beginners welcome</li>
  </ul>

  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 28px;">
    You don't need any prior experience — your instructor will guide you step-by-step. Most of our members start exactly where you are, and within a few sessions, they begin to feel stronger, more flexible, and more confident in their body.
  </p>

  <div style="margin:0 0 28px;border-top:1px solid #e8e0d4;"></div>

  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 28px;">
    If you have a preferred time, just reply to this email and we'll prioritize it for you.
  </p>

  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 24px;">
    We're looking forward to welcoming you to the studio, ${firstName} — this could be the start of something really powerful for your body and mind.
  </p>

  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 8px;">See you soon,</p>
  <p style="font-size:16px;color:#1a1a1a;font-weight:bold;margin:0 0 4px;">The Vigour Team</p>
  <p style="font-family:Arial,sans-serif;font-size:13px;color:#999;margin:0;">Vigour Pilates Studio, Pune</p>

  <div style="margin:40px 0 24px;border-top:1px solid #e8e0d4;"></div>

  <p style="font-family:Arial,sans-serif;font-size:12px;color:#bbb;margin:0;line-height:1.8;">
    Questions? Reply to this email or call us at <a href="tel:+917070211070" style="color:#c9a84c;text-decoration:none;">+91 70702 11070</a><br>
    <a href="https://vigourpilates.com" style="color:#bbb;text-decoration:none;">vigourpilates.com</a>
  </p>

</div>
</body></html>`;

  const adminHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#fff;font-family:Arial,sans-serif;">
<p style="font-size:13px;color:#888;margin:0 0 16px;">New trial booking via vigourpilates.com</p>
<table style="border-collapse:collapse;font-size:14px;">
  <tr><td style="padding:6px 16px 6px 0;color:#888;">Name</td><td style="color:#111;font-weight:600;">${name}</td></tr>
  <tr><td style="padding:6px 16px 6px 0;color:#888;">Email</td><td style="color:#111;">${email}</td></tr>
  ${phone ? `<tr><td style="padding:6px 16px 6px 0;color:#888;">Phone</td><td style="color:#111;">${phone}</td></tr>` : ''}
  ${preferredDate ? `<tr><td style="padding:6px 16px 6px 0;color:#888;">Date</td><td style="color:#111;">${preferredDate}</td></tr>` : ''}
  ${time ? `<tr><td style="padding:6px 16px 6px 0;color:#888;">Time</td><td style="color:#111;font-weight:600;">${time}</td></tr>` : ''}
  ${message ? `<tr><td style="padding:6px 16px 6px 0;color:#888;vertical-align:top;">Note</td><td style="color:#555;font-style:italic;">"${message}"</td></tr>` : ''}
</table>
<p style="font-size:12px;color:#bbb;margin-top:20px;"><a href="https://vigourpilates.com/admin/trials" style="color:#c9a84c;">View in admin panel →</a></p>
</body></html>`;

  const text = `Hi ${firstName},\n\nWe just received your trial session request — and we're excited to have you experience Pilates with us.\n\n${preferredDate && time ? `You're booked in for ${preferredDate} at ${time} — your spot is reserved.\n` : preferredDate ? `Your preferred date is ${preferredDate}, and we're currently reserving a spot for you.\n` : ''}One of our team members will reach out via call or WhatsApp within the next 24 hours to confirm your timing.\n\nQuick note: Our trial slots are limited each day to ensure personal attention, so we'll help you lock in the best available time.\n\n---\n\nHere's how to prepare:\n- Wear comfortable, form-fitting clothes\n- Grip socks are recommended (available at the studio if needed)\n- Bring a water bottle\n- Arrive 5 minutes early\n\nTrial Details:\n- Session Fee: ₹1,000 (pay at the studio via cash or UPI)\n- Experience Level: Absolute beginners welcome\n\nYou don't need any prior experience — your instructor will guide you step-by-step. Most of our members start exactly where you are, and within a few sessions, they begin to feel stronger, more flexible, and more confident in their body.\n\n---\n\nIf you have a preferred time, just reply to this email and we'll prioritize it for you.\n\nWe're looking forward to welcoming you to the studio, ${firstName} — this could be the start of something really powerful for your body and mind.\n\nSee you soon,\nThe Vigour Team\nVigour Pilates Studio, Pune\n\nQuestions? Reply here or call us at +91 70702 11070\nvigourpilates.com`;

  try {
    const results = await Promise.allSettled([
      resend.emails.send({
        from: 'Vigour Pilates Studio <hello@vigourpilates.com>',
        to: email,
        subject: `${firstName}, we got your trial request 🌿`,
        html,
        text,
      }),
      resend.emails.send({
        from: 'Vigour Pilates Studio <hello@vigourpilates.com>',
        to: 'get2nihil17@gmail.com',
        subject: `New trial booking — ${name}`,
        html: adminHtml,
      }),
    ]);

    const userResult = results[0];
    if (userResult.status === 'rejected') {
      console.error('User email failed:', userResult.reason);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Trial email error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
