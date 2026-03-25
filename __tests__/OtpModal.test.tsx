import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { } from 'react-native';
import OtpModal from '../src/components/OtpModal';
jest.useFakeTimers();

jest.mock('react-native-modal', () => (props: any) => props.children);
jest.mock(
  'react-native/Libraries/Components/Touchable/TouchableOpacity',
  () => {
    const React = require('react');
    return React.forwardRef((props: any, ref: any) =>
      React.createElement('TouchableOpacity', { ...props, ref }),
    );
  },
);
jest.mock('../src/components/OtpInput', () => {
  const React = require('react');
  const { useEffect } = React;
  return ({ onComplete, seedCode }: any) => {
    useEffect(() => {
      if (seedCode) {
        onComplete?.(String(seedCode));
      }
    }, [seedCode, onComplete]);
    return React.createElement('OtpInput', { onComplete, seedCode });
  };
});
// (solo un mock de OtpInput)

describe('OtpModal', () => {
  it('autoverifica con seedCode y cierra cuando onVerify=true', async () => {
    const onClose = jest.fn();
    const onVerify = jest.fn(async () => true);
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <OtpModal
          visible={true}
          onClose={onClose}
          seedCode="12345678"
          onVerify={onVerify}
        />,
      );
    });
    const otp = (tree as any).root.findByType('OtpInput');
    await act(async () => {
      otp.props.onComplete('12345678');
    });
    await act(async () => {
      jest.runOnlyPendingTimers();
      jest.advanceTimersByTime(600);
      await Promise.resolve();
    });
    expect(onVerify).toHaveBeenCalledWith('12345678');
    expect(onClose).toHaveBeenCalled();
    tree.unmount();
  });

  it('autoverifica con seedCode y no cierra cuando onVerify=false', async () => {
    const onClose = jest.fn();
    const onVerify = jest.fn(async () => false);
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <OtpModal
          visible={true}
          onClose={onClose}
          seedCode="65432187"
          onVerify={onVerify}
        />,
      );
    });
    const otp2 = (tree as any).root.findByType('OtpInput');
    await act(async () => {
      otp2.props.onComplete('65432187');
    });
    await act(async () => {
      jest.runOnlyPendingTimers();
      jest.advanceTimersByTime(600);
      await Promise.resolve();
    });
    expect(onVerify).toHaveBeenCalledWith('65432187');
    expect(onClose).not.toHaveBeenCalled();
    tree.unmount();
  });
});
