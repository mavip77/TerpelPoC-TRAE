import {sendTransferPushNotify, sendTransferSms} from '../src/services/sms';

describe('Servicios de transferencia', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn(async (url: string, init: any) => {
      return {ok: true};
    });
  });

  it('sendTransferPushNotify solo envía en estado Aceptado', async () => {
    const ok1 = await sendTransferPushNotify({
      userId: 'user-1',
      amount: 1000,
      senderName: 'Tú',
      status: 'Aceptado',
    });
    expect(ok1).toBe(true);
    const ok2 = await sendTransferPushNotify({
      userId: 'user-2',
      amount: 500,
      senderName: 'Tú',
      status: 'Rechazado',
    });
    expect(ok2).toBe(false);
  });

  it('sendTransferSms construye el contenido para Aceptado', async () => {
    const res = await sendTransferSms('+57 300 000 0000', 1500, 'Juan', 'Aceptado');
    expect(res.sent).toBe(true);
    expect(String(res.content)).toContain('Recibiste $1.500 de Juan');
  });
});

