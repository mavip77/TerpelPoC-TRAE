import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react-native';
import MiBolsillo from '../src/screens/MiBolsillo';

describe('MiBolsillo SMS UI', () => {
  it('muestra botón Enviar SMS en detalle de transacción', () => {
    const navigation: any = {goBack: jest.fn()};
    render(<MiBolsillo navigation={navigation} />);
    const item = screen.getAllByText('Transferencia')[0];
    fireEvent.press(item);
    expect(screen.getByText('Enviar SMS')).toBeTruthy();
  });
});

