export type Bucket = { campaign: string; amount: number; vence: string };

export type ValidationResult = { valid: boolean; amount: number; errors: string[] };

export function sanitizeAmount(input: string): number {
  const v = parseInt(String(input).replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(v) ? v : 0;
}

export function validateRedemption(buckets: Bucket[], amount: number): ValidationResult {
  const errors: string[] = [];
  if (amount <= 0) errors.push('Monto inválido');
  const total = buckets.reduce((s, b) => s + Math.max(0, b.amount), 0);
  if (amount > total) errors.push('Monto supera saldo de cashback');
  return { valid: errors.length === 0, amount, errors };
}

export function applyRedemption(buckets: Bucket[], amount: number): Bucket[] {
  let rem = amount;
  return buckets.map(b => {
    if (rem <= 0) return b;
    const deduct = Math.min(Math.max(0, b.amount), rem);
    rem -= deduct;
    return { ...b, amount: Math.max(0, b.amount - deduct) };
  });
}

