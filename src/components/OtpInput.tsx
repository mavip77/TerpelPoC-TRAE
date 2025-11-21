import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Keyboard, Platform, StyleSheet, Text, TextInput, View} from 'react-native';

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
  const inputs = useRef<Array<TextInput | null>>([]);
  const scales = useRef<Animated.Value[]>(
    Array(otpLength)
      .fill(0)
      .map(() => new Animated.Value(1)),
  ).current;

  useEffect(() => {
    const first = inputs.current[0];
    first?.focus();
  }, []);

  useEffect(() => {
    if (!seedCode) {
      return;
    }
    const sliced = seedCode.slice(0, otpLength).split('');
    const merged = Array(otpLength)
      .fill('')
      .map((_, i) => sliced[i] ?? '');
    setValues(merged);
    if (merged.every(ch => ch)) {
      inputs.current[otpLength - 1]?.blur();
      Keyboard.dismiss();
      onComplete?.(merged.join(''));
    }
  }, [seedCode, otpLength, onComplete]);

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
      <Text style={styles.title}>Ingresa el código OTP</Text>
      <View style={styles.row}>
        {values.map((val, i) => (
          <Animated.View key={i} style={[styles.box, {transform: [{scale: scales[i]}]}] }>
            <TextInput
              ref={r => (inputs.current[i] = r)}
              value={val}
              onChangeText={t => handleChange(t.replace(/\s/g, ''), i)}
              onFocus={() => setFocusedIndex(i)}
              onKeyPress={e => handleKeyPress(e, i)}
              selectionColor="#1f6feb"
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  box: {
    width: 52,
    height: 60,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d0d7de',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
  },
});

export {};