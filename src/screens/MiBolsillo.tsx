import React, {useEffect, useMemo, useState} from 'react';
import {Alert, FlatList, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import * as Keychain from 'react-native-keychain';

type Props = {
  navigation: any;
};

const COLORS = {
  red: '#E31E24',
  green: '#00A859',
  blue: '#0066CC',
  grayBg: '#F5F5F5',
  white: '#FFFFFF',
  dark: '#1F2937',
  mid: '#6B7280',
};

export default function MiBolsillo({navigation}: Props) {
  const [tab, setTab] = useState<'recargar' | 'transferir' | 'movimientos'>('transferir');
  const [saldo, setSaldo] = useState<number>(8100);
  const [docType, setDocType] = useState<'CC' | 'CE' | undefined>(undefined);
  const [docNumber, setDocNumber] = useState<string>('');
  const [monto, setMonto] = useState<string>('');
  const [recarga, setRecarga] = useState<string>('');
  const [beneficiosOpen, setBeneficiosOpen] = useState<boolean>(true);
  const [detailOpen, setDetailOpen] = useState<boolean>(false);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [recipientName, setRecipientName] = useState<string>('');

  type Favorito = {name: string; docType: 'CC' | 'CE'; docNumber: string};
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [favListOpen, setFavListOpen] = useState<boolean>(false);
  const [favConfirmOpen, setFavConfirmOpen] = useState<boolean>(false);
  const [selectedFav, setSelectedFav] = useState<Favorito | null>(null);
  const [favAmount, setFavAmount] = useState<string>('');

  const montoNum = useMemo(() => {
    const n = Number(String(monto).replace(/[^0-9]/g, ''));
    return isNaN(n) ? 0 : n;
  }, [monto]);

  const docValid = useMemo(() => {
    const t = docType;
    const v = String(docNumber).replace(/\D/g, '');
    if (!t) {
      return false;
    }
    if (t === 'CC') {
      return v.length >= 6 && v.length <= 10;
    }
    if (t === 'CE') {
      return v.length >= 6 && v.length <= 12;
    }
    return false;
  }, [docType, docNumber]);

  const canSend = docValid && montoNum > 0 && montoNum < saldo;

  const trySend = () => {
    if (montoNum >= saldo) {
      Alert.alert('Saldo insuficiente', 'El valor a transferir no puede ser superior al saldo del bolsillo');
      return;
    }
    if (!canSend) {
      return;
    }
    const snapshot = {name: recipientName.trim(), docType: docType!, docNumber: docNumber};
    Alert.alert('Transferencia enviada', `Se transfirieron $ ${montoNum.toLocaleString('es-CO')} a documento ${docType}-${docNumber}`);
    setSaldo(s => s - montoNum);
    Alert.alert(
      '¿Agregar a favoritos?',
      snapshot.name ? `¿Deseas agregar a ${snapshot.name} (${snapshot.docType}-${snapshot.docNumber}) como favorito?` : `¿Deseas agregar el destinatario (${snapshot.docType}-${snapshot.docNumber}) como favorito?`,
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Agregar',
          onPress: async () => {
            try {
              const list = await loadFavoritos();
              const exists = list.some(f => f.docType === snapshot.docType && f.docNumber === snapshot.docNumber);
              const next = exists ? list.map(f => (f.docType === snapshot.docType && f.docNumber === snapshot.docNumber ? {name: snapshot.name || f.name, docType: f.docType, docNumber: f.docNumber} : f)) : [...list, {name: snapshot.name || 'Sin nombre', docType: snapshot.docType, docNumber: snapshot.docNumber}];
              await saveFavoritos(next);
              setFavoritos(next);
              Alert.alert('Favorito guardado', 'El destinatario fue agregado a tus favoritos.');
            } catch (e) {
              Alert.alert('Error', 'No se pudo guardar el favorito.');
            }
          },
        },
      ],
    );
    setDocType(undefined);
    setDocNumber('');
    setRecipientName('');
    setMonto('');
  };

  const recargaNum = useMemo(() => {
    const n = Number(String(recarga).replace(/[^0-9]/g, ''));
    return isNaN(n) ? 0 : n;
  }, [recarga]);

  const canRecargar = recargaNum >= 20000;

  const txs = useMemo(() => {
    return [
      {id: 't1', type: 'credit', title: 'Transferencia', partner: 'Aldemar Parra', amount: 1000, date: '2025-07-04'},
      {id: 't2', type: 'debit', title: 'Transferencia', partner: 'Aldemar Parra', amount: -2000, date: '2025-04-22'},
      {id: 't3', type: 'credit', title: 'Transferencia', partner: 'Aldemar Parra', amount: 2000, date: '2025-04-15'},
    ];
  }, []);

  const loadFavoritos = async (): Promise<Favorito[]> => {
    try {
      const creds = await Keychain.getGenericPassword({service: 'favorites'});
      if (!creds) return [];
      const raw = creds.password;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch {
      return [];
    }
  };

  const saveFavoritos = async (list: Favorito[]) => {
    const json = JSON.stringify(list);
    await Keychain.setGenericPassword('favorites', json, {service: 'favorites'});
  };

  useEffect(() => {
    (async () => {
      try {
        const creds = await Keychain.getGenericPassword({service: 'favorites'});
        if (creds) {
          const parsed = JSON.parse(creds.password);
          if (Array.isArray(parsed)) {
            setFavoritos(parsed);
          }
        }
      } catch {}
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Bolsillo Terpel</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={{paddingBottom: 24}}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="wallet" size={18} color={COLORS.green} />
            <Text style={styles.summaryLabel}>Saldo disponible</Text>
            <Text style={styles.summaryValue}>$ {saldo.toLocaleString('es-CO')}</Text>
          </View>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="coin" size={18} color="#F5B300" />
            <Text style={styles.summaryLabel}>Cashback acumulado</Text>
            <Text style={styles.summaryValue}>$ 0</Text>
          </View>
        </View>

        <View style={styles.tabsRow}>
          <TouchableOpacity style={[styles.tabBtn, tab === 'recargar' ? styles.tabActive : null]} onPress={() => setTab('recargar')}>
            <Text style={[styles.tabText, tab === 'recargar' ? styles.tabTextActive : null]}>Recargar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'transferir' ? styles.tabActive : null]} onPress={() => setTab('transferir')}>
            <Text style={[styles.tabText, tab === 'transferir' ? styles.tabTextActive : null]}>Transferir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'movimientos' ? styles.tabActive : null]} onPress={() => setTab('movimientos')}>
            <Text style={[styles.tabText, tab === 'movimientos' ? styles.tabTextActive : null]}>Transacciones</Text>
          </TouchableOpacity>
        </View>

        {tab === 'transferir' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Transferir saldo</Text>
            <Text style={styles.balanceText}>Saldo: $ {saldo.toLocaleString('es-CO')}</Text>

            <Text style={styles.label}>Nombre del destinatario</Text>
            <TextInput
              style={styles.input}
              value={recipientName}
              onChangeText={t => setRecipientName(t)}
              placeholder="Ingresa el nombre"
            />

            <Text style={styles.label}>Tipo de documento</Text>
            <View style={styles.comboRow}>
              <TouchableOpacity style={[styles.comboItem, docType === 'CC' ? styles.comboActive : null]} onPress={() => setDocType('CC')}>
                <Text style={[styles.comboText, docType === 'CC' ? styles.comboTextActive : null]}>CC</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.comboItem, docType === 'CE' ? styles.comboActive : null]} onPress={() => setDocType('CE')}>
                <Text style={[styles.comboText, docType === 'CE' ? styles.comboTextActive : null]}>CE</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Número de documento</Text>
            <TextInput
              style={styles.input}
              value={docNumber}
              onChangeText={t => setDocNumber(t.replace(/\D/g, ''))}
              keyboardType="number-pad"
              maxLength={12}
              placeholder="Ingresa el documento"
            />
            <Text style={[styles.hint, docValid ? styles.hintOk : styles.hintError]}>{docValid ? 'Documento válido' : 'Ingresa un documento válido'}</Text>

            <Text style={styles.label}>Monto a transferir</Text>
            <TextInput
              style={styles.input}
              value={monto}
              onChangeText={t => setMonto(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="$ 0"
            />
            <Text style={styles.hint}>Debe ser menor al saldo disponible</Text>

            <TouchableOpacity
              disabled={!canSend}
              onPress={trySend}
              style={[styles.primaryBtn, !canSend ? styles.primaryBtnDisabled : null]}>
              <Text style={styles.primaryBtnText}>Enviar para realizar la transferencia</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={favoritos.length === 0}
              onPress={() => setFavListOpen(true)}
              style={[styles.secondaryBtn, favoritos.length === 0 ? styles.secondaryBtnDisabled : null]}
            >
              <MaterialCommunityIcons name="star" size={18} color={favoritos.length === 0 ? '#9CA3AF' : COLORS.red} />
              <Text style={[styles.secondaryBtnText, favoritos.length === 0 ? styles.secondaryBtnTextDisabled : null]}>Enviar a favoritos</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {tab === 'recargar' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ingresa el monto a recargar</Text>
            <Text style={styles.hint}>Monto mínimo de recarga: $20.000</Text>

            <View style={styles.presetsRow}>
              {['150000', '200000', '350000'].map(v => (
                <TouchableOpacity key={v} style={[styles.presetBtn, recarga === v ? styles.presetActive : null]} onPress={() => setRecarga(v)}>
                  <Text style={[styles.presetText, recarga === v ? styles.presetTextActive : null]}>$ {Number(v).toLocaleString('es-CO')}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              value={recarga}
              onChangeText={t => setRecarga(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="$ 0"
            />

            <View style={styles.amountBadge}><Text style={styles.amountBadgeText}>$ {recargaNum.toLocaleString('es-CO')}</Text></View>

            <TouchableOpacity onPress={() => setBeneficiosOpen(o => !o)} style={styles.collapseHeader}>
              <Text style={styles.cardTitle}>¿Cómo funciona el porcentaje de beneficios?</Text>
              <MaterialCommunityIcons name={beneficiosOpen ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.mid} />
            </TouchableOpacity>
            {beneficiosOpen ? (
              <View style={styles.tableBox}>
                <View style={styles.tableHeader}><Text style={styles.tableCellHead}>Recarga desde</Text><Text style={styles.tableCellHead}>Hasta</Text><Text style={styles.tableCellHead}>% Beneficio</Text></View>
                {[
                  ['20000', '299999', '0.00%'],
                  ['300000', '499999', '0.50%'],
                  ['500000', '999999', '0.75%'],
                  ['1000000', '2000000', '1.00%'],
                ].map((r, i) => (
                  <View key={`row-${i}`} style={styles.tableRow}><Text style={styles.tableCell}>$ {Number(r[0]).toLocaleString('es-CO')}</Text><Text style={styles.tableCell}>$ {Number(r[1]).toLocaleString('es-CO')}</Text><Text style={styles.tableCell}>{r[2]}</Text></View>
                ))}
                <Text style={styles.hint}>Dependiendo del valor de tu recarga recibirás un porcentaje de beneficio hasta 1,00%.</Text>
              </View>
            ) : null}

            <TouchableOpacity disabled={!canRecargar} style={[styles.primaryBtn, !canRecargar ? styles.primaryBtnDisabled : null]}>
              <Text style={styles.primaryBtnText}>Recargar con PSE</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {tab === 'movimientos' ? (
          <View style={styles.card}>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>Ordenar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>Filtrar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.actionIcon}><MaterialCommunityIcons name="download" size={18} color={COLORS.mid} /></TouchableOpacity>
            </View>
            <FlatList
              data={txs}
              keyExtractor={i => i.id}
              renderItem={({item}) => (
                <TouchableOpacity style={styles.txItem} onPress={() => {setSelectedTx(item); setDetailOpen(true);}}>
                  <View style={styles.txIcon}>{item.type === 'credit' ? <MaterialCommunityIcons name="arrow-up" size={16} color={COLORS.green} /> : <MaterialCommunityIcons name="arrow-down" size={16} color={COLORS.red} />}</View>
                  <View style={styles.txBody}><Text style={styles.txTitle}>Transferencia</Text><Text style={styles.txSub}>{item.partner}</Text></View>
                  <View style={styles.txMeta}><Text style={styles.txDate}>{new Date(item.date).toLocaleDateString('es-CO', {day: 'numeric', month: 'short', year: 'numeric'})}</Text><Text style={[styles.txAmount, item.amount > 0 ? styles.txAmountPlus : styles.txAmountMinus]}>{item.amount > 0 ? `+ ${item.amount.toLocaleString('es-CO')}` : `- ${Math.abs(item.amount).toLocaleString('es-CO')}`}</Text></View>
                </TouchableOpacity>
              )}
            />
          </View>
        ) : null}

        <Modal isVisible={detailOpen} style={styles.modal} onBackdropPress={() => setDetailOpen(false)} swipeDirection="down" onSwipeComplete={() => setDetailOpen(false)} backdropOpacity={0.5} animationIn="slideInUp" animationOut="slideOutDown">
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.cardTitle}>Transferencia</Text>
              <TouchableOpacity onPress={() => setDetailOpen(false)}><MaterialCommunityIcons name="close" size={20} color={COLORS.mid} /></TouchableOpacity>
            </View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Estado</Text><Text style={[styles.detailValue, {color: COLORS.green}]}>Aprobada</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>N° de transacción</Text><Text style={styles.detailValue}>70058e…</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Fecha y hora</Text><Text style={styles.detailValue}>{selectedTx ? new Date(selectedTx.date).toLocaleString('es-CO') : ''}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Valor transferido</Text><Text style={styles.detailValue}>{selectedTx ? `$ ${Math.abs(selectedTx.amount).toLocaleString('es-CO')}` : ''}</Text></View>
            <TouchableOpacity style={styles.supportBtn}><MaterialCommunityIcons name="whatsapp" size={18} color={COLORS.red} /><Text style={styles.supportText}>Chat de soporte</Text></TouchableOpacity>
          </View>
        </Modal>

        <Modal isVisible={favListOpen} style={styles.modal} onBackdropPress={() => setFavListOpen(false)} swipeDirection="down" onSwipeComplete={() => setFavListOpen(false)} backdropOpacity={0.5} animationIn="slideInUp" animationOut="slideOutDown">
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.cardTitle}>Tus favoritos</Text>
              <TouchableOpacity onPress={() => setFavListOpen(false)}><MaterialCommunityIcons name="close" size={20} color={COLORS.mid} /></TouchableOpacity>
            </View>
            {favoritos.length === 0 ? (
              <Text style={styles.hint}>No tienes favoritos registrados.</Text>
            ) : (
              <FlatList
                data={favoritos}
                keyExtractor={(i, idx) => `${i.docType}-${i.docNumber}-${idx}`}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.favItem}
                    onPress={() => {
                      setSelectedFav(item);
                      setFavAmount('');
                      setFavListOpen(false);
                      setFavConfirmOpen(true);
                    }}
                  >
                    <View style={styles.favIcon}><MaterialCommunityIcons name="account" size={18} color={COLORS.mid} /></View>
                    <View style={{flex: 1, marginLeft: 10}}>
                      <Text style={styles.txTitle}>{item.name}</Text>
                      <Text style={styles.txSub}>{item.docType}-{item.docNumber}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.mid} />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </Modal>

        <Modal isVisible={favConfirmOpen} style={styles.modal} onBackdropPress={() => setFavConfirmOpen(false)} swipeDirection="down" onSwipeComplete={() => setFavConfirmOpen(false)} backdropOpacity={0.5} animationIn="slideInUp" animationOut="slideOutDown">
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.cardTitle}>Confirmar transferencia</Text>
              <TouchableOpacity onPress={() => setFavConfirmOpen(false)}><MaterialCommunityIcons name="close" size={20} color={COLORS.mid} /></TouchableOpacity>
            </View>
            {selectedFav ? (
              <>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Destinatario</Text><Text style={styles.detailValue}>{selectedFav.name}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Documento</Text><Text style={styles.detailValue}>{selectedFav.docType}-{selectedFav.docNumber}</Text></View>
                <Text style={[styles.label, {marginTop: 16}]}>Monto a transferir</Text>
                <TextInput
                  style={styles.input}
                  value={favAmount}
                  onChangeText={t => setFavAmount(t.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  placeholder="$ 0"
                />
                <TouchableOpacity
                  disabled={Number(favAmount || '0') <= 0 || Number(favAmount || '0') >= saldo}
                  style={[styles.primaryBtn, Number(favAmount || '0') <= 0 || Number(favAmount || '0') >= saldo ? styles.primaryBtnDisabled : null]}
                  onPress={() => {
                    const val = Number(String(favAmount).replace(/[^0-9]/g, ''));
                    if (val <= 0 || val >= saldo) return;
                    setSaldo(s => s - val);
                    setFavConfirmOpen(false);
                    Alert.alert('Transferencia enviada', `Se transfirieron $ ${val.toLocaleString('es-CO')} a ${selectedFav.name}`);
                    setTab('transferir');
                  }}
                >
                  <Text style={styles.primaryBtnText}>Confirmar</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.grayBg},
  header: {backgroundColor: COLORS.red, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center'},
  backBtn: {marginRight: 8},
  headerTitle: {color: COLORS.white, fontSize: 18, fontWeight: '700'},
  scroll: {flex: 1},
  summaryRow: {flexDirection: 'row', justifyContent: 'space-between', margin: 16},
  summaryItem: {flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 12, marginHorizontal: 6, alignItems: 'flex-start', gap: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2},
  summaryLabel: {color: COLORS.mid, fontSize: 12},
  summaryValue: {color: COLORS.red, fontWeight: '700', fontSize: 16},
  tabsRow: {flexDirection: 'row', marginHorizontal: 16, gap: 8},
  tabBtn: {flex: 1, backgroundColor: COLORS.white, borderRadius: 999, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB'},
  tabActive: {borderColor: COLORS.red},
  tabText: {color: COLORS.mid, fontWeight: '600'},
  tabTextActive: {color: COLORS.red},
  card: {backgroundColor: COLORS.white, margin: 16, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2},
  cardTitle: {color: COLORS.dark, fontSize: 16, fontWeight: '700'},
  balanceText: {color: COLORS.green, fontWeight: '700', marginTop: 6},
  label: {color: COLORS.dark, marginTop: 14, fontWeight: '600'},
  comboRow: {flexDirection: 'row', gap: 8, marginTop: 8},
  comboItem: {flex: 0, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB'},
  comboActive: {borderColor: COLORS.red, backgroundColor: COLORS.white},
  comboText: {color: COLORS.mid, fontWeight: '600'},
  comboTextActive: {color: COLORS.red},
  input: {borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginTop: 8},
  hint: {fontSize: 12, color: COLORS.mid, marginTop: 6},
  hintOk: {color: COLORS.green},
  hintError: {color: COLORS.red},
  primaryBtn: {marginTop: 20, height: 48, backgroundColor: COLORS.red, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  primaryBtnDisabled: {backgroundColor: '#FCA5A5'},
  primaryBtnText: {color: COLORS.white, fontWeight: '700'},
  secondaryBtn: {marginTop: 12, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8},
  secondaryBtnDisabled: {borderColor: '#E5E7EB', backgroundColor: '#F9FAFB'},
  secondaryBtnText: {color: COLORS.red, fontWeight: '700'},
  secondaryBtnTextDisabled: {color: '#9CA3AF'},
  presetsRow: {flexDirection: 'row', gap: 8, marginTop: 12},
  presetBtn: {borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F9FAFB'},
  presetActive: {borderColor: COLORS.red, backgroundColor: COLORS.white},
  presetText: {color: COLORS.mid, fontWeight: '600'},
  presetTextActive: {color: COLORS.red},
  amountBadge: {height: 40, borderRadius: 8, backgroundColor: '#FFF5F5', alignItems: 'center', justifyContent: 'center', marginTop: 12},
  amountBadgeText: {color: COLORS.red, fontWeight: '700'},
  collapseHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16},
  tableBox: {borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginTop: 8},
  tableHeader: {flexDirection: 'row', justifyContent: 'space-between'},
  tableRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 6},
  tableCellHead: {color: COLORS.mid, fontWeight: '700'},
  tableCell: {color: COLORS.dark},
  actionsRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  actionBtn: {borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.white},
  actionText: {color: COLORS.mid, fontWeight: '600'},
  actionIcon: {borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 8, backgroundColor: COLORS.white},
  txItem: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9'},
  txIcon: {width: 28, height: 28, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center'},
  txBody: {flex: 1, marginLeft: 10},
  txTitle: {color: COLORS.dark, fontWeight: '700'},
  txSub: {color: COLORS.mid},
  txMeta: {alignItems: 'flex-end'},
  txDate: {color: COLORS.mid, fontSize: 12},
  txAmount: {marginTop: 4, fontWeight: '700'},
  txAmountPlus: {color: COLORS.green},
  txAmountMinus: {color: COLORS.red},
  modal: {justifyContent: 'flex-end', margin: 0},
  sheet: {backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16},
  sheetHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  detailRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12},
  detailLabel: {color: COLORS.dark},
  detailValue: {color: COLORS.dark, fontWeight: '600'},
  supportBtn: {flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, marginTop: 16},
  supportText: {color: COLORS.red, fontWeight: '700'},
  favItem: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9'},
  favIcon: {width: 28, height: 28, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center'},
});