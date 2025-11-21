import React from 'react';
import renderer, {act} from 'react-test-renderer';
import OtpInput from '../src/components/OtpInput';

describe('OtpInput autofill from seedCode', () => {
  it('fills and calls onComplete when seedCode has 6 digits and no manual input', () => {
    const onComplete = jest.fn();
    const tree = renderer.create(
      <OtpInput length={6} onComplete={onComplete} seedCode={undefined} />,
    );
    act(() => {
      tree.update(
        <OtpInput length={6} onComplete={onComplete} seedCode={'183742'} />,
      );
    });
    expect(onComplete).toHaveBeenCalledWith('183742');
  });

  it('clears manual input and applies seedCode', () => {
    const onComplete = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <OtpInput length={6} onComplete={onComplete} seedCode={undefined} />,
      );
    });

    const root = component!.root;
    const inputs = root.findAllByType('TextInput');
    act(() => {
      inputs[0].props.onChangeText('4');
      inputs[1].props.onChangeText('5');
      inputs[2].props.onChangeText('6');
    });

    act(() => {
      component!.update(
        <OtpInput length={6} onComplete={onComplete} seedCode={'123456'} />,
      );
    });

    expect(onComplete).toHaveBeenCalledWith('123456');
  });
});
