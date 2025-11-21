import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Keyboard, Platform, StyleSheet, TextInput, View} from 'react-native';

type OtpInputProps = {
  length?: number;
  onComplete?: (code: string) => void;
  seedCode?: string;
};

const MIN_LEN = 4;
const MAX_LEN = 8;

        export default function OtpInput({length = 6, onComplete, seedCode}: OtpInputProps) {
          const otpLength = useMemo(() =>
            Math.max(MIN_LEN, Math.min(MAX_LEN, Math.floor(length || MIN_LEN))),
          [length]);

          const [values, setValues] = useState<string[]>(Array(otpLength).fill(''));
          const [focusedIndex, setFocusedIndex] = useState<number>(0);
          const manualRef = useRef<boolean>(false);
          const inputs = useRef<Array<TextInput | null>>([]);
          const scales = useRef<Animated.Value[]>(
            Array(otpLength)
              .fill(0)
              .map(() => new Animated.Value(1)),
          ).current;
          const rowOpacity = useRef(new Animated.Value(1)).current;
          const hasAnyRef = useRef<boolean>(false);

  useEffect(() => {
    const first = inputs.current[0];
    first?.focus();
  }, []);

  useEffect(() => {
    if (!seedCode) {
      return;
    }
    const cleaned = String(seedCode).replace(/\D/g, '').slice(0, otpLength);
    if (cleaned.length < 4) {
      return;
    }
    const apply = () => {
      const merged = Array(otpLength).fill('');
      for (let i = 0; i < Math.min(otpLength, cleaned.length); i++) {
        merged[i] = cleaned[i];
      }
      setValues(merged);
      setFocusedIndex(Math.min(otpLength - 1, cleaned.length - 1));
      const code = merged.join('');
      if (code.length === otpLength) {
        inputs.current[otpLength - 1]?.blur();
        Keyboard.dismiss();
        onComplete?.(code);
      }
      manualRef.current = false;
    };
    if (manualRef.current && hasAnyRef.current) {
      Animated.timing(rowOpacity, {toValue: 0, duration: 150, useNativeDriver: true}).start(() => {
        setValues(Array(otpLength).fill(''));
        hasAnyRef.current = false;
        Animated.timing(rowOpacity, {toValue: 1, duration: 120, useNativeDriver: true}).start(() => apply());
      });
    } else {
      setTimeout(apply, 0);
    }
  }, [seedCode, otpLength, rowOpacity, onComplete]);

  useEffect(() => {
    if (typeof (Animated as any)?.spring === 'function') {
      Animated.spring(scales[focusedIndex], {
        toValue: 1.08,
        useNativeDriver: true,
        friction: 5,
        tension: 80,
      }).start();
    }

    if (typeof (Animated as any)?.spring === 'function') {
      for (let i = 0; i < otpLength; i++) {
        if (i !== focusedIndex) {
          Animated.spring(scales[i], {
            toValue: 1,
            useNativeDriver: true,
            friction: 7,
            tension: 100,
          }).start();
        }
      }
    }
  }, [focusedIndex, otpLength, scales]);

          const handleChange = (text: string, index: number) => {
            let t = text;
            if (!t) {
              return;
            }
            manualRef.current = true;
            hasAnyRef.current = true;

    if (t.length > 1) {
      const merged = [...values];
      let cursor = index;
      for (const ch of t.slice(0, otpLength - index)) {
        merged[cursor] = ch;
        cursor++;
      }
      setValues(merged);
      if (cursor < otpLength) {
        inputs.current[cursor]?.focus();
        setFocusedIndex(cursor);
      } else {
        setFocusedIndex(otpLength - 1);
        inputs.current[otpLength - 1]?.blur();
        Keyboard.dismiss();
        const code = merged.join('');
        onComplete?.(code);
      }
      return;
    }

            const next = [...values];
            next[index] = t;
            setValues(next);

    if (index < otpLength - 1) {
      inputs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    } else {
      inputs.current[index]?.blur();
      Keyboard.dismiss();
      const code = next.join('');
      onComplete?.(code);
    }
          };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const next = [...values];
      if (next[index]) {
        next[index] = '';
        setValues(next);
        setFocusedIndex(index);
      } else if (index > 0) {
        next[index - 1] = '';
        setValues(next);
        inputs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      }
    }
  };

  return (
    <View style={styles.container}>
              <Animated.View style={[styles.row, {opacity: rowOpacity}] }>
                {values.map((val, i) => (
                  <Animated.View key={i} style={[styles.box, (i === focusedIndex || !!values[i]) ? styles.boxActive : null, (i === focusedIndex || !!values[i]) ? styles.boxActiveBg : null, {transform: [{scale: scales[i]}]}]}>
                    <TextInput
                      ref={r => (inputs.current[i] = r)}
                      value={val}
                      onChangeText={t => handleChange(t.replace(/\s/g, ''), i)}
                      onFocus={() => setFocusedIndex(i)}
                      onKeyPress={e => handleKeyPress(e, i)}
                      selectionColor="#E31E24"
                      style={styles.input}
                      maxLength={1}
                      keyboardType="number-pad"
                      autoFocus={i === 0}
                      textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : 'none'}
                      autoComplete="one-time-code"
                      enterKeyHint="next"
                      importantForAutofill="yes"
                      autoCorrect={false}
                      contextMenuHidden
                    />
                  </Animated.View>
                ))}
              </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  boxActive: {borderColor: '#E31E24'},
  boxActiveBg: {backgroundColor: '#FFFFFF'},
  input: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1F2937',
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
  },
});

export {};