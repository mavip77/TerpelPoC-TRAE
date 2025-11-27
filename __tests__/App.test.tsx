/**
 * @format
 */

import 'react-native';
import React from 'react';
jest.useFakeTimers();
jest.mock('react-native-otp-verify', () => ({
  getHash: jest.fn(async () => ['hash1']),
  startOtpListener: jest.fn(async (cb: (msg: string) => void) => {
    cb('Tu código es 123456');
    return () => {};
  }),
}));
import App from '../App';

// Note: import explicitly to use the types shipped with jest.
import {it} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer, {act} from 'react-test-renderer';

jest.mock('react-native-modal', () => (props: any) => props.children);
jest.mock('@d11/react-native-fast-image', () => {
  const React = require('react');
  const Mock = (props: any) => React.createElement('FastImage', props);
  (Mock as any).resizeMode = {cover: 'cover', contain: 'contain'};
  return Mock;
});
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(async () => null),
  setGenericPassword: jest.fn(async () => undefined),
}));
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: any) => children,
}));
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: any) => children,
    Screen: ({children}: any) =>
      typeof children === 'function' ? children({navigation: {}}) : children,
  }),
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({children}: any) => children,
}));
  jest.mock('react-native/Libraries/Animated/Animated', () => {
    const Actual = jest.requireActual('react-native/Libraries/Animated/Animated');
    return {
      ...Actual,
      Value: function (initial: any) {
        return {setValue: jest.fn(), __getValue: () => initial} as any;
      },
      timing: () => ({
        start: (cb?: () => void) => {
          if (cb) cb();
        },
      }),
    };
  });

it('renders correctly', () => {
  renderer.create(<App />);
});

it('abre OTP al presionar el botón en Home', () => {
  const tree = renderer.create(<App />);
  const root = tree.root;
  const btn = root
    .findAllByType(require('react-native').TouchableOpacity)
    .find(node => {
      const texts = node.findAllByType(require('react-native').Text);
      return texts.some(t => t.props.children === 'Abrir OTP');
    })!;
  act(() => {
    btn.props.onPress();
  });
  const modal = root.findByType(require('../src/components/OtpModal').default);
  expect(modal.props.visible).toBe(true);
  tree.unmount();
});

it('en Android, autofill verifica y cierra el modal', async () => {
  const {Platform} = require('react-native');
  Platform.OS = 'android';
  let tree: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<App />);
  });
  const root = tree!.root;
  const btn = root
    .findAllByType(require('react-native').TouchableOpacity)
    .find(node => {
      const texts = node.findAllByType(require('react-native').Text);
      return texts.some(t => t.props.children === 'Abrir OTP');
    })!;
  await act(async () => {
    btn.props.onPress();
  });
  const otpNode = root.findByType(
    require('../src/components/OtpInput').default,
  );
  await act(async () => {
    otpNode.props.onComplete('123456');
  });
  const verifyBtn = root
    .findAllByType(require('react-native').Pressable)
    .find(node => {
      const texts = node.findAllByType(require('react-native').Text);
      return texts.some(t => t.props.children === 'Verificar');
    })!;
  await act(async () => {
    verifyBtn.props.onPress();
  });
  await act(async () => {
    jest.runOnlyPendingTimers();
    jest.advanceTimersByTime(1200);
    await Promise.resolve();
  });
  const modal = root.findByType(require('../src/components/OtpModal').default);
  expect(modal.props.visible).toBe(false);
  tree!.unmount();
});
