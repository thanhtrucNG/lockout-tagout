// Public configuration only. Orders are paid in full (no deposit option since 2026-10-03).
// Never put merchant secrets or provider keys in browser configuration.
export const checkoutConfig = Object.freeze({
  paymentMode: 'simulation',
  apiBase: null,
  // Enable each method only after its backend/provider integration is ready.
  methods: Object.freeze({ card: false, paypal: false, zalopay: false, bank_transfer: false }),
});
