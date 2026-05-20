/* Site-wide configuration for endpoints and feature toggles.
   Edit this file to configure analytics, API endpoints, and optional features.
*/
window.SITE_CONFIG = {
  /* Contact form API endpoint (AWS API Gateway + Lambda + SES).
     Replace with your actual API Gateway URL once deployed. */
  CONTACT_API_URL: ""  /* Configure when ready: AWS API Gateway URL or remove if unused */,

  /* Cloudflare Turnstile (CAPTCHA alternative).
     Set ENABLE_TURNSTILE: true and add your site key to activate. */
  ENABLE_TURNSTILE: false,
  TURNSTILE_SITE_KEY: "",

  ANALYTICS: {
    /* Plausible — privacy-friendly, no cookies required */
    ENABLE_PLAUSIBLE: false,  /* Set true only after registering domain at plausible.io */
    DOMAIN: "springvalleydentistry.com",
    // Uncomment to use self-hosted Plausible:
    // PLAUSIBLE_SRC: "https://analytics.example.com/js/plausible.js",

    /* Google Analytics 4 — set ENABLE_GA: true and add Measurement ID */
    ENABLE_GA: true,
    GA_MEASUREMENT_ID: "G-KY64HPT0ER"
  }
};

/* Service Worker registration */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .catch(function (err) { console.warn('SW registration failed:', err); });
  });
}
