export type TxStatus = 'Aceptado' | 'Rechazado' | 'Pendiente';
export type PaymentTx = {
  amount: number;
  station: string;
  ref: string;
  status: TxStatus;
};

type SendResult = {sent: boolean; content: string | null; reason?: string};

async function postToSmsProvider(phone: string, content: string): Promise<boolean> {
  return true;
}

export async function sendSmsPayment(
  phone: string,
  tx: PaymentTx,
  hasData: boolean,
  pushDelivered: boolean,
): Promise<SendResult> {
  if (tx.status !== 'Aceptado') {
    return {sent: false, content: null, reason: 'Estado no aceptado'};
  }
  if (pushDelivered || hasData) {
    return {sent: false, content: null, reason: 'Condiciones no cumplen'};
  }
  const content = `Pago exitoso por $${Math.abs(tx.amount).toLocaleString('es-CO')} en Terpel ${tx.station}. Ref: ${tx.ref}`;
  const ok = await postToSmsProvider(phone, content);
  return {sent: ok, content: ok ? content : null};
}

export async function sendSmsSecurityLogin(
  phone: string,
  userId: string,
  deviceId: string,
  knownDeviceIds: string[],
  hasData: boolean,
  pushDelivered: boolean,
): Promise<SendResult> {
  const isNewDevice = !knownDeviceIds.includes(deviceId);
  if (!isNewDevice) {
    return {sent: false, content: null, reason: 'Dispositivo conocido'};
  }
  if (!(pushDelivered === false || hasData === false)) {
    return {sent: false, content: null, reason: 'Condiciones no cumplen'};
  }
  const content = `Alerta seguridad: inicio de sesión desde dispositivo nuevo. ID: ${deviceId}`;
  const ok = await postToSmsProvider(phone, content);
  return {sent: ok, content: ok ? content : null};
}

