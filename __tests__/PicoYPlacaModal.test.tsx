import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';

jest.mock('react-native-modal', () => {
    const React = require('react');
    return ({ isVisible, children, ...rest }: any) =>
        isVisible ? React.createElement('View', rest, children) : null;
});
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

import PicoYPlacaModal from '../src/components/PicoYPlacaModal';

describe('PicoYPlacaModal', () => {
    it('renders nothing when not visible', () => {
        const { queryByTestId } = render(
            <PicoYPlacaModal visible={false} onClose={jest.fn()} />,
        );
        expect(queryByTestId('pyp-plate-input')).toBeNull();
    });

    it('renders form when visible', () => {
        render(<PicoYPlacaModal visible={true} onClose={jest.fn()} />);
        expect(screen.getByTestId('pyp-plate-input')).toBeTruthy();
        expect(screen.getByTestId('pyp-check-btn')).toBeTruthy();
        expect(screen.getByTestId('pyp-vehicle-carro')).toBeTruthy();
        expect(screen.getByTestId('pyp-vehicle-moto')).toBeTruthy();
        expect(screen.getByTestId('pyp-city-bogota')).toBeTruthy();
        expect(screen.getByTestId('pyp-city-medellin')).toBeTruthy();
    });

    it('button says Guardar', () => {
        render(<PicoYPlacaModal visible={true} onClose={jest.fn()} />);
        expect(screen.getByText('Guardar')).toBeTruthy();
    });

    it('calls onSave with result data and onClose when pressing Guardar', () => {
        const onClose = jest.fn();
        const onSave = jest.fn();
        render(
            <PicoYPlacaModal visible={true} onClose={onClose} onSave={onSave} />,
        );
        fireEvent.changeText(screen.getByTestId('pyp-plate-input'), 'ABC123');
        fireEvent.press(screen.getByTestId('pyp-check-btn'));
        expect(onSave).toHaveBeenCalledTimes(1);
        const savedData = onSave.mock.calls[0][0];
        expect(savedData.vehicle).toBe('carro');
        expect(savedData.city).toBe('bogota');
        expect(savedData.plate).toBe('ABC123');
        expect(savedData.result).toBeDefined();
        expect(savedData.result.digit).toBeTruthy();
        expect(onClose).toHaveBeenCalled();
    });

    it('disables check button when no digits in plate', () => {
        render(<PicoYPlacaModal visible={true} onClose={jest.fn()} />);
        const btn = screen.getByTestId('pyp-check-btn');
        // Button should be disabled (no plate entered)
        expect(btn.props.accessibilityState?.disabled ?? btn.props.disabled).toBeTruthy();
    });

    it('calls onClose when close button pressed', () => {
        const onClose = jest.fn();
        render(<PicoYPlacaModal visible={true} onClose={onClose} />);
        fireEvent.press(screen.getByTestId('pyp-close'));
        expect(onClose).toHaveBeenCalled();
    });

    it('can switch to moto vehicle type and save', () => {
        const onSave = jest.fn();
        render(
            <PicoYPlacaModal visible={true} onClose={jest.fn()} onSave={onSave} />,
        );
        fireEvent.press(screen.getByTestId('pyp-vehicle-moto'));
        fireEvent.changeText(screen.getByTestId('pyp-plate-input'), 'XYZ789');
        fireEvent.press(screen.getByTestId('pyp-check-btn'));
        expect(onSave).toHaveBeenCalled();
        expect(onSave.mock.calls[0][0].vehicle).toBe('moto');
    });

    it('can switch to Medellín city and save', () => {
        const onSave = jest.fn();
        render(
            <PicoYPlacaModal visible={true} onClose={jest.fn()} onSave={onSave} />,
        );
        fireEvent.press(screen.getByTestId('pyp-city-medellin'));
        fireEvent.changeText(screen.getByTestId('pyp-plate-input'), 'AAA006');
        fireEvent.press(screen.getByTestId('pyp-check-btn'));
        expect(onSave).toHaveBeenCalled();
        expect(onSave.mock.calls[0][0].city).toBe('medellin');
    });
});
