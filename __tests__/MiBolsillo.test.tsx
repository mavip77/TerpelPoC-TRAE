import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {
  render,
  screen,
  userEvent,
  waitFor,
} from '@testing-library/react-native';
import {TouchableOpacity, Text} from 'react-native';
import MiBolsillo from '../src/screens/MiBolsillo';

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');
jest.mock('react-native-modal', () => (props: any) => props.children);
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(async () => null),
  setGenericPassword: jest.fn(async () => undefined),
}));
jest.mock(
  'react-native/Libraries/Components/Touchable/TouchableOpacity',
  () => {
    const React = require('react');
    return React.forwardRef((props: any, ref: any) =>
      React.createElement('TouchableOpacity', {...props, ref}),
    );
  },
);

describe('MiBolsillo Screen', () => {
  it('renderiza y muestra sección Transferir por defecto', () => {
    const tree = renderer.create(
      <MiBolsillo navigation={{goBack: jest.fn()}} />,
    );
    const root = tree.root;
    const title = root.findByProps({children: 'Transferir saldo'});
    expect(title).toBeTruthy();
  });

  it('cambia a la pestaña Recargar y muestra botón PSE', () => {
    const tree = renderer.create(
      <MiBolsillo navigation={{goBack: jest.fn()}} />,
    );
    const root = tree.root;
    const tabs = root.findAll(
      node =>
        node.type === TouchableOpacity &&
        node.findAllByType(Text).some(t => t.props.children === 'Recargar'),
    );
    expect(tabs.length).toBeGreaterThan(0);
    const recargarTab = tabs[0];
    act(() => {
      recargarTab.props.onPress();
    });
    const pse = root.findByProps({children: 'Recargar con PSE'});
    expect(pse).toBeTruthy();
  });

  it('cambia a la pestaña Movimientos y muestra lista de transacciones', () => {
    const tree = renderer.create(
      <MiBolsillo navigation={{goBack: jest.fn()}} />,
    );
    const root = tree.root;
    const tab = root.findAll(
      node =>
        node.type === TouchableOpacity &&
        node
          .findAllByType(Text)
          .some(t => t.props.children === 'Transacciones'),
    )[0];
    act(() => {
      tab.props.onPress();
    });
    const itemTitle = root.findAllByProps({children: 'Transferencia'});
    expect(itemTitle.length).toBeGreaterThan(0);
  });
});

