import React, {useMemo, useRef, useState} from 'react';
import {Dimensions, FlatList, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type HomeProps = {
  onOpenOtp: () => void;
};

const COLORS = {
  red: '#E31E24',
  green: '#00A859',
  blue: '#0066CC',
  fuchsia: '#E6007E',
  grayBg: '#F5F5F5',
  white: '#FFFFFF',
  dark: '#1F2937',
  mid: '#6B7280',
};

const promos = [
  {id: 'promo-1', title: 'GANA UNO DE LOS 24 MIL PREMIOS', cta: 'Participa aquí', image: 'https://images.unsplash.com/photo-1556909212-d3605369f88f?w=1200&q=50'},
  {id: 'promo-2', title: 'Colgate Promoción', cta: 'Participa aquí', image: 'https://images.unsplash.com/photo-1556228720-194720a2b490?w=1200&q=50'},
];

const points = [
  {id: 'p-1', title: '2x puntos en tienda', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=50'},
  {id: 'p-2', title: 'Bonos cafetería', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=50'},
  {id: 'p-3', title: 'Descuento lubricantes', image: 'https://images.unsplash.com/photo-1581360193516-c318e25f0363?w=800&q=50'},
];

export default function HomeScreen({onOpenOtp}: HomeProps) {
  const width = Dimensions.get('window').width;
  const bannerW = Math.min(width, 360);
  const [promoIndex, setPromoIndex] = useState(0);
  const promoRef = useRef<FlatList>(null);

  const promoIndicator = useMemo(() => promos.map((_, i) => i === promoIndex), [promoIndex]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoRow}>
              <FastImage style={styles.logo} source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Terpel_logo.png'}} resizeMode={FastImage.resizeMode.contain} />
            </View>
            <View style={styles.headerIcons}>
              <MaterialCommunityIcons name="wallet" size={24} color={COLORS.white} />
              <MaterialCommunityIcons name="bell-outline" size={24} color={COLORS.white} />
              <MaterialCommunityIcons name="dots-circle" size={24} color={COLORS.white} />
            </View>
          </View>
          <Text style={styles.greet}>¡Hola Miguel 👋!</Text>
          <TouchableOpacity onPress={onOpenOtp} style={styles.openOtpBtn}>
            <Text style={styles.openOtpText}>Abrir OTP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="coin" size={20} color="#F5B300" />
              <Text style={styles.cardTitle}>Hoy sumas</Text>
            </View>
            <Text style={[styles.cardValue, {color: COLORS.fuchsia}]}>0</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardLink}>Ver más</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.mid} />
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="wallet" size={20} color={COLORS.green} />
              <Text style={styles.cardTitle}>Mi Bolsillo</Text>
            </View>
            <Text style={[styles.cardValue, {color: COLORS.red}]}>$ 8.100</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardLink}>Ver más</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.mid} />
            </View>
          </View>
        </View>

        <View style={styles.prefCard}>
          <FastImage style={styles.prefImage} source={{uri: 'https://images.unsplash.com/photo-1515577714465-bb3b1887f23a?w=600&q=50'}} resizeMode={FastImage.resizeMode.cover} />
          <View style={styles.prefTextCol}>
            <Text style={styles.prefText}>Configura tus preferencias para ver estaciones y tiendas cerca de ti.</Text>
            <TouchableOpacity style={styles.prefBtn}><Text style={styles.prefBtnText}>📍 Configurar</Text></TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Secciones</Text>
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <View style={[styles.gridIcon, styles.gridIconGreen]}>
              <MaterialCommunityIcons name="wallet" size={24} color={COLORS.green} />
            </View>
            <Text style={styles.gridLabel}>Mi bolsillo</Text>
          </View>
          <View style={styles.gridItem}>
            <View style={[styles.gridIcon, styles.gridIconBlue]}>
              <MaterialCommunityIcons name="tools" size={24} color={COLORS.blue} />
            </View>
            <Text style={styles.gridLabel}>Aliados</Text>
          </View>
          <View style={styles.gridItem}>
            <View style={[styles.gridIcon, styles.gridIconOrange]}>
              <MaterialCommunityIcons name="shopping" size={24} color="#FF7F50" />
            </View>
            <Text style={styles.gridLabel}>Catálogo</Text>
          </View>
          <View style={styles.gridItem}>
            <View style={[styles.gridIcon, styles.gridIconBlue]}>
              <MaterialCommunityIcons name="ticket-percent" size={24} color={COLORS.blue} />
            </View>
            <Text style={styles.gridLabel}>Mis bonos</Text>
          </View>
        </View>

        <View style={styles.carouselBlock}>
          <FlatList
            ref={promoRef}
            data={promos}
            keyExtractor={i => i.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            decelerationRate="fast"
            onMomentumScrollEnd={ev => {
              const idx = Math.round(ev.nativeEvent.contentOffset.x / ev.nativeEvent.layoutMeasurement.width);
              setPromoIndex(idx);
            }}
            renderItem={({item}) => (
              <View style={[styles.banner, {width: bannerW}]}>
                <View style={styles.bannerHeader}><Text style={styles.bannerTitle}>{item.title}</Text></View>
                <FastImage style={styles.bannerImage} source={{uri: item.image}} resizeMode={FastImage.resizeMode.cover} />
                <TouchableOpacity style={styles.bannerCta}><Text style={styles.bannerCtaText}>Participa aquí</Text></TouchableOpacity>
              </View>
            )}
          />
          <View style={styles.dotsRow}>
            {promoIndicator.map((active, i) => (
              <View key={`dot-${i}`} style={[styles.dot, active ? styles.dotActive : null]} />
            ))}
          </View>
        </View>

        <View style={styles.pointsHeader}>
          <Text style={styles.sectionTitle}>Disfruta tus puntos</Text>
          <TouchableOpacity><Text style={styles.viewAll}>Ver todos</Text></TouchableOpacity>
        </View>
        <FlatList
          data={points}
          keyExtractor={i => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          renderItem={({item}) => (
            <View style={styles.pointsCard}>
              <FastImage style={styles.pointsImg} source={{uri: item.image}} resizeMode={FastImage.resizeMode.cover} />
              <Text style={styles.pointsText}>{item.title}</Text>
              <View style={styles.pointsCoin}><MaterialCommunityIcons name="coin" size={18} color="#F5B300" /></View>
              <TouchableOpacity style={styles.quickBtn}><Text style={styles.quickBtnText}>S</Text></TouchableOpacity>
            </View>
          )}
        />

        <View style={styles.bottomTabs}>
          <View style={styles.tabItemActive}><MaterialCommunityIcons name="home" size={22} color={COLORS.red} /><Text style={styles.tabLabelActive}>Inicio</Text></View>
          <View style={styles.tabItem}><MaterialCommunityIcons name="map-marker" size={22} color={COLORS.mid} /><Text style={styles.tabLabel}>Mapas</Text></View>
          <View style={styles.tabCenter}><MaterialCommunityIcons name="qrcode" size={24} color={COLORS.white} /></View>
          <View style={styles.tabItem}><MaterialCommunityIcons name="chat" size={22} color={COLORS.mid} /><Text style={styles.tabLabel}>Ayuda</Text></View>
          <View style={styles.tabItem}><MaterialCommunityIcons name="dots-horizontal" size={22} color={COLORS.mid} /><Text style={styles.tabLabel}>Más</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.grayBg},
  scroll: {flex: 1},
  content: {paddingBottom: 32},
  header: {backgroundColor: COLORS.red, paddingHorizontal: 16, paddingBottom: 16, borderBottomLeftRadius: 12, borderBottomRightRadius: 12},
  headerTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  logoRow: {flexDirection: 'row', alignItems: 'center'},
  logo: {width: 88, height: 28},
  headerIcons: {flexDirection: 'row', gap: 14},
  greet: {color: COLORS.white, fontSize: 20, fontWeight: '700', marginTop: 12},
  openOtpBtn: {alignSelf: 'flex-start', marginTop: 8, borderWidth: 1, borderColor: COLORS.white, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6},
  openOtpText: {color: COLORS.white, fontWeight: '600'},
  cardsRow: {flexDirection: 'row', gap: 12, paddingHorizontal: 12, marginTop: 12},
  card: {flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2},
  cardHeader: {flexDirection: 'row', alignItems: 'center', gap: 6},
  cardTitle: {color: COLORS.mid, fontSize: 13},
  cardValue: {fontSize: 22, fontWeight: '700', marginTop: 8},
  cardFooter: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6},
  cardLink: {color: COLORS.mid, fontSize: 12},
  prefCard: {flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 12, marginHorizontal: 12, marginTop: 16, padding: 12, gap: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2},
  prefImage: {width: 80, height: 80, borderRadius: 12},
  prefTextCol: {flex: 1, justifyContent: 'center'},
  prefText: {color: COLORS.dark, fontSize: 14, lineHeight: 20},
  prefBtn: {borderWidth: 1, borderColor: COLORS.mid, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start', marginTop: 10},
  prefBtnText: {color: COLORS.dark, fontWeight: '600'},
  sectionTitle: {color: COLORS.dark, fontSize: 18, fontWeight: '700', paddingHorizontal: 16, marginTop: 16},
  gridRow: {flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 12},
  gridItem: {alignItems: 'center', width: (Dimensions.get('window').width - 32 - 36) / 4},
  gridIcon: {width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center'},
  gridIconGreen: {backgroundColor: '#E8FFF3'},
  gridIconBlue: {backgroundColor: '#E6F2FF'},
  gridIconOrange: {backgroundColor: '#FFF5E6'},
  gridLabel: {marginTop: 6, color: COLORS.dark, fontSize: 12},
  carouselBlock: {marginTop: 12, alignItems: 'center'},
  banner: {backgroundColor: COLORS.white, borderRadius: 12, overflow: 'hidden', marginHorizontal: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2},
  bannerHeader: {paddingHorizontal: 12, paddingTop: 12},
  bannerTitle: {color: COLORS.blue, fontWeight: '700'},
  bannerImage: {width: '100%', height: 140},
  bannerCta: {backgroundColor: COLORS.red, borderRadius: 8, alignSelf: 'flex-start', margin: 12, paddingHorizontal: 12, paddingVertical: 10},
  bannerCtaText: {color: COLORS.white, fontWeight: '700'},
  dotsRow: {flexDirection: 'row', gap: 6, marginTop: 8},
  dot: {width: 6, height: 6, borderRadius: 3, backgroundColor: '#CBD5E1'},
  dotActive: {backgroundColor: COLORS.red},
  pointsHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 20},
  viewAll: {color: COLORS.blue, fontWeight: '600'},
  pointsCard: {backgroundColor: COLORS.white, borderRadius: 12, overflow: 'hidden', marginHorizontal: 12, width: Dimensions.get('window').width - 24, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2},
  pointsImg: {width: '100%', height: 120},
  pointsText: {color: COLORS.dark, fontWeight: '600', paddingHorizontal: 12, paddingVertical: 10},
  pointsCoin: {position: 'absolute', top: 8, right: 12, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 14, padding: 6},
  quickBtn: {position: 'absolute', bottom: -16, right: 24, width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.red, alignItems: 'center', justifyContent: 'center'},
  quickBtnText: {color: COLORS.white, fontWeight: '700'},
  bottomTabs: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 10, marginTop: 32},
  tabItem: {alignItems: 'center'},
  tabItemActive: {alignItems: 'center'},
  tabLabel: {fontSize: 11, color: COLORS.mid, marginTop: 4},
  tabLabelActive: {fontSize: 11, color: COLORS.red, fontWeight: '700', marginTop: 4},
  tabCenter: {width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.red, alignItems: 'center', justifyContent: 'center'},
});

export {};
