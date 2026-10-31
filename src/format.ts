/** A price as gshop shows it (its `src/lib/format.ts`), e.g. `$4500.00`. */
export function formatPrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}