describe('MiBolsillo Validaciones', () => {
  it('validación de documento y habilitación de envío (CC)', () => {
    const tree = renderer.create(
      <MiBolsillo navigation={{goBack: jest.fn()}} />,
    );
    const root = tree.root;
    const hint = root.findByProps({children: 'Ingresa un documento válido'});
    expect(hint).toBeTruthy();
    const sendBtn = root.findAllByType(TouchableOpacity).find(node => {
      const texts = node.findAllByType(Text);
      return texts.some(
        t => t.props.children === 'Enviar para realizar la transferencia',
      );
    })!;
    expect(sendBtn.props.disabled).toBe(true);

    const ccTab = root
      .findAllByType(TouchableOpacity)
      .find(node =>
        node.findAllByType(Text).some(t => t.props.children === 'CC'),
      )!;
    act(() => {
      ccTab.props.onPress();
    });
    const docInput = root.findAll(
      node =>
        node.type === require('react-native').TextInput &&
        node.props.placeholder === 'Ingresa el documento',
    )[0];
    act(() => {
      docInput.props.onChangeText('1234567');
    });
    const amountInput = root.findAll(
      node =>
        node.type === require('react-native').TextInput &&
        node.props.placeholder === '$ 0',
    )[0];
    act(() => {
      amountInput.props.onChangeText('100');
    });
    expect(root.findByProps({children: 'Documento válido'})).toBeTruthy();
    const sendBtn2 = root.findAllByType(TouchableOpacity).find(node => {
      const texts = node.findAllByType(Text);
      return texts.some(
        t => t.props.children === 'Enviar para realizar la transferencia',
      );
    })!;
    expect(sendBtn2.props.disabled).toBe(false);
    tree.unmount();
  });

  it('bloquea envío cuando el monto es mayor o igual al saldo', () => {
    const tree = renderer.create(
      <MiBolsillo navigation={{goBack: jest.fn()}} />,
    );
    const root = tree.root;
    const ccTab = root
      .findAllByType(TouchableOpacity)
      .find(node =>
        node.findAllByType(Text).some(t => t.props.children === 'CC'),
      )!;
    act(() => {
      ccTab.props.onPress();
    });
    const docInput = root.findAll(
      node =>
        node.type === require('react-native').TextInput &&
        node.props.placeholder === 'Ingresa el documento',
    )[0];
    const amountInput = root.findAll(
      node =>
        node.type === require('react-native').TextInput &&
        node.props.placeholder === '$ 0',
    )[0];
    act(() => {
      docInput.props.onChangeText('1234567');
      amountInput.props.onChangeText('9000');
    });
    const sendBtn = root.findAllByType(TouchableOpacity).find(node => {
      const texts = node.findAllByType(Text);
      return texts.some(
        t => t.props.children === 'Enviar para realizar la transferencia',
      );
    })!;
    act(() => {
      sendBtn.props.onPress();
    });
    const {Alert} = require('react-native');
    expect(Alert.alert).toHaveBeenCalledWith(
      'Saldo insuficiente',
      expect.stringContaining('superior al saldo'),
    );
    tree.unmount();
  });

  it('CE con documento corto mantiene botón deshabilitado', () => {
    const tree = renderer.create(
      <MiBolsillo navigation={{goBack: jest.fn()}} />,
    );
    const root = tree.root;
    const ceTab = root
      .findAllByType(TouchableOpacity)
      .find(node =>
        node.findAllByType(Text).some(t => t.props.children === 'CE'),
      )!;
    act(() => {
      ceTab.props.onPress();
    });
    const docInput = root.findAll(
      node =>
        node.type === require('react-native').TextInput &&
        node.props.placeholder === 'Ingresa el documento',
    )[0];
    act(() => {
      docInput.props.onChangeText('12345');
    });
    const amountInput = root.findAll(
      node =>
        node.type === require('react-native').TextInput &&
        node.props.placeholder === '$ 0',
    )[0];
    act(() => {
      amountInput.props.onChangeText('100');
    });
    const sendBtn = root.findAllByType(TouchableOpacity).find(node => {
      const texts = node.findAllByType(Text);
      return texts.some(
        t => t.props.children === 'Enviar para realizar la transferencia',
      );
    })!;
    expect(sendBtn.props.disabled).toBe(true);
    tree.unmount();
  });

  it('botón "Enviar a favoritos" inicia deshabilitado cuando no hay favoritos', () => {
    const tree = renderer.create(
      <MiBolsillo navigation={{goBack: jest.fn()}} />,
    );
    const root = tree.root;
    const favBtn = root
      .findAllByType(TouchableOpacity)
      .find(node =>
        node
          .findAllByType(Text)
          .some(t => t.props.children === 'Enviar a favoritos'),
      )!;
    expect(favBtn.props.disabled).toBe(true);
    tree.unmount();
  });

  it('RNTL: favoritos cargados habilitan botón y abre modal', async () => {
    const Keychain = require('react-native-keychain');
    Keychain.getGenericPassword.mockResolvedValue({
      username: 'favorites',
      password: JSON.stringify([
        {name: 'Juan', docType: 'CC', docNumber: '123456'},
      ]),
    });
    render(<MiBolsillo navigation={{goBack: jest.fn()}} />);
    const {root} = screen;
    await waitFor(() => {
      const TouchableOpacity = require('react-native').TouchableOpacity;
      const Text = require('react-native').Text;
      const btn = root
        .findAllByType(TouchableOpacity)
        .find(node =>
          node
            .findAllByType(Text)
            .some(t => t.props.children === 'Enviar a favoritos'),
        )!;
      expect(btn.props.disabled).toBe(false);
    });
    const TouchableOpacity = require('react-native').TouchableOpacity;
    const Text = require('react-native').Text;
    const btn = root
      .findAllByType(TouchableOpacity)
      .find(node =>
        node
          .findAllByType(Text)
          .some(t => t.props.children === 'Enviar a favoritos'),
      )!;
    act(() => {
      btn.props.onPress();
    });
    expect(screen.getByText('Tus favoritos')).toBeTruthy();
  });

  it('habilita envío con CC y doc válido (RNTL)', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup();
    render(<MiBolsillo navigation={{goBack: jest.fn()}} />);
    await user.press(screen.getByText('CC'));
    await user.type(
      screen.getByPlaceholderText('Ingresa el documento'),
      '1234567',
    );
    await user.type(screen.getByPlaceholderText('$ 0'), '100');
    expect(screen.getByText('Documento válido')).toBeTruthy();
    const root = screen.root;
    const sendBtn = root.findAllByType(TouchableOpacity).find(node => {
      const texts = node.findAllByType(Text);
      return texts.some(
        t => t.props.children === 'Enviar para realizar la transferencia',
      );
    })!;
    expect(sendBtn.props.disabled).toBe(false);
  });
});
