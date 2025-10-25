// site/config.js
// MOCK mode lets you click through without Netlify/Stripe/Brevo yet.
window.APP_CONFIG = {
  USE_MOCK: true,                            // <-- true = no backend required
  ENDPOINT_BASE: '/.not-configured',         // ignore for now
  PRICE_IDS: {
    caregiver: 'price_XXXX_CAREGIVER',
    nursing: 'price_XXXX_NURSING',
    tenant: 'price_XXXX_TENANT',
    demand: 'price_XXXX_DEMAND'
  },
  SUCCESS_PATHS: {
    caregiver: '/caregiver/success.html',
    nursing: '/nursing-appeal/success.html',
    tenant: '/tenant/success.html',
    demand: '/demand-letter/success.html'
  }
};
