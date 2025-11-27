import {Platform, Linking} from 'react-native';
import * as Keychain from 'react-native-keychain';

export type InboxMessage = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  deeplink?: string;
};

export type InboxPage = {
  items: InboxMessage[];
  nextCursor?: string;
};

function backendBaseUrl(): string {
  const h = Platform.select({android: 'http://10.0.2.2:8080', ios: 'http://localhost:8080', default: 'http://localhost:8080'}) as string;
  return h;
}

export async function fetchInbox(cursor?: string, pageSize: number = 20): Promise<InboxPage> {
  const f: any = (global as any).fetch || (typeof fetch !== 'undefined' ? fetch : null);
  if (!f) return {items: [], nextCursor: undefined};
  const url = `${backendBaseUrl()}/api/inbox/history?limit=${pageSize}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
  const res = await f(url);
  if (!(res && (res as any).ok)) return {items: [], nextCursor: undefined};
  const data = await (res as any).json();
  return data as InboxPage;
}

export async function markAsRead(id: string): Promise<boolean> {
  const f: any = (global as any).fetch || (typeof fetch !== 'undefined' ? fetch : null);
  if (!f) return true;
  const url = `${backendBaseUrl()}/api/inbox/read/${encodeURIComponent(id)}`;
  const res = await f(url, {method: 'POST'});
  return !!res && !!(res as any).ok;
}

const SERVICE = 'inbox';

export async function loadLocalInbox(): Promise<InboxMessage[]> {
  try {
    const creds = await Keychain.getGenericPassword({service: SERVICE});
    if (!creds) return [];
    const raw = creds.password;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as InboxMessage[];
    return [];
  } catch {
    return [];
  }
}

export async function saveLocalInbox(items: InboxMessage[]): Promise<void> {
  try {
    await Keychain.setGenericPassword('inbox', JSON.stringify(items), {service: SERVICE});
  } catch {}
}

export function mergeInbox(current: InboxMessage[], incoming: InboxMessage[]): InboxMessage[] {
  const byId: Record<string, InboxMessage> = {};
  for (const it of current) byId[it.id] = it;
  for (const it of incoming) byId[it.id] = {...(byId[it.id] || {} as any), ...it};
  const merged = Object.values(byId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return merged;
}

export async function syncAndPersistInbox(cursor?: string, pageSize: number = 20): Promise<InboxMessage[]> {
  const local = await loadLocalInbox();
  const page = await fetchInbox(cursor, pageSize);
  const merged = mergeInbox(local, page.items);
  await saveLocalInbox(merged);
  return merged;
}

export async function markLocalRead(id: string): Promise<void> {
  const items = await loadLocalInbox();
  const updated = items.map(i => (i.id === id ? {...i, read: true} : i));
  await saveLocalInbox(updated);
}

export async function openSecureDeeplink(url?: string): Promise<boolean> {
  if (!url) return false;
  const ok = /^terpel:\/\/(promo|alert)\/[\-A-Za-z0-9_]+$/.test(url);
  if (!ok) return false;
  try {
    const can = await Linking.canOpenURL(url);
    if (!can) return false;
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
