/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {Platform, SafeAreaView, StatusBar, StyleSheet, View} from 'react-native';
import OtpModal from './src/components/OtpModal';
import HomeScreen from './src/screens/HomeScreen';

function App(): React.JSX.Element {
  const [seedCode, setSeedCode] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState<boolean>(true);

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
        // getHash can be used if needed
        remove = await mod.startOtpListener((message: string) => {
          const match = message.match(/\b(\d{4,8})\b/);
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
        <HomeScreen onOpenOtp={() => setModalVisible(true)} />
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
  return code.length >= MIN_LEN && code.length <= MAX_LEN && /^[0-9]{4,8}$/.test(code);
}

const MIN_LEN = 4;
const MAX_LEN = 8;

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#f6f8fa'},
  container: {flex: 1},
});

export default App;
