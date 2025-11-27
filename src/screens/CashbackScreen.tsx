import React, {useEffect, useMemo, useState} from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../constants/HomeConstants';

type Bucket = {campaign: string; amount: number; vence: string};

export const MIN_BLOCKCHAIN_AMOUNT = 20000;

export function isAnyBucketValid(buckets: Bucket[], now: Date): boolean {
  return buckets.some(b => new Date(b.vence).getTime() >= now.getTime());
}

export function isBucketValid(b: Bucket, now: Date): boolean {
  return new Date(b.vence).getTime() >= now.getTime();
}

export function computeAvailableCashback(buckets: Bucket[], now: Date): number {
  return buckets.reduce(
    (sum, b) => sum + (isBucketValid(b, now) ? Math.max(0, b.amount) : 0),
    0,
  );
}

export function computeTotalCashback(buckets: Bucket[]): number {
  return buckets.reduce((sum, b) => sum + Math.max(0, b.amount), 0);
}

export function deductFromBuckets(buckets: Bucket[], amount: number): Bucket[] {
  if (amount <= 0) return buckets.slice();
  const now = new Date();
  const sorted = buckets
    .slice()
    .filter(b => isBucketValid(b, now))
    .sort((a, b) => new Date(a.vence).getTime() - new Date(b.vence).getTime());
  let remaining = amount;
  for (const b of sorted) {
    if (remaining <= 0) break;
    const take = Math.min(b.amount, remaining);
    b.amount -= take;
    remaining -= take;
  }
  const byKey = new Map<string, Bucket>();
  for (const s of sorted) byKey.set(`${s.campaign}-${s.vence}`, s);
  return buckets.map(b => byKey.get(`${b.campaign}-${b.vence}`) || b);
}

export type RedemptionAudit = {
  id: string;
  tipo: string;
  monto: number;
  fecha: string;
};
export type RedemptionResult = {
  walletBalance: number;
  buckets: Bucket[];
  pointsBalance: number;
  outcome?: 'wallet' | 'points';
  error?: string;
  audit: RedemptionAudit | null;
};

export function redeemCashback(
  amount: number,
  redemptionId: string,
  walletBalance: number,
  buckets: Bucket[],
  pointsBalance: number,
  processedIds: Set<string>,
  now: Date,
): RedemptionResult {
  if (!isAnyBucketValid(buckets, now)) {
    return {
      walletBalance,
      buckets,
      pointsBalance,
      error: 'Vencido',
      audit: null,
    };
  }
  const total = computeAvailableCashback(buckets, now);
  if (amount <= 0 || amount > total) {
    return {
      walletBalance,
      buckets,
      pointsBalance,
      error: 'Monto inválido',
      audit: null,
    };
  }
  if (processedIds.has(redemptionId)) {
    return {
      walletBalance,
      buckets,
      pointsBalance,
      error: 'Idempotente',
      audit: null,
    };
  }
  if (amount < MIN_BLOCKCHAIN_AMOUNT) {
    const nb = deductFromBuckets(buckets, amount);
    const np = pointsBalance + amount;
    return {
      walletBalance,
      buckets: nb,
      pointsBalance: np,
      outcome: 'points',
      audit: {
        id: redemptionId,
        tipo: 'cashback->points',
        monto: amount,
        fecha: now.toISOString(),
      },
    };
  }
  const nw = walletBalance + amount;
  const nb = deductFromBuckets(buckets, amount);
  return {
    walletBalance: nw,
    buckets: nb,
    pointsBalance,
    outcome: 'wallet',
    audit: {
      id: redemptionId,
      tipo: 'cashback->wallet',
      monto: amount,
      fecha: now.toISOString(),
    },
  };
}

export function redeemPoints(
  pointsBalance: number,
  walletBalance: number,
  redemptionId: string,
  now: Date,
): RedemptionResult {
  if (pointsBalance <= 0) {
    return {
      walletBalance,
      buckets: [],
      pointsBalance,
      error: 'Sin puntos',
      audit: null,
    };
  }
  const nw = walletBalance + pointsBalance;
  return {
    walletBalance: nw,
    buckets: [],
    pointsBalance: 0,
    outcome: 'wallet',
    audit: {
      id: redemptionId,
      tipo: 'points->wallet',
      monto: pointsBalance,
      fecha: now.toISOString(),
    },
  };
}

