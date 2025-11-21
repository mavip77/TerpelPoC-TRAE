import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Animated, Dimensions, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
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
  const [timer, setTimer] = useState<number>(60);
  const canVerify = code.length === 6 && /^[0-9]{6}$/.test(code) && !loading;
  const autoSubmitRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setCode('');
    setLoading(false);
    setTimer(60);
  }, [visible]);

  useEffect(() => {
    if (!visible && autoSubmitRef.current) {
      clearTimeout(autoSubmitRef.current);
      autoSubmitRef.current = null;
    }
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
    if (autoSubmitRef.current) {
      clearTimeout(autoSubmitRef.current);
      autoSubmitRef.current = null;
    }
    if (c && c.length === 6) {
      autoSubmitRef.current = setTimeout(() => {
        handleVerify();
      }, 500);
    }
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

  const height = Math.floor(Dimensions.get('window').height * 0.78);

  return (
    <Modal
      isVisible={visible}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={400}
      animationOutTiming={300}
      backdropColor="black"
      backdropOpacity={0.5}
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Animated.View style={{transform: [{translateX: errorShake}]}}>
            <Text style={styles.title}>Ingresa el código</Text>
            <Text style={styles.subtitle}>Hemos enviado un código de 6 dígitos al número {phoneMask}</Text>
            <View style={styles.otpArea}>
              <OtpInput length={6} onComplete={onComplete} seedCode={seedCode} />
            </View>
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>¿No recibiste el código?</Text>
              <Pressable disabled={timer > 0} onPress={() => setTimer(60)}>
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
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  sheet: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    paddingBottom: Platform.OS === 'ios' ? 24 : 0,
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
    right: 20,
    top: 20,
    padding: 8,
  },
  closeIcon: {
    fontSize: 20,
    color: '#6B7280',
  },
  title: {
    fontSize: 28,
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
    marginTop: 12,
    marginBottom: 0,
    lineHeight: 22,
  },
  otpArea: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendBtn: {
    fontSize: 15,
    color: '#E31E24',
    fontWeight: '700',
    marginTop: 6,
    textDecorationLine: 'underline',
  },
  resendDisabled: {
    color: '#6B7280',
  },
  primaryBtn: {
    height: 54,
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
    fontSize: 17,
    fontWeight: '700',
  },
  helpLink: {
    textAlign: 'center',
    color: '#E31E24',
    fontSize: 15,
    marginTop: 16,
    marginBottom: 32,
  },
});

export {};