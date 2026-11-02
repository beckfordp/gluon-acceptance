/**
 * Done user-story tasks the suite deliberately doesn't accept through gshop,
 * and why (ACC-6.1). Everything else done must be tagged on a scenario.
 */
const EMAIL = 'notification email: not visible in gshop; checked by the track\'s verify script';
const RETIRED = 'walking-skeleton async path, retired by the synchronous reserve → authorize checkout (ADR 0011 amendment); no longer in service code';
// Remove these once US-9.8's Cancel action and US-20.1's expiry sweep give
// gshop a cancellation journey to drive.
const NO_CANCEL_JOURNEY = 'no gshop cancellation journey yet: US-9.8 (Cancel action) and US-20.1 (expiry sweep) are not built';

export const OUT_OF_SCOPE: Readonly<Record<string, string>> = {
  'US-1.2': 'catalog cache: the shopper sees the same catalog with or without it',
  'US-4.2': 'resilience middleware: needs fault injection, not a user journey',
  'US-5.1': RETIRED,
  'US-5.2': RETIRED,
  'US-5.3': RETIRED,
  'US-5.4': RETIRED,
  'US-6.1': RETIRED,
  'US-6.2': 'superseded: authorize idempotency (TD-10) is a replay guard, not UI-observable',
  'US-6.3': RETIRED,
  'US-7.1': EMAIL,
  'US-9.1': `${NO_CANCEL_JOURNEY} — the API itself is built`,
  'US-12.1': 'billing address is stored with the payment method server-side; gshop never shows it back',
  'US-16.3': '`UserRegistered` event: no UI effect beyond the welcome email',
  'US-16.4': EMAIL,
  'US-17.5': EMAIL,
  'US-17.6': '`Dispatched` in Order History is transient: capture moves it to `Confirmed` within ms',
  'US-18.2': 'payment void is internal to payment-service; gshop shows no payment state after dispatch failure',
  'US-18.4': EMAIL,
  'US-19.4': EMAIL,
  'US-20.2': NO_CANCEL_JOURNEY,
  'US-20.6': NO_CANCEL_JOURNEY,
  'US-21.1': NO_CANCEL_JOURNEY,
};