export function getPreExpiryAlerts(
  buckets: Bucket[],
  now: Date,
  daysWindow: number = 7,
): {campaign: string; vence: string; daysLeft: number}[] {
  return buckets
    .filter(b => isBucketValid(b, now))
    .map(b => {
      const end = new Date(b.vence).getTime();
      const dl = Math.ceil((end - now.getTime()) / (1000 * 60 * 60 * 24));
      return {campaign: b.campaign, vence: b.vence, daysLeft: dl};
    })
    .filter(x => x.daysLeft >= 0 && x.daysLeft <= daysWindow)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export function expireBuckets(
  buckets: Bucket[],
  now: Date,
): {buckets: Bucket[]; expiredAudits: RedemptionAudit[]} {
  const out: Bucket[] = buckets.map(b => ({...b}));
  const expiredAudits: RedemptionAudit[] = [];
  for (const b of out) {
    const expired = !isBucketValid(b, now);
    if (expired && b.amount > 0) {
      const amt = b.amount;
      b.amount = 0;
      expiredAudits.push({
        id: `exp-${b.campaign}-${now.getTime()}`,
        tipo: 'expired',
        monto: amt,
        fecha: now.toISOString(),
      });
    }
  }
  return {buckets: out, expiredAudits};
}

type Props = {navigation?: any};

export default function CashbackScreen({navigation}: Props): React.JSX.Element {
  const [walletBalance, setWalletBalance] = useState<number>(8100);
  const [buckets, setBuckets] = useState<Bucket[]>([
    {campaign: 'Bienvenida', amount: 12000, vence: '2025-12-31'},
    {campaign: 'Global', amount: 9000, vence: '2026-03-31'},
  ]);
  const [amount, setAmount] = useState<string>('');
  const [pointsBalance, setPointsBalance] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [audit, setAudit] = useState<RedemptionAudit[]>([]);
  const processedIds = useMemo(() => new Set<string>(), []);

  const totalCashback = useMemo(
    () => computeAvailableCashback(buckets, new Date()),
    [buckets],
  );

  const alerts = useMemo(
    () => getPreExpiryAlerts(buckets, new Date(), 14),
    [buckets],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const {buckets: nb, expiredAudits} = expireBuckets(buckets, now);
      if (expiredAudits.length > 0) {
        setBuckets(nb);
        setAudit(prev => [...expiredAudits, ...prev]);
        setMessage('Se descontó cashback vencido');
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [buckets]);

  return (
    <ScrollView
      style={{flex: 1, backgroundColor: COLORS.grayBg}}
      contentContainerStyle={{paddingBottom: 24}}>
      <View
        style={{
          backgroundColor: COLORS.red,
          padding: 16,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity
            accessibilityLabel="cashback-back"
            testID="cashback-back"
            onPress={() => navigation?.goBack?.()}
            style={{padding: 4}}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={20}
              color={COLORS.white}
            />
          </TouchableOpacity>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
            <MaterialCommunityIcons
              name="ticket-percent"
              size={20}
              color={COLORS.white}
            />
            <Text style={{color: COLORS.white, fontWeight: '700'}}>
              Cashback
            </Text>
          </View>
          <View style={{width: 24}} />
        </View>
        <Text style={{color: COLORS.white, marginTop: 8}}>
          Consulta y redime tu cashback
        </Text>
      </View>

      <View
        style={{
          backgroundColor: COLORS.white,
          margin: 12,
          borderRadius: 12,
          padding: 12,
        }}>
        <Text style={{color: COLORS.mid}}>Saldo del bolsillo</Text>
        <Text style={{color: COLORS.red, fontSize: 22, fontWeight: '700'}}>
          $ {walletBalance.toLocaleString()}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: COLORS.white,
          marginHorizontal: 12,
          borderRadius: 12,
          padding: 12,
        }}>
        <Text style={{color: COLORS.mid}}>Saldo de cashback</Text>
        <Text style={{color: COLORS.green, fontSize: 22, fontWeight: '700'}}>
          $ {totalCashback.toLocaleString()}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: COLORS.white,
          margin: 12,
          borderRadius: 12,
          padding: 12,
        }}>
        <Text style={{color: COLORS.dark, fontWeight: '700'}}>
          Reglas y vigencias
        </Text>
        {buckets.map((b, i) => (
          <View
            key={`${b.campaign}-${i}`}
            style={{
              paddingVertical: 6,
              borderBottomWidth: 0.5,
              borderColor: '#E5E7EB',
            }}>
            <Text style={{color: COLORS.dark, fontWeight: '600'}}>
              {b.campaign} • $ {b.amount.toLocaleString()}
            </Text>
            <Text style={{color: COLORS.mid}}>Vence: {b.vence}</Text>
          </View>
        ))}
      </View>

      <View
        style={{
          backgroundColor: COLORS.white,
          marginHorizontal: 12,
          borderRadius: 12,
          padding: 12,
        }}>
        <Text style={{color: COLORS.dark, fontWeight: '700', marginBottom: 8}}>
          Redimir
        </Text>
        <TextInput
          value={amount}
          onChangeText={t => setAmount(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          placeholder="$ 0"
          style={{
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: COLORS.dark,
          }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.red,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            alignSelf: 'flex-start',
            marginTop: 10,
          }}
          onPress={() => {
            const amt = Number(amount.replace(/[^0-9]/g, ''));
            const id = `cb-${Date.now()}`;
            const now = new Date();
            const res = redeemCashback(
              amt,
              id,
              walletBalance,
              buckets,
              pointsBalance,
              processedIds,
              now,
            );
            if (res.error) {
              setMessage(res.error);
              return;
            }
            setBuckets(res.buckets);
            setPointsBalance(res.pointsBalance);
            if (res.outcome === 'wallet') setWalletBalance(res.walletBalance);
            if (res.audit) {
              setAudit(prev => [res.audit!, ...prev]);
              processedIds.add(res.audit.id);
            }
            setMessage(
              res.outcome === 'wallet'
                ? 'Redimido al bolsillo'
                : 'Convertido a puntos',
            );
          }}>
          <Text style={{color: COLORS.white, fontWeight: '700'}}>
            Redimir ahora
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.mid,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            alignSelf: 'flex-start',
            marginTop: 10,
          }}
          onPress={() => {
            const id = `pt-${Date.now()}`;
            const now = new Date();
            const res = redeemPoints(pointsBalance, walletBalance, id, now);
            if (res.error) {
              setMessage(res.error);
              return;
            }
            setPointsBalance(res.pointsBalance);
            setWalletBalance(res.walletBalance);
            if (res.audit) {
              setAudit(prev => [res.audit!, ...prev]);
              processedIds.add(res.audit.id);
            }
            setMessage('Puntos redimidos al bolsillo');
          }}>
          <Text style={{color: COLORS.white, fontWeight: '700'}}>
            Redimir puntos
          </Text>
        </TouchableOpacity>
        {!!message && (
          <View style={{marginTop: 8}}>
            <Text style={{color: COLORS.dark}}>{message}</Text>
          </View>
        )}
      </View>

      <View
        style={{
          backgroundColor: COLORS.white,
          margin: 12,
          borderRadius: 12,
          padding: 12,
        }}>
        <Text style={{color: COLORS.dark, fontWeight: '700'}}>Auditoría</Text>
        {audit.map(a => (
          <View
            key={a.id}
            style={{
              paddingVertical: 6,
              borderBottomWidth: 0.5,
              borderColor: '#E5E7EB',
            }}>
            <Text style={{color: COLORS.dark, fontWeight: '600'}}>
              {a.tipo}
            </Text>
            <Text style={{color: COLORS.mid}}>
              ID: {a.id} • {a.fecha} • $ {a.monto.toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{
          backgroundColor: COLORS.white,
          marginHorizontal: 12,
          borderRadius: 12,
          padding: 12,
        }}>
        <Text style={{color: COLORS.dark, fontWeight: '700'}}>
          Alertas de vencimiento
        </Text>
        {alerts.length === 0 ? (
          <Text style={{color: COLORS.mid, marginTop: 6}}>
            Sin alertas próximas
          </Text>
        ) : (
          alerts.map(al => (
            <View
              key={`${al.campaign}-${al.vence}`}
              style={{
                paddingVertical: 6,
                borderBottomWidth: 0.5,
                borderColor: '#E5E7EB',
              }}>
              <Text style={{color: COLORS.dark, fontWeight: '600'}}>
                {al.campaign}
              </Text>
              <Text style={{color: COLORS.mid}}>
                Vence en {al.daysLeft} días • {al.vence}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
