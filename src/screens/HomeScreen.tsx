import React, {useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
// @ts-ignore
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS, promos, points} from '../constants/HomeConstants';
import {homeStyles as styles} from '../styles/HomeStyles';

type HomeProps = {
  onOpenOtp: () => void;
  navigation?: any;
  onNavigateMiBolsillo?: () => void;
  isOtpVisible?: boolean;
};

export default function HomeScreen({
  onOpenOtp,
  onNavigateMiBolsillo,
  navigation,
  isOtpVisible,
}: HomeProps) {
  const width = Dimensions.get('window').width;
  const bannerW = Math.min(width, 360);
  const [promoIndex, setPromoIndex] = useState(0);
  const promoRef = useRef<FlatList>(null);
  const [openingOtp, setOpeningOtp] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const promoIndicator = useMemo(
    () => promos.map((_, i) => i === promoIndex),
    [promoIndex],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoRow}>
              <FastImage
                style={styles.logo}
                source={{
                  uri: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Terpel_logo.png',
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
            <View style={styles.headerIcons}>
              <MaterialCommunityIcons
                name="wallet"
                size={24}
                color={COLORS.white}
              />
              <MaterialCommunityIcons
                name="bell-outline"
                size={24}
                color={COLORS.white}
              />
              <MaterialCommunityIcons
                name="dots-circle"
                size={24}
                color={COLORS.white}
              />
            </View>
          </View>
          <Text style={styles.greet}>¡Hola Miguel 👋!</Text>
          <TouchableOpacity
            accessibilityLabel="open-otp"
            testID="open-otp"
            accessibilityRole="button"
            accessible
            onPress={() => {
              if (openingOtp || isOtpVisible) {
                return;
              }
              Animated.spring(scale, {
                toValue: 0.98,
                useNativeDriver: true,
                speed: 20,
                bounciness: 2,
              }).start();
              setOpeningOtp(true);
              onOpenOtp();
              setTimeout(() => setOpeningOtp(false), 400);
            }}
            onPressOut={() => {
              Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 20,
                bounciness: 2,
              }).start();
            }}
            style={styles.openOtpBtn}
            disabled={openingOtp || !!isOtpVisible}>
            <Animated.View style={{transform: [{scale}]}}>
              {openingOtp ? (
                <View style={styles.spinnerRow}>
                  <ActivityIndicator size="small" color={COLORS.white} />
                  <Text style={styles.openOtpText}>Abriendo...</Text>
                </View>
              ) : (
                <Text style={styles.openOtpText}>Abrir OTP</Text>
              )}
            </Animated.View>
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
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={COLORS.mid}
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={
              onNavigateMiBolsillo ??
              (() => navigation?.navigate?.('MiBolsillo'))
            }>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="wallet"
                size={20}
                color={COLORS.green}
              />
              <Text style={styles.cardTitle}>Mi Bolsillo</Text>
            </View>
            <Text style={[styles.cardValue, {color: COLORS.red}]}>$ 8.100</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardLink}>Ver más</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={COLORS.mid}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => navigation?.navigate?.('Cashback')}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="ticket-percent"
                size={20}
                color={COLORS.fuchsia}
              />
              <Text style={styles.cardTitle}>Cashback</Text>
            </View>
            <Text style={[styles.cardValue, {color: COLORS.green}]}>$ 18.500</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardLink}>Ver más</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={COLORS.mid}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.prefCard}>
          <FastImage
            style={styles.prefImage}
            source={{
              uri: 'https://images.unsplash.com/photo-1515577714465-bb3b1887f23a?w=600&q=50',
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={styles.prefTextCol}>
            <Text style={styles.prefText}>
              Configura tus preferencias para ver estaciones y tiendas cerca de
              ti.
            </Text>
            <TouchableOpacity style={styles.prefBtn}>
              <Text style={styles.prefBtnText}>📍 Configurar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Secciones</Text>
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <View style={[styles.gridIcon, styles.gridIconGreen]}>
              <MaterialCommunityIcons
                name="wallet"
                size={24}
                color={COLORS.green}
              />
            </View>
            <Text style={styles.gridLabel}>Mi bolsillo</Text>
          </View>
          <View style={styles.gridItem}>
            <View style={[styles.gridIcon, styles.gridIconBlue]}>
              <MaterialCommunityIcons
                name="tools"
                size={24}
                color={COLORS.blue}
              />
            </View>
            <Text style={styles.gridLabel}>Aliados</Text>
          </View>
          <View style={styles.gridItem}>
            <View style={[styles.gridIcon, styles.gridIconOrange]}>
              <MaterialCommunityIcons
                name="shopping"
                size={24}
                color="#FF7F50"
              />
            </View>
            <Text style={styles.gridLabel}>Catálogo</Text>
          </View>
          <View style={styles.gridItem}>
            <View style={[styles.gridIcon, styles.gridIconBlue]}>
              <MaterialCommunityIcons
                name="ticket-percent"
                size={24}
                color={COLORS.blue}
              />
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
              const idx = Math.round(
                ev.nativeEvent.contentOffset.x /
                  ev.nativeEvent.layoutMeasurement.width,
              );
              setPromoIndex(idx);
            }}
            renderItem={({item}) => (
              <View style={[styles.banner, {width: bannerW}]}>
                <View style={styles.bannerHeader}>
                  <Text style={styles.bannerTitle}>{item.title}</Text>
                </View>
                <FastImage
                  style={styles.bannerImage}
                  source={{uri: item.image}}
                  resizeMode={FastImage.resizeMode.cover}
                />
                <TouchableOpacity style={styles.bannerCta}>
                  <Text style={styles.bannerCtaText}>Participa aquí</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <View style={styles.dotsRow}>
            {promoIndicator.map((active, i) => (
              <View
                key={`dot-${i}`}
                style={[styles.dot, active ? styles.dotActive : null]}
              />
            ))}
          </View>
        </View>

        <View style={styles.pointsHeader}>
          <Text style={styles.sectionTitle}>Disfruta tus puntos</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={points}
          keyExtractor={i => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          renderItem={({item}) => (
            <View style={styles.pointsCard}>
              <FastImage
                style={styles.pointsImg}
                source={{uri: item.image}}
                resizeMode={FastImage.resizeMode.cover}
              />
              <Text style={styles.pointsText}>{item.title}</Text>
              <View style={styles.pointsCoin}>
                <MaterialCommunityIcons name="coin" size={18} color="#F5B300" />
              </View>
              <TouchableOpacity style={styles.quickBtn}>
                <Text style={styles.quickBtnText}>S</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <View style={styles.bottomTabs}>
          <View style={styles.tabItemActive}>
            <MaterialCommunityIcons name="home" size={22} color={COLORS.red} />
            <Text style={styles.tabLabelActive}>Inicio</Text>
          </View>
          <View style={styles.tabItem}>
            <MaterialCommunityIcons
              name="map-marker"
              size={22}
              color={COLORS.mid}
            />
            <Text style={styles.tabLabel}>Mapas</Text>
          </View>
          <View style={styles.tabCenter}>
            <MaterialCommunityIcons
              name="qrcode"
              size={24}
              color={COLORS.white}
            />
          </View>
          <View style={styles.tabItem}>
            <MaterialCommunityIcons name="chat" size={22} color={COLORS.mid} />
            <Text style={styles.tabLabel}>Ayuda</Text>
          </View>
          <View style={styles.tabItem}>
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={22}
              color={COLORS.mid}
            />
            <Text style={styles.tabLabel}>Más</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export {};
