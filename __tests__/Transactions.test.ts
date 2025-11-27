import {applyRedemption, sanitizeAmount, validateRedemption} from '../src/utils/transactions';

describe('Transactions utils', () => {
  test('sanitizeAmount parses digits and ignores non-numeric', () => {
    expect(sanitizeAmount('$ 1,200')).toBe(1200);
    expect(sanitizeAmount('abc')).toBe(0);
    expect(sanitizeAmount('0')).toBe(0);
  });

  test('validateRedemption fails for zero or negative', () => {
    const buckets = [{campaign: 'A', amount: 1000, vence: '2025-12-31'}];
    expect(validateRedemption(buckets, 0).valid).toBe(false);
    expect(validateRedemption(buckets, -1).valid).toBe(false);
  });

  test('validateRedemption fails when amount exceeds total', () => {
    const buckets = [
      {campaign: 'A', amount: 1000, vence: '2025-12-31'},
      {campaign: 'B', amount: 500, vence: '2026-03-31'},
    ];
    expect(validateRedemption(buckets, 2000).valid).toBe(false);
  });

  test('validateRedemption passes for valid amount', () => {
    const buckets = [
      {campaign: 'A', amount: 1000, vence: '2025-12-31'},
      {campaign: 'B', amount: 500, vence: '2026-03-31'},
    ];
    const res = validateRedemption(buckets, 1200);
    expect(res.valid).toBe(true);
  });

  test('applyRedemption deducts across buckets sequentially', () => {
    const buckets = [
      {campaign: 'A', amount: 1000, vence: '2025-12-31'},
      {campaign: 'B', amount: 500, vence: '2026-03-31'},
    ];
    const next = applyRedemption(buckets, 1200);
    expect(next[0].amount).toBe(0);
    expect(next[1].amount).toBe(300);
  });
});

