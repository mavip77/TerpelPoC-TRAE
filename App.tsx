/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {Platform, SafeAreaView, StatusBar, StyleSheet, Text, View} from 'react-native';
import OtpInput from './src/components/OtpInput';

function App(): React.JSX.Element {
  const [status, setStatus] = useState<string>('');
  const [seedCode, setSeedCode] = useState<string | undefined>(undefined);
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
          if (hashes && hashes.length > 0) setSignature(hashes[0]);
        } catch {}
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

  const handleComplete = async (code: string) => {
    setStatus('Validando OTP...');
    const ok = await mockValidateOtp(code);
    setStatus(ok ? 'OTP válido' : 'OTP inválido');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={'dark-content'} />
      <View style={styles.container}>
        <OtpInput length={6} onComplete={handleComplete} seedCode={seedCode} />
        <Text style={styles.status}>{status}</Text>
        {Platform.OS === 'android' ? (
          <Text style={styles.signature}>Hash de app: {signature ?? '...'}</Text>
        ) : null}
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
  container: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24},
  status: {marginTop: 24, fontSize: 16},
  signature: {marginTop: 8, fontSize: 12, color: '#57606a'},
});

export default App;
