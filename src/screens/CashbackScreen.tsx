import React, {useMemo, useState} from 'react';
import {ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../constants/HomeConstants';

type Bucket = {campaign: string; amount: number; vence: string};

export default function CashbackScreen(): React.JSX.Element {
  const [walletBalance] = useState<number>(8100);
  const [buckets] = useState<Bucket[]>([
    {campaign: 'Bienvenida', amount: 10000, vence: '2025-12-31'},
    {campaign: 'Global', amount: 8500, vence: '2026-03-31'},
  ]);
  const [amount, setAmount] = useState<string>('');

  const totalCashback = useMemo(
    () => buckets.reduce((sum, b) => sum + Math.max(0, b.amount), 0),
    [buckets],
  );

  return (
    <ScrollView style={{flex: 1, backgroundColor: COLORS.grayBg}} contentContainerStyle={{paddingBottom: 24}}>
      <View style={{backgroundColor: COLORS.red, padding: 16, borderBottomLeftRadius: 12, borderBottomRightRadius: 12}}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          <MaterialCommunityIcons name="ticket-percent" size={20} color={COLORS.white} />
          <Text style={{color: COLORS.white, fontWeight: '700'}}>Cashback</Text>
        </View>
        <Text style={{color: COLORS.white, marginTop: 8}}>Consulta y redime tu cashback</Text>
      </View>

      <View style={{backgroundColor: COLORS.white, margin: 12, borderRadius: 12, padding: 12}}>
        <Text style={{color: COLORS.mid}}>Saldo del bolsillo</Text>
        <Text style={{color: COLORS.red, fontSize: 22, fontWeight: '700'}}>$ {walletBalance.toLocaleString()}</Text>
      </View>

      <View style={{backgroundColor: COLORS.white, marginHorizontal: 12, borderRadius: 12, padding: 12}}>
        <Text style={{color: COLORS.mid}}>Saldo de cashback</Text>
        <Text style={{color: COLORS.green, fontSize: 22, fontWeight: '700'}}>$ {totalCashback.toLocaleString()}</Text>
      </View>

      <View style={{backgroundColor: COLORS.white, margin: 12, borderRadius: 12, padding: 12}}>
        <Text style={{color: COLORS.dark, fontWeight: '700'}}>Reglas y vigencias</Text>
        {buckets.map((b, i) => (
          <View key={`${b.campaign}-${i}`} style={{paddingVertical: 6, borderBottomWidth: 0.5, borderColor: '#E5E7EB'}}>
            <Text style={{color: COLORS.dark, fontWeight: '600'}}>
              {b.campaign} • $ {b.amount.toLocaleString()}
            </Text>
            <Text style={{color: COLORS.mid}}>Vence: {b.vence}</Text>
          </View>
        ))}
      </View>

      <View style={{backgroundColor: COLORS.white, marginHorizontal: 12, borderRadius: 12, padding: 12}}>
        <Text style={{color: COLORS.dark, fontWeight: '700', marginBottom: 8}}>Redimir</Text>
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
          }}>
          <Text style={{color: COLORS.white, fontWeight: '700'}}>Redimir ahora</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

