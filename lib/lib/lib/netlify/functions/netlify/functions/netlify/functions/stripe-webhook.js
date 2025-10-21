// netlify/functions/stripe-webhook.js
import Stripe from 'stripe';
import { Store } from '../../lib/store.js';
import { renderPaidZip } from '../../lib/render.js';
import { sendEmailWithAttachment } from '../../lib/mailer.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const sig = event.headers['stripe-signature'];
  const raw = event.rawBody || event.body; // Netlify provides rawBody

  let evt;
  try {
    evt = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('stripe-webhook signature error:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  try {
    if (evt.type === 'checkout.session.completed') {
      const session = evt.data.object;
      const draftId = session.metadata?.draftId;
      const email = session.customer_details?.email || session.customer_email;

      const draft = Store.getDraft(draftId);
      if (draft) {
        const { buffer, filename, mime } = await renderPaidZip(draft);
        await sendEmailWithAttachment({
          to: email,
          subject: `Your ${draft.product || 'Legal Pack'}`,
          html: `<p>Hi ${draft.name || 'there'},</p><p>Thanks for your purchase. Your files are attached.</p>`,
          filename, buffer, mime
        });
        Store.saveFile(session.id, { buffer, filename, mime, expiresAt: Date.now() + 30 * 60 * 1000 });
      }
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (e) {
    console.error('stripe-webhook handler error:', e);
    return { statusCode: 500, body: 'Webhook handling failed' };
  }
};
