import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {
  render as rtlRender,
  screen,
  userEvent,
} from '@testing-library/react-native';
import {TouchableOpacity, Text} from 'react-native';
import HomeScreen from '../src/screens/HomeScreen';
jest.useFakeTimers();

jest.mock('@d11/react-native-fast-image', () => {
  const React = require('react');
  const Mock = (props: any) => React.createElement('FastImage', props);
  (Mock as any).resizeMode = {cover: 'cover', contain: 'contain'};
  return Mock;
});
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');
jest.mock(
  'react-native/Libraries/Components/Touchable/TouchableOpacity',
  () => {
    const React = require('react');
    return React.forwardRef((props: any, ref: any) =>
      React.createElement('TouchableOpacity', {...props, ref}),
    );
  },
);
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: () => ({width: 375, height: 667}),
}));

describe('HomeScreen', () => {
  it('llama onOpenOtp y muestra "Abriendo..." al presionar', () => {
    const onOpenOtp = jest.fn();
    const tree = renderer.create(
      <HomeScreen onOpenOtp={onOpenOtp} navigation={{}} isOtpVisible={false} />,
    );
    const root = tree.root;
    const buttons = root.findAllByType(TouchableOpacity);
    const openBtn = buttons[0];

    act(() => {
      openBtn.props.onPress();
      jest.advanceTimersByTime(100);
    });

    expect(onOpenOtp).toHaveBeenCalled();
    const loadingText = root.findByProps({children: 'Abriendo...'});
    expect(loadingText).toBeTruthy();
    tree.unmount();
  });

  it('deshabilita el botón cuando isOtpVisible=true', () => {
    const tree = renderer.create(
      <HomeScreen onOpenOtp={() => {}} navigation={{}} isOtpVisible={true} />,
    );
    const root = tree.root;
    const buttons = root.findAllByType(TouchableOpacity);
    const openBtn = buttons[0];
    expect(openBtn.props.disabled).toBe(true);
    // El texto del botón sigue siendo "Abrir OTP"
    const label = root.findByProps({children: 'Abrir OTP'}) as any as Text;
    expect(label).toBeTruthy();
  });

  it('renderiza secciones visibles y encabezados', () => {
    const tree = renderer.create(
      <HomeScreen onOpenOtp={() => {}} navigation={{}} isOtpVisible={false} />,
    );
    const root = tree.root;
    const secciones = root.findByProps({children: 'Secciones'});
    expect(secciones).toBeTruthy();
    const puntosHeader = root.findByProps({children: 'Disfruta tus puntos'});
    expect(puntosHeader).toBeTruthy();
    const verTodos = root.findByProps({children: 'Ver todos'});
    expect(verTodos).toBeTruthy();
    tree.unmount();
  });

  it('navega a Mi Bolsillo desde la tarjeta', () => {
    const onNavigateMiBolsillo = jest.fn();
    const tree = renderer.create(
      <HomeScreen
        onOpenOtp={() => {}}
        navigation={{}}
        isOtpVisible={false}
        onNavigateMiBolsillo={onNavigateMiBolsillo}
      />,
    );
    const root = tree.root;
    const cards = root.findAllByType(TouchableOpacity);
    const miBolsilloCard = cards.find(node => {
      const texts = node.findAllByType(Text);
      return texts.some(t => t.props.children === 'Mi Bolsillo');
    })!;
    act(() => {
      miBolsilloCard.props.onPress();
    });
    expect(onNavigateMiBolsillo).toHaveBeenCalled();
    tree.unmount();
  });

  it('renderiza etiquetas de la grilla', () => {
    const tree = renderer.create(
      <HomeScreen onOpenOtp={() => {}} navigation={{}} isOtpVisible={false} />,
    );
    const root = tree.root;
    expect(root.findByProps({children: 'Mi bolsillo'})).toBeTruthy();
    expect(root.findByProps({children: 'Aliados'})).toBeTruthy();
    expect(root.findByProps({children: 'Catálogo'})).toBeTruthy();
    expect(root.findByProps({children: 'Mis bonos'})).toBeTruthy();
    tree.unmount();
  });

  it('RNTL: muestra "Abriendo..." al presionar Abrir OTP', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup();
    rtlRender(
      <HomeScreen onOpenOtp={() => {}} navigation={{}} isOtpVisible={false} />,
    );
    await user.press(screen.getByText('Abrir OTP'));
    expect(screen.getByText('Abriendo...')).toBeTruthy();
  });

  it('RNTL: navega a Mi Bolsillo al presionar la tarjeta', async () => {
    const onNavigateMiBolsillo = jest.fn();
    const {root} = rtlRender(
      <HomeScreen
        onOpenOtp={() => {}}
        navigation={{}}
        isOtpVisible={false}
        onNavigateMiBolsillo={onNavigateMiBolsillo}
      />,
    );
    const TouchableOpacity = require('react-native').TouchableOpacity;
    const Text = require('react-native').Text;
    const cards = root.findAllByType(TouchableOpacity);
    const card = cards.find(node => {
      const texts = node.findAllByType(Text);
      return texts.some(t => t.props.children === 'Mi Bolsillo');
    })!;
    act(() => {
      card.props.onPress();
    });
    expect(onNavigateMiBolsillo).toHaveBeenCalled();
  });
});
