import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function buildICS(className, date, time, location) {
  const [year, month, day] = date.split('-');
  const [hour, min] = time.split(':');
  const pad = n => String(n).padStart(2, '0');

  const startDT = `${year}${month}${day}T${pad(hour)}${pad(min)}00`;
  const endHour = String(parseInt(hour) + 1).padStart(2, '0');
  const endDT   = `${year}${month}${day}T${endHour}${pad(min)}00`;
  const now     = new Date().toISOString().replace(/[-:.]/g,'').slice(0,15);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vigour Pilates Studio//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${now}-vigour@vigourpilates.com`,
    `DTSTAMP:${now}Z`,
    `DTSTART:${startDT}`,
    `DTEND:${endDT}`,
    `SUMMARY:${className} — Vigour Pilates Studio`,
    `DESCRIPTION:Your class is confirmed! See you at Vigour Pilates Studio, Pune.`,
    `LOCATION:${location || 'Vigour Pilates Studio, Pune'}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userName, userEmail, className, date, time, trainer, location } = req.body;
  if (!userEmail || !className || !date || !time) return res.status(400).json({ error: 'Missing fields' });

  const firstName = (userName || 'there').split(' ')[0];

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const icsContent = buildICS(className, date, time, location);

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f6f1;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 24px 40px;">

  <!-- Logo -->
  <div style="margin-bottom:40px;">
    <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a84c;font-weight:600;">Vigour Pilates Studio</p>
  </div>

  <!-- Main letter -->
  <p style="font-size:22px;color:#1a1a1a;margin:0 0 24px;line-height:1.4;font-weight:normal;">
    You're all set, ${firstName}.
  </p>

  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 20px;">
    Your spot is confirmed — we'll see you on the mat.
  </p>

  <!-- Class details -->
  <div style="margin:28px 0;padding:24px;background:#fff;border-left:3px solid #c9a84c;border-radius:0 8px 8px 0;">
    <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#c9a84c;">Your class</p>
    <p style="margin:0 0 4px;font-size:20px;color:#1a1a1a;font-weight:bold;">${className}</p>
    <p style="margin:0 0 2px;font-size:15px;color:#555;font-family:Arial,sans-serif;">${displayDate}</p>
    <p style="margin:0 0 2px;font-size:15px;color:#555;font-family:Arial,sans-serif;">${time}</p>
    ${trainer ? `<p style="margin:4px 0 0;font-size:14px;color:#888;font-family:Arial,sans-serif;">with ${trainer}</p>` : ''}
  </div>

  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 20px;">
    A calendar invite is attached — tap it to add the class to your calendar so you don't forget.
  </p>

  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 20px;">
    Quick reminder — bring grip socks, a water bottle, and wear something you can move comfortably in. Try to arrive 5 minutes early if you can.
  </p>

  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 20px;">
    If anything comes up and you need to reschedule, just log into your dashboard at <a href="https://vigourpilates.com/dashboard" style="color:#c9a84c;">vigourpilates.com/dashboard</a>.
  </p>

  <p style="font-size:16px;color:#3a3a3a;line-height:1.8;margin:0 0 8px;">
    See you soon,
  </p>
  <p style="font-size:16px;color:#1a1a1a;font-weight:bold;margin:0 0 4px;">The Vigour Team</p>
  <p style="font-family:Arial,sans-serif;font-size:13px;color:#999;margin:0;">Vigour Pilates Studio, Pune</p>

  <div style="margin:40px 0 24px;border-top:1px solid #e8e0d4;"></div>

  <p style="font-family:Arial,sans-serif;font-size:12px;color:#bbb;margin:0;line-height:1.8;">
    Questions? Reply to this email or call <a href="tel:+917070211070" style="color:#c9a84c;text-decoration:none;">+91 70702 11070</a><br>
    <a href="https://vigourpilates.com" style="color:#bbb;text-decoration:none;">vigourpilates.com</a>
  </p>

</div>
</body></html>`;

  const text = `You're all set, ${firstName}.\n\nYour spot is confirmed — we'll see you on the mat.\n\nClass: ${className}\nDate: ${displayDate}\nTime: ${time}${trainer ? `\nWith: ${trainer}` : ''}\nLocation: ${location || 'Vigour Pilates Studio, Pune'}\n\nA calendar invite is attached — add it so you don't forget.\n\nBring grip socks, a water bottle, and arrive 5 mins early.\n\nNeed to reschedule? Log in at vigourpilates.com/dashboard\n\nSee you soon,\nThe Vigour Team\nvigourpilates.com | +91 70702 11070`;

  try {
    await resend.emails.send({
      from: 'Vigour Pilates Studio <hello@vigourpilates.com>',
      to: userEmail,
      subject: `See you ${displayDate.split(',')[0]}, ${firstName} — ${className} is confirmed`,
      html,
      text,
      attachments: [{
        filename: 'vigour-class.ics',
        content: Buffer.from(icsContent).toString('base64'),
        contentType: 'text/calendar',
      }],
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
