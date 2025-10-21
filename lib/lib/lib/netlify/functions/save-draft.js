// netlify/functions/save-draft.js
import { Store } from '../../lib/store.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const id = crypto.randomUUID();
    Store.saveDraft({ id, ...body, createdAt: Date.now() });
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ draftId: id })
    };
  } catch (e) {
    console.error('save-draft error', e);
    return { statusCode: 500, body: 'Failed to save draft' };
  }
};
