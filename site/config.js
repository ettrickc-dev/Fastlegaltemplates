// site/config.js
window.APP_CONFIG = {
  USE_MOCK: true, // leave true for now (mock mode)
  PRICE_IDS: {
    caregiver: 'price_CAREGIVER',
    divorce: 'price_DIVORCE',
    estate: 'price_ESTATE',
    nursing: 'price_NURSING'
  },
  SUCCESS_PATHS: {
    caregiver: '/caregiver/success.html',
    divorce: '/divorce/success.html',
    estate: '/small-estate/success.html',
    nursing: '/nursing-appeal/success.html'
  }
};
