import { describe, expect, it } from 'vitest';
import { formatPrice } from '../../src/format';

describe('formatPrice', () => {
  it('formats cents as gshop does: dollar sign, two decimals, no grouping', () => {
    expect(formatPrice(450000)).toBe('$4500.00');
    expect(formatPrice(1999)).toBe('$19.99');
    expect(formatPrice(5)).toBe('$0.05');
  });
});
