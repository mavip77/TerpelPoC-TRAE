import React from 'react';
import {render, screen} from '@testing-library/react-native';
import CashbackScreen from '../src/screens/CashbackScreen';

describe('CashbackScreen', () => {
  it('muestra saldos separados y reglas', () => {
    render(<CashbackScreen />);
    expect(screen.getByText('Saldo del bolsillo')).toBeTruthy();
    expect(screen.getByText('Saldo de cashback')).toBeTruthy();
    expect(screen.getByText('Reglas y vigencias')).toBeTruthy();
    expect(screen.getByText(/Bienvenida/i)).toBeTruthy();
    expect(screen.getByText(/Global/i)).toBeTruthy();
  });
});

