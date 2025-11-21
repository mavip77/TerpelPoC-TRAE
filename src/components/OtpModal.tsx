import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Animated, Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Modal from 'react-native-modal';
import OtpInput from './OtpInput';

type Props = {
  visible: boolean;
  onClose: () => void;
  phoneMask?: string;
  seedCode?: string;
  onVerify?: (code: string) => Promise<boolean>;
};

export default function OtpModal({visible, onClose, phoneMask = '+57 XXX XXX XX67', seedCode, onVerify}: Props) {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorShake] = useState(new Animated.Value(0));
  const [timer, setTimer] = useState<number>(45);
  const canVerify = code.length === 6 && /^[0-9]{6}$/.test(code) && !loading;

  useEffect(() => {
    if (!visible) {
      return;
    }
    setCode('');
    setLoading(false);
    setTimer(45);
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const id = setInterval(() => setTimer(t => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [visible]);

  const formattedTimer = useMemo(() => {
    const m = Math.floor(timer / 60);
    const s = `${timer % 60}`.padStart(2, '0');
    return `${m}:${s}`;
  }, [timer]);

  const onComplete = (c: string) => {
    setCode(c);
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(errorShake, {toValue: 10, duration: 50, useNativeDriver: true}),
      Animated.timing(errorShake, {toValue: -10, duration: 50, useNativeDriver: true}),
      Animated.timing(errorShake, {toValue: 8, duration: 50, useNativeDriver: true}),
      Animated.timing(errorShake, {toValue: -8, duration: 50, useNativeDriver: true}),
      Animated.timing(errorShake, {toValue: 0, duration: 50, useNativeDriver: true}),
    ]).start();
  };

  const handleVerify = async () => {
    if (!canVerify) {
      return;
    }
    setLoading(true);
    const ok = (await onVerify?.(code)) ?? false;
    setLoading(false);
    if (ok) {
      onClose();
    } else {
      triggerShake();
    }
  };

  const height = Math.floor(Dimensions.get('window').height * 0.72);

  return (
    <Modal
      isVisible={visible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={250}
      backdropColor="black"
      backdropOpacity={0.6}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      swipeDirection="down"
      onSwipeComplete={onClose}
      useNativeDriver
      hideModalContentWhileAnimating>
      <View style={[styles.sheet, {height}]}>
        <View style={styles.header}>
          <View style={styles.handle} />
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar">
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>
        </View>
        <Animated.View style={{transform: [{translateX: errorShake}]}}>
          <Text style={styles.title}>Ingresa el código</Text>
          <Text style={styles.subtitle}>Hemos enviado un código de 6 dígitos al número {phoneMask}</Text>
          <View style={styles.otpArea}>
            <OtpInput length={6} onComplete={onComplete} seedCode={seedCode} />
          </View>
          <View style={styles.resendRow}>
            <Text style={styles.resendText}>¿No recibiste el código?</Text>
            <Pressable disabled={timer > 0} onPress={() => setTimer(45)}>
              <Text style={[styles.resendBtn, timer > 0 && styles.resendDisabled]}>{timer > 0 ? `Reenviar en ${formattedTimer}` : 'Reenviar código'}</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={handleVerify}
            disabled={!canVerify}
            style={({pressed}) => [
              styles.primaryBtn,
              !canVerify ? styles.primaryBtnDisabled : null,
              pressed && canVerify ? {opacity: 0.9} : null,
            ]}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>Verificar</Text>
            )}
          </Pressable>
          <Pressable onPress={() => {}}>
            <Text style={styles.helpLink}>¿Necesitas ayuda?</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginTop: 12,
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 16,
  },
  closeIcon: {
    fontSize: 20,
    color: '#6B7280',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginHorizontal: 12,
    marginVertical: 16,
    lineHeight: 22,
  },
  otpArea: {
    marginVertical: 32,
    paddingHorizontal: 24,
  },
  resendRow: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendBtn: {
    fontSize: 14,
    color: '#E31E24',
    fontWeight: '600',
    marginTop: 6,
    textDecorationLine: 'none',
  },
  resendDisabled: {
    color: '#6B7280',
  },
  primaryBtn: {
    height: 52,
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: '#E31E24',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
  },
  primaryBtnDisabled: {
    backgroundColor: '#FCA5A5',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpLink: {
    textAlign: 'center',
    color: '#E31E24',
    fontSize: 14,
    marginTop: 16,
    marginBottom: 32,
  },
});

export {};
