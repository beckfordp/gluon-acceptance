/**
 * Done user-story tasks the suite deliberately doesn't accept through gshop,
 * and why (ACC-6.1). Everything else done must be tagged on a scenario.
 */
const EMAIL = 'notification email: not visible in gshop; checked by the track\'s verify script';
const RETIRED = 'walking-skeleton async path, retired by the synchronous reserve → authorize checkout (ADR 0011 amendment); no longer in service code';
// Cancel/void/capture/dispatch races: gshop can't make two services' events
// interleave on cue, so the losing side's handling is proven per service.
const RACE = 'needs a cancel to race capture or dispatch, which gshop can\'t time; covered by the j7-* tracks\' service tests and services/inventory-service/scripts/verify-shipped-guard.sh';
// A reconciliation flag is only raised by a lost race (above), so the console
// never has one to show or resolve in a suite run.
const NO_FLAG = 'reconciliation flags only come from a lost race, which gshop can\'t raise; covered by each service\'s reconciliation tests';

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
  'US-9.2': '`reason` on OrderCancelled: no UI effect; checked by verify-auth-expiry.sh',
  'US-9.3': 'payment void on cancel is internal to payment-service; gshop shows no payment state; covered by services/payment-service/scripts/verify-void.sh',
  'US-9.6': RACE,
  'US-9.7': 'repeat cancel and cancel-vs-expiry: gshop hides Cancel after the first; covered by services/order-service/scripts/verify-operator-cancel.sh (repeat) and order-service tests (expiry race)',
  'US-9.9': EMAIL,
  'US-12.1': 'billing address is stored with the payment method server-side; gshop never shows it back',
  'US-16.3': '`UserRegistered` event: no UI effect beyond the welcome email',
  'US-16.4': EMAIL,
  'US-17.5': EMAIL,
  'US-17.6': '`Dispatched` in Order History is transient: capture moves it to `Confirmed` within ms',
  'US-18.2': 'payment void is internal to payment-service; gshop shows no payment state after dispatch failure',
  'US-18.4': EMAIL,
  'US-19.4': EMAIL,
  'US-20.5': EMAIL,
  'US-21.2': RACE,
  'US-21.3': RACE,
  'US-21.4': RACE,
  'US-22.1': 'refinement and ADR 0024: no behaviour of its own',
  'US-22.3': 'the operator actor is only logged by notification-service; the customer copy is unchanged; covered by notification-service tests',
  'US-26.1': NO_FLAG,
  'US-26.2': 'Prometheus alert on the flags counter: not gshop; covered by the obs alert rules',
  'US-26.3': NO_FLAG,
};
