import {sendSmsPayment, sendSmsSecurityLogin} from '../src/services/sms';

describe('SMS Service', () => {
  it('no envía SMS si estado no aceptado', async () => {
    const res = await sendSmsPayment('+573000000000', {
      amount: 10000,
      station: 'Estación A',
      ref: 'ABC123',
      status: 'Rechazado',
    }, false, false);
    expect(res.sent).toBe(false);
  });
  it('envía SMS pago aceptado sin datos y sin push', async () => {
    const res = await sendSmsPayment('+573000000000', {
      amount: 20000,
      station: 'Estación A',
      ref: 'ABC123',
      status: 'Aceptado',
    }, false, false);
    expect(res.sent).toBe(true);
    expect(String(res.content)).toMatch(/Pago exitoso/);
  });
  it('seguridad: envía SMS si dispositivo nuevo', async () => {
    const res = await sendSmsSecurityLogin(
      '+573000000000',
      'user-1',
      'dev-2',
      ['dev-1'],
      false,
      false,
    );
    expect(res.sent).toBe(true);
    expect(String(res.content)).toMatch(/Alerta seguridad/);
  });
});

