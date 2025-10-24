// netlify/functions/stripe-webhook.js
import Stripe from 'stripe';
import { Store } from '../../lib/store.js';
import { renderPaidZip } from '../../lib/render.js';
import { sendEmailWithAttachment } from '../../lib/mailer.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const sig = event.headers['stripe-signature'];
    const raw = event.rawBody || event.body || '';

    let evt;
    try {
      evt = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('stripe-webhook signature error:', err.message);
      return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    if (evt.type === 'checkout.session.completed') {
      const session = evt.data.object;
      const draftId = session.metadata?.draftId;
      const email = session.customer_details?.email || session.customer_email;

      // pull the draft saved during checkout start
      const draft = Store.getDraft(draftId);

      if (draft) {
        // make the ZIP
        const { buffer, filename, mime } = await renderPaidZip(draft);

        // email the attachment via Brevo
        await sendEmailWithAttachment({
          to: email,
          subject: `Your ${draft.product || 'Legal Pack'}`,
          html: `<p>Hi ${draft.name || 'there'},</p>
                 <p>Thanks for your purchase. Your files are attached.</p>
                 <p>If you closed the page early, you can also download from the success page.</p>`,
          filename,
          buffer,
          mime
        });

        // cache for success page auto-download (30 minutes)
        Store.saveFile(session.id, {
          buffer,
          filename,
          mime,
          expiresAt: Date.now() + 1000 * 60 * 30
        });
      }
    }

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ received: true })
    };
  } catch (e) {
    console.error('stripe-webhook handler error:', e);
    return { statusCode: 500, body: 'Webhook handling failed' };
  }
};
