// netlify/functions/download-once.js
import { Store } from '../../lib/store.js';

export const handler = async (event) => {
  try {
    const token = new URL(event.rawUrl).searchParams.get('token');
    if (!token) return { statusCode: 400, body: 'Missing token' };

    const f = Store.getFile(token);
    if (!f) return { statusCode: 404, body: 'Expired or not found' };

    return {
      statusCode: 200,
      headers: {
        'content-type': f.mime,
        'content-disposition': `attachment; filename="${f.filename}"`
      },
      body: f.buffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (e) {
    console.error('download-once error', e);
    return { statusCode: 500, body: 'Failed to download' };
  }
};
