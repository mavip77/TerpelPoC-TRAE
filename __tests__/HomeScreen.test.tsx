import React from 'react';
import renderer, { act } from 'react-test-renderer';
import {
  render as rtlRender,
  screen,
  userEvent,
  fireEvent,
} from '@testing-library/react-native';
import { TouchableOpacity, Text } from 'react-native';
import HomeScreen from '../src/screens/HomeScreen';
jest.useFakeTimers();

jest.mock('@d11/react-native-fast-image', () => {
  const React = require('react');
  const Mock = (props: any) => React.createElement('FastImage', props);
  (Mock as any).resizeMode = { cover: 'cover', contain: 'contain' };
  return Mock;
});
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');
jest.mock(
  'react-native/Libraries/Components/Touchable/TouchableOpacity',
  () => {
    const React = require('react');
    return React.forwardRef((props: any, ref: any) =>
      React.createElement('TouchableOpacity', { ...props, ref }),
    );
  },
);
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: () => ({ width: 375, height: 667 }),
}));

const mockAuthenticateWithBiometrics = jest.fn().mockResolvedValue(true);
jest.mock('../src/utils/biometricAuth', () => ({
  authenticateWithBiometrics: (...args: any[]) =>
    mockAuthenticateWithBiometrics(...args),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    mockAuthenticateWithBiometrics.mockResolvedValue(true);
  });
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
    const loadingText = root.findByProps({ children: 'Abriendo...' });
    expect(loadingText).toBeTruthy();
    tree.unmount();
  });

  it('deshabilita el botón cuando isOtpVisible=true', () => {
    const tree = renderer.create(
      <HomeScreen onOpenOtp={() => { }} navigation={{}} isOtpVisible={true} />,
    );
    const root = tree.root;
    const buttons = root.findAllByType(TouchableOpacity);
    const openBtn = buttons[0];
    expect(openBtn.props.disabled).toBe(true);
    // El texto del botón sigue siendo "Abrir OTP"
    const label = root.findByProps({ children: 'Abrir OTP' }) as any as Text;
    expect(label).toBeTruthy();
  });

  it('renderiza secciones visibles y encabezados', () => {
    const tree = renderer.create(
      <HomeScreen onOpenOtp={() => { }} navigation={{}} isOtpVisible={false} />,
    );
    const root = tree.root;
    const secciones = root.findByProps({ children: 'Secciones' });
    expect(secciones).toBeTruthy();
    const puntosHeader = root.findByProps({ children: 'Disfruta tus puntos' });
    expect(puntosHeader).toBeTruthy();
    const verTodos = root.findByProps({ children: 'Ver todos' });
    expect(verTodos).toBeTruthy();
    tree.unmount();
  });

  it('navega a Mi Bolsillo desde la tarjeta', async () => {
    const onNavigateMiBolsillo = jest.fn();
    const tree = renderer.create(
      <HomeScreen
        onOpenOtp={() => { }}
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
    await act(async () => {
      miBolsilloCard.props.onPress();
    });
    expect(mockAuthenticateWithBiometrics).toHaveBeenCalled();
    expect(onNavigateMiBolsillo).toHaveBeenCalled();
    // Saldos se desenmascaran tras autenticación exitosa
    const balances = root.findAllByType(Text).filter(t => t.props.children === '$ 8.100');
    expect(balances.length).toBeGreaterThan(0);
    tree.unmount();
  });

  it('no navega a Mi Bolsillo si biometría falla', async () => {
    mockAuthenticateWithBiometrics.mockResolvedValue(false);
    const onNavigateMiBolsillo = jest.fn();
    const tree = renderer.create(
      <HomeScreen
        onOpenOtp={() => { }}
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
    await act(async () => {
      miBolsilloCard.props.onPress();
    });
    expect(mockAuthenticateWithBiometrics).toHaveBeenCalled();
    expect(onNavigateMiBolsillo).not.toHaveBeenCalled();
    tree.unmount();
  });

  it('navega a Cashback con biometría exitosa', async () => {
    const navigate = jest.fn();
    const tree = renderer.create(
      <HomeScreen
        onOpenOtp={() => { }}
        navigation={{ navigate }}
        isOtpVisible={false}
      />,
    );
    const root = tree.root;
    const cards = root.findAllByType(TouchableOpacity);
    const cashbackCard = cards.find(node => {
      const texts = node.findAllByType(Text);
      return texts.some(t => t.props.children === 'Cashback' && node.props.testID === 'open-cashback');
    })!;
    await act(async () => {
      cashbackCard.props.onPress();
    });
    expect(mockAuthenticateWithBiometrics).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('Cashback');
    tree.unmount();
  });

  it('no navega a Cashback si biometría falla', async () => {
    mockAuthenticateWithBiometrics.mockResolvedValue(false);
    const navigate = jest.fn();
    const tree = renderer.create(
      <HomeScreen
        onOpenOtp={() => { }}
        navigation={{ navigate }}
        isOtpVisible={false}
      />,
    );
    const root = tree.root;
    const cards = root.findAllByType(TouchableOpacity);
    const cashbackCard = cards.find(node => {
      const texts = node.findAllByType(Text);
      return texts.some(t => t.props.children === 'Cashback' && node.props.testID === 'open-cashback');
    })!;
    await act(async () => {
      cashbackCard.props.onPress();
    });
    expect(mockAuthenticateWithBiometrics).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalledWith('Cashback');
    tree.unmount();
  });

  it('renderiza etiquetas de la grilla', () => {
    const tree = renderer.create(
      <HomeScreen onOpenOtp={() => { }} navigation={{}} isOtpVisible={false} />,
    );
    const root = tree.root;
    expect(root.findByProps({ children: 'Mi bolsillo' })).toBeTruthy();
    expect(root.findByProps({ children: 'Aliados' })).toBeTruthy();
    expect(root.findByProps({ children: 'Catálogo' })).toBeTruthy();
    expect(root.findByProps({ children: 'Mis bonos' })).toBeTruthy();
    tree.unmount();
  });

  it('muestra saldos enmascarados al inicio', () => {
    const tree = renderer.create(
      <HomeScreen onOpenOtp={() => { }} navigation={{}} isOtpVisible={false} />,
    );
    const root = tree.root;
    const masked = root.findAllByType(Text).filter(t => t.props.children === '$ ****');
    expect(masked.length).toBe(2);
    // No debe mostrar saldos reales
    const real1 = root.findAllByType(Text).filter(t => t.props.children === '$ 8.100');
    const real2 = root.findAllByType(Text).filter(t => t.props.children === '$ 18.500');
    expect(real1.length).toBe(0);
    expect(real2.length).toBe(0);
    tree.unmount();
  });

  it('desenmascara saldos tras autenticación biométrica exitosa', async () => {
    const navigate = jest.fn();
    const tree = renderer.create(
      <HomeScreen onOpenOtp={() => { }} navigation={{ navigate }} isOtpVisible={false} />,
    );
    const root = tree.root;
    // Inicialmente enmascarado
    let masked = root.findAllByType(Text).filter(t => t.props.children === '$ ****');
    expect(masked.length).toBe(2);
    // Navegar a Mi Bolsillo (autentica)
    const cards = root.findAllByType(TouchableOpacity);
    const miBolsilloCard = cards.find(node => {
      const texts = node.findAllByType(Text);
      return texts.some(t => t.props.children === 'Mi Bolsillo');
    })!;
    await act(async () => {
      miBolsilloCard.props.onPress();
    });
    // Saldos desenmascarados
    masked = root.findAllByType(Text).filter(t => t.props.children === '$ ****');
    expect(masked.length).toBe(0);
    const real1 = root.findAllByType(Text).filter(t => t.props.children === '$ 8.100');
    const real2 = root.findAllByType(Text).filter(t => t.props.children === '$ 18.500');
    expect(real1.length).toBeGreaterThan(0);
    expect(real2.length).toBeGreaterThan(0);
    tree.unmount();
  });

  it('saldos permanecen enmascarados si biometría falla', async () => {
    mockAuthenticateWithBiometrics.mockResolvedValue(false);
    const navigate = jest.fn();
    const tree = renderer.create(
      <HomeScreen onOpenOtp={() => { }} navigation={{ navigate }} isOtpVisible={false} />,
    );
    const root = tree.root;
    const cards = root.findAllByType(TouchableOpacity);
    const miBolsilloCard = cards.find(node => {
      const texts = node.findAllByType(Text);
      return texts.some(t => t.props.children === 'Mi Bolsillo');
    })!;
    await act(async () => {
      miBolsilloCard.props.onPress();
    });
    // Saldos siguen enmascarados
    const masked = root.findAllByType(Text).filter(t => t.props.children === '$ ****');
    expect(masked.length).toBe(2);
    tree.unmount();
  });

  it('RNTL: muestra "Abriendo..." al presionar Abrir OTP', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup();
    rtlRender(
      <HomeScreen onOpenOtp={() => { }} navigation={{}} isOtpVisible={false} />,
    );
    await user.press(screen.getByText('Abrir OTP'));
    expect(screen.getByText('Abriendo...')).toBeTruthy();
  });

  it('RNTL: navega a Mi Bolsillo al presionar la tarjeta', async () => {
    const onNavigateMiBolsillo = jest.fn();
    const { root } = rtlRender(
      <HomeScreen
        onOpenOtp={() => { }}
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
    });
    await act(async () => {
      card.props.onPress();
    });
    expect(onNavigateMiBolsillo).toHaveBeenCalled();
  });

  it('muestra banner de pico y placa con restricción', () => {
    const picoData = {
      vehicle: 'carro' as const,
      city: 'bogota' as const,
      plate: 'ABC 123',
      result: {
        restricted: true,
        message: 'Tiene pico y placa',
        digit: '3',
        dayName: 'Lunes',
      },
    };
    const { root } = rtlRender(
      <HomeScreen
        onOpenOtp={() => { }}
        navigation={{}}
        isOtpVisible={false}
        picoPlacaData={picoData}
      />,
    );
    expect(screen.getByTestId('pyp-banner')).toBeTruthy();
    expect(screen.getByText('Hoy tienes pico y placa')).toBeTruthy();
    expect(screen.getByText(/Bogotá.*Carro.*ABC 123/)).toBeTruthy();
  });

  it('muestra banner de pico y placa SIN restricción', () => {
    const picoData = {
      vehicle: 'moto' as const,
      city: 'medellin' as const,
      plate: 'XYZ 789',
      result: {
        restricted: false,
        message: 'No tiene pico y placa',
        digit: '7',
        dayName: 'Martes',
      },
    };
    rtlRender(
      <HomeScreen
        onOpenOtp={() => { }}
        navigation={{}}
        isOtpVisible={false}
        picoPlacaData={picoData}
      />,
    );
    expect(screen.getByText('Hoy NO tienes pico y placa')).toBeTruthy();
    expect(screen.getByText(/Medellín.*Moto.*XYZ 789/)).toBeTruthy();
  });

  it('no muestra banner si no hay datos de pico y placa', () => {
    rtlRender(
      <HomeScreen
        onOpenOtp={() => { }}
        navigation={{}}
        isOtpVisible={false}
        picoPlacaData={null}
      />,
    );
    expect(screen.queryByTestId('pyp-banner')).toBeNull();
  });

  it('pressing banner calls onOpenPicoPlaca', () => {
    const onOpenPicoPlaca = jest.fn();
    const picoData = {
      vehicle: 'carro' as const,
      city: 'bogota' as const,
      plate: 'ABC 123',
      result: {
        restricted: false,
        message: 'OK',
        digit: '3',
        dayName: 'Lunes',
      },
    };
    rtlRender(
      <HomeScreen
        onOpenOtp={() => { }}
        navigation={{}}
        isOtpVisible={false}
        picoPlacaData={picoData}
        onOpenPicoPlaca={onOpenPicoPlaca}
      />,
    );
    fireEvent.press(screen.getByTestId('pyp-banner'));
    expect(onOpenPicoPlaca).toHaveBeenCalled();
  });
});
