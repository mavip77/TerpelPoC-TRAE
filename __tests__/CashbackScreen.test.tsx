import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react-native';
import CashbackScreen, {
  MIN_BLOCKCHAIN_AMOUNT,
  computeAvailableCashback,
  deductFromBuckets,
  redeemCashback,
  expireBuckets,
  getPreExpiryAlerts,
} from '../src/screens/CashbackScreen';

describe('CashbackScreen', () => {
  it('muestra saldos separados y reglas', () => {
    render(<CashbackScreen />);
    expect(screen.getByText('Saldo del bolsillo')).toBeTruthy();
    expect(screen.getByText('Saldo de cashback')).toBeTruthy();
    expect(screen.getByText('Reglas y vigencias')).toBeTruthy();
    expect(screen.getByText(/Bienvenida/i)).toBeTruthy();
    expect(screen.getByText(/Global/i)).toBeTruthy();
  });
  it('redime a puntos cuando el monto es menor al umbral blockchain', () => {
    const {getByPlaceholderText, getByText} = render(<CashbackScreen />);
    const input = getByPlaceholderText('$ 0');
    fireEvent.changeText(input, String(MIN_BLOCKCHAIN_AMOUNT - 1000));
    fireEvent.press(getByText('Redimir ahora'));
    expect(getByText('Convertido a puntos')).toBeTruthy();
  });
  it('utils: computeAvailableCashback y deductFromBuckets funcionan', () => {
    const buckets = [
      {campaign: 'A', amount: 1000, vence: '2030-01-01'},
      {campaign: 'B', amount: 2000, vence: '2030-06-01'},
    ];
    expect(computeAvailableCashback(buckets, new Date('2029-01-01'))).toBe(3000);
    const out = deductFromBuckets(buckets, 1500);
    expect(out[0].amount).toBe(0);
    expect(out[1].amount).toBe(1500);
  });
  it('redime al bolsillo si supera umbral blockchain', () => {
    const buckets = [
      {campaign: 'A', amount: 50000, vence: '2030-01-01'},
    ];
    const res = redeemCashback(
      MIN_BLOCKCHAIN_AMOUNT + 1000,
      'r1',
      0,
      buckets,
      0,
      new Set<string>(),
      new Date('2029-01-01'),
    );
    expect(res.outcome).toBe('wallet');
    expect(res.walletBalance).toBe(MIN_BLOCKCHAIN_AMOUNT + 1000);
  });
  it('idempotencia evita redención duplicada', () => {
    const buckets = [
      {campaign: 'A', amount: 50000, vence: '2030-01-01'},
    ];
    const processed = new Set<string>(['dup-1']);
    const res = redeemCashback(
      MIN_BLOCKCHAIN_AMOUNT + 1000,
      'dup-1',
      0,
      buckets,
      0,
      processed,
      new Date('2029-01-01'),
    );
    expect(res.error).toBe('Idempotente');
  });
  it('expira buckets vencidos y genera auditoría', () => {
    const buckets = [
      {campaign: 'A', amount: 1000, vence: '2020-01-01'},
      {campaign: 'B', amount: 2000, vence: '2030-01-01'},
    ];
    const {buckets: out, expiredAudits} = expireBuckets(buckets, new Date('2029-01-01'));
    expect(out[0].amount).toBe(0);
    expect(expiredAudits.length).toBe(1);
    expect(expiredAudits[0].tipo).toBe('expired');
  });
  it('genera alertas previas a vencimiento', () => {
    const buckets = [
      {campaign: 'A', amount: 1000, vence: '2029-01-05'},
      {campaign: 'B', amount: 2000, vence: '2030-01-01'},
    ];
    const alerts = getPreExpiryAlerts(buckets, new Date('2029-01-01'), 7);
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].campaign).toBe('A');
  });
});
