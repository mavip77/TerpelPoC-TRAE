/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import OtpModal from './src/components/OtpModal';
import CashbackScreen from './src/screens/CashbackScreen';
import HomeScreen from './src/screens/HomeScreen';
import MiBolsillo from './src/screens/MiBolsillo';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  const [seedCode, setSeedCode] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [signature, setSignature] = useState<string | undefined>(undefined);

  useEffect(() => {
    let remove: (() => void) | undefined;
    async function initSms() {
      if (Platform.OS !== 'android') {
        return;
      }
      try {
        const mod = await import(
          /* webpackChunkName: "otp-verify" */
          'react-native-otp-verify'
        );
        try {
          const hashes: string[] = await mod.getHash();
          if (hashes && hashes.length > 0) {
            setSignature(hashes[0]);
          }
        } catch {}
        remove = await mod.startOtpListener((message: string) => {
          const match = message.match(/(?:^|\D)(\d{6})(?:\D|$)/);
          if (match && match[1]) {
            setSeedCode(match[1]);
          }
        });
      } catch (e) {
        // no-op
      }
    }
    initSms();
    return () => {
      remove?.();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={'dark-content'} />
      <View style={styles.container}>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{headerShown: false}}>
              <Stack.Screen name="Home">
                {props => (
                  <HomeScreen
                    onOpenOtp={() => setModalVisible(true)}
                    navigation={props.navigation}
                    isOtpVisible={modalVisible}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="MiBolsillo" component={MiBolsillo as any} />
              <Stack.Screen name="Cashback" component={CashbackScreen as any} />
              <Stack.Screen name="Inbox" component={require('./src/screens/InboxScreen').default} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
        {Platform.OS === 'android' ? (
          <Text style={styles.signature}>
            Hash de app: {signature ?? '...'}
          </Text>
        ) : null}
        <OtpModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          seedCode={seedCode}
          onVerify={mockValidateOtp}
        />
      </View>
    </SafeAreaView>
  );
}

async function mockValidateOtp(code: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 600));
  return (
    code.length >= MIN_LEN &&
    code.length <= MAX_LEN &&
    /^[0-9]{4,8}$/.test(code)
  );
}

const MIN_LEN = 4;
const MAX_LEN = 8;

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#f6f8fa'},
  container: {flex: 1},
  signature: {
    position: 'absolute',
    top: 8,
    left: 12,
    fontSize: 12,
    color: '#57606a',
  },
});

export default App;
