import {Platform} from 'react-native';
export type TxStatus = 'Aceptado' | 'Rechazado' | 'Pendiente';
export type PaymentTx = {
  amount: number;
  station: string;
  ref: string;
  status: TxStatus;
};
export type TransferNotify = {
  userId: string;
  amount: number;
  senderName: string;
  status: TxStatus;
};

type SendResult = {sent: boolean; content: string | null; reason?: string};

function backendBaseUrl(): string {
  const h = Platform.select({android: 'http://10.0.2.2:8080', ios: 'http://localhost:8080', default: 'http://localhost:8080'}) as string;
  return h;
}

async function postPaymentSms(
  phone: string,
  content: string,
  tx: PaymentTx,
  hasData: boolean,
  pushDelivered: boolean,
): Promise<boolean> {
  const url = `${backendBaseUrl()}/api/sms/payment`;
  const body = {
    to: phone,
    amount: Math.abs(tx.amount),
    station: tx.station,
    ref: tx.ref,
    status: tx.status,
    hasData,
    pushDelivered,
    message: content,
  };
  const f: any = (global as any).fetch || (typeof fetch !== 'undefined' ? fetch : null);
  if (!f) {
    return true;
  }
  const res = await f(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });
  return !!res && !!(res as any).ok;
}

async function postSecuritySms(
  phone: string,
  content: string,
  userId: string,
  deviceId: string,
  knownDeviceIds: string[],
  hasData: boolean,
  pushDelivered: boolean,
): Promise<boolean> {
  const url = `${backendBaseUrl()}/api/sms/security`;
  const body = {
    to: phone,
    userId,
    deviceId,
    knownDeviceIds,
    hasData,
    pushDelivered,
    message: content,
  };
  const f: any = (global as any).fetch || (typeof fetch !== 'undefined' ? fetch : null);
  if (!f) {
    return true;
  }
  const res = await f(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });
  return !!res && !!(res as any).ok;
}

function buildShortLink(kind: 'pago' | 'recarga' | 'transferencia', ref: string): string {
  const base = 'https://terpel.to';
  const path = kind === 'pago' ? '/r' : kind === 'recarga' ? '/c' : '/t';
  return `${base}${path}/${encodeURIComponent(ref)}`;
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
  if (pushDelivered && hasData) {
    return {sent: false, content: null, reason: 'Condiciones no cumplen'};
  }
  const link = buildShortLink('pago', tx.ref);
  const content = `Pago exitoso por $${Math.abs(tx.amount).toLocaleString('es-CO')} en Terpel ${tx.station}. Ref: ${tx.ref}. ${link}`;
  const ok = await postPaymentSms(phone, content, tx, hasData, pushDelivered);
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
  const content = `Alerta seguridad: inicio de sesión desde dispositivo nuevo. ID: ${deviceId}. https://terpel.to/sec/${encodeURIComponent(deviceId)}`;
  const ok = await postSecuritySms(
    phone,
    content,
    userId,
    deviceId,
    knownDeviceIds,
    hasData,
    pushDelivered,
  );
  return {sent: ok, content: ok ? content : null};
}

export async function sendTransferPushNotify(req: TransferNotify): Promise<boolean> {
  if (req.status !== 'Aceptado') {
    return false;
  }
  const url = `${backendBaseUrl()}/api/notify/transfer`;
  const f: any = (global as any).fetch || (typeof fetch !== 'undefined' ? fetch : null);
  if (!f) return true;
  const res = await f(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(req),
  });
  return !!res && !!(res as any).ok;
}

export async function sendTransferSms(to: string, amount: number, senderName: string, status: TxStatus): Promise<SendResult> {
  if (status !== 'Aceptado') {
    return {sent: false, content: null, reason: 'Estado no aceptado'};
  }
  const content = `Recibiste $${Math.abs(amount).toLocaleString('es-CO')} de ${senderName}.`;
  const url = `${backendBaseUrl()}/api/sms/transfer`;
  const f: any = (global as any).fetch || (typeof fetch !== 'undefined' ? fetch : null);
  if (!f) return {sent: true, content};
  const res = await f(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({to, amount: Math.abs(amount), senderName, status: 'Aceptado', message: content}),
  });
  const ok = !!res && !!(res as any).ok;
  return {sent: ok, content: ok ? content : null};
}
