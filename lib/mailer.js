// lib/mailer.js - Brevo (Sendinblue)
export async function sendEmailWithAttachment({ to, subject, html, filename, buffer, mime }) {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.MAIL_FROM || 'no-reply@yourdomain.com';
  if (!apiKey) throw new Error('Missing BREVO_API_KEY');

  const body = {
    sender: { email: from, name: 'Fast Legal Templates' },
    to: [{ email: to }],
    subject,
    htmlContent: html,
    attachment: [{ name: filename, content: Buffer.from(buffer).toString('base64') }]
  };

  const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'accept': 'application/json', 'api-key': apiKey, 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error('Brevo send error: ' + t);
  }
}
