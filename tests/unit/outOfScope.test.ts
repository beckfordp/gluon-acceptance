import { describe, expect, it } from 'vitest';
import { OUT_OF_SCOPE } from '../../src/outOfScope';

describe('OUT_OF_SCOPE', () => {
  it('gives every entry a task id and a reason', () => {
    for (const [id, reason] of Object.entries(OUT_OF_SCOPE)) {
      expect(id).toMatch(/^US-\d+\.\d+$/);
      expect(reason.trim()).not.toBe('');
    }
  });
});
