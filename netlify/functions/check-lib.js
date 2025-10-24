// netlify/functions/check-lib.js
import { renderPaidZip } from '../../lib/render.js';
import { sendEmailWithAttachment } from '../../lib/mailer.js';

export const handler = async () => {
  const hasRender = typeof renderPaidZip === 'function';
  const hasMailer = typeof sendEmailWithAttachment === 'function';
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ok: true, hasRender, hasMailer })
  };
};
