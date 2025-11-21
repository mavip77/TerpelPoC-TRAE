/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {Platform, SafeAreaView, StatusBar, StyleSheet, Text, View} from 'react-native';
import OtpModal from './src/components/OtpModal';
import HomeScreen from './src/screens/HomeScreen';

function App(): React.JSX.Element {
  const [seedCode, setSeedCode] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState<boolean>(true);
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
        <HomeScreen onOpenOtp={() => setModalVisible(true)} />
        {Platform.OS === 'android' ? (
          <Text style={styles.signature}>Hash de app: {signature ?? '...'}</Text>
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
  return code.length >= MIN_LEN && code.length <= MAX_LEN && /^[0-9]{4,8}$/.test(code);
}

const MIN_LEN = 4;
const MAX_LEN = 8;

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#f6f8fa'},
  container: {flex: 1},
  signature: {position: 'absolute', top: 8, left: 12, fontSize: 12, color: '#57606a'},
});

export default App;
