import { checkPicoPlaca } from '../src/utils/picoPlaca';

describe('checkPicoPlaca – logic', () => {
    // Helper: create a Date for a specific weekday
    // 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
    function dateForDay(day: number): Date {
        // 2025-01-06 is a Monday
        const base = new Date(2025, 0, 6);
        const offset = day === 0 ? 6 : day - 1;
        const d = new Date(base);
        d.setDate(d.getDate() + offset);
        return d;
    }

    /** Create a Date that falls on a specific weekday AND has the given day-of-month parity */
    function dateForDayAndParity(
        weekday: number,
        oddDay: boolean,
    ): Date {
        // Start from dateForDay, then advance by 7 until parity matches
        let d = dateForDay(weekday);
        for (let i = 0; i < 60; i++) {
            const isOdd = d.getDate() % 2 !== 0;
            if (isOdd === oddDay) return d;
            d = new Date(d);
            d.setDate(d.getDate() + 7);
        }
        return d;
    }

    // ──────────────────────────────────
    // BOGOTÁ – carros (día par/impar del mes)
    // ──────────────────────────────────

    it('Bogotá carro: odd day restricts plates 6,7,8,9,0', () => {
        const oddMonday = dateForDayAndParity(1, true);
        expect(
            checkPicoPlaca('carro', 'bogota', 'AAA 006', oddMonday).restricted,
        ).toBe(true);
        expect(
            checkPicoPlaca('carro', 'bogota', 'AAA 007', oddMonday).restricted,
        ).toBe(true);
        expect(
            checkPicoPlaca('carro', 'bogota', 'AAA 008', oddMonday).restricted,
        ).toBe(true);
        expect(
            checkPicoPlaca('carro', 'bogota', 'AAA 009', oddMonday).restricted,
        ).toBe(true);
        expect(
            checkPicoPlaca('carro', 'bogota', 'AAA 000', oddMonday).restricted,
        ).toBe(true);
    });

    it('Bogotá carro: odd day allows plates 1,2,3,4,5', () => {
        const oddTue = dateForDayAndParity(2, true);
        expect(
            checkPicoPlaca('carro', 'bogota', 'AAA 001', oddTue).restricted,
        ).toBe(false);
        expect(
            checkPicoPlaca('carro', 'bogota', 'AAA 005', oddTue).restricted,
        ).toBe(false);
    });

    it('Bogotá carro: even day restricts plates 1,2,3,4,5', () => {
        const evenWed = dateForDayAndParity(3, false);
        expect(
            checkPicoPlaca('carro', 'bogota', 'AAA 001', evenWed).restricted,
        ).toBe(true);
        expect(
            checkPicoPlaca('carro', 'bogota', 'AAA 002', evenWed).restricted,
        ).toBe(true);
        expect(
            checkPicoPlaca('carro', 'bogota', 'AAA 003', evenWed).restricted,
        ).toBe(true);
        expect(
            checkPicoPlaca('carro', 'bogota', 'AAA 004', evenWed).restricted,
        ).toBe(true);
        expect(
            checkPicoPlaca('carro', 'bogota', 'AAA 005', evenWed).restricted,
        ).toBe(true);
    });

    it('Bogotá carro: even day allows plates 6,7,8,9,0', () => {
        const evenThu = dateForDayAndParity(4, false);
        expect(
            checkPicoPlaca('carro', 'bogota', 'AAA 006', evenThu).restricted,
        ).toBe(false);
        expect(
            checkPicoPlaca('carro', 'bogota', 'AAA 000', evenThu).restricted,
        ).toBe(false);
    });

    it('Bogotá carro: message includes day number and parity', () => {
        const oddFri = dateForDayAndParity(5, true);
        const r = checkPicoPlaca('carro', 'bogota', 'AAA 008', oddFri);
        expect(r.restricted).toBe(true);
        expect(r.message).toContain('impar');
        expect(r.message).toContain('Bogotá');
    });

    // ──────────────────────────────────
    // BOGOTÁ – motos (sin restricción)
    // ──────────────────────────────────

    it('Bogotá motos never restricted', () => {
        for (let d = 1; d <= 5; d++) {
            const r = checkPicoPlaca('moto', 'bogota', 'AAA 001', dateForDay(d));
            expect(r.restricted).toBe(false);
        }
    });

    // ──────────────────────────────────
    // Weekends (ambas ciudades)
    // ──────────────────────────────────

    it('No restriction on Saturday', () => {
        const r = checkPicoPlaca('carro', 'bogota', 'AAA 003', dateForDay(6));
        expect(r.restricted).toBe(false);
        expect(r.dayName).toBe('Sábado');
    });

    it('No restriction on Sunday', () => {
        const r = checkPicoPlaca('carro', 'medellin', 'AAA 001', dateForDay(0));
        expect(r.restricted).toBe(false);
        expect(r.dayName).toBe('Domingo');
    });

    // ──────────────────────────────────
    // MEDELLÍN – carros (último dígito)
    // ──────────────────────────────────

    it('Medellín carro: Monday restricts 1,7', () => {
        expect(
            checkPicoPlaca('carro', 'medellin', 'AAA 001', dateForDay(1)).restricted,
        ).toBe(true);
        expect(
            checkPicoPlaca('carro', 'medellin', 'AAA 007', dateForDay(1)).restricted,
        ).toBe(true);
    });

    it('Medellín carro: Monday does NOT restrict 0', () => {
        expect(
            checkPicoPlaca('carro', 'medellin', 'AAA 000', dateForDay(1)).restricted,
        ).toBe(false);
    });

    it('Medellín carro: Tuesday restricts 0,3', () => {
        expect(
            checkPicoPlaca('carro', 'medellin', 'AAA 000', dateForDay(2)).restricted,
        ).toBe(true);
        expect(
            checkPicoPlaca('carro', 'medellin', 'AAA 003', dateForDay(2)).restricted,
        ).toBe(true);
    });

    it('Medellín carro: Wednesday restricts 4,6', () => {
        expect(
            checkPicoPlaca('carro', 'medellin', 'AAA 004', dateForDay(3)).restricted,
        ).toBe(true);
        expect(
            checkPicoPlaca('carro', 'medellin', 'AAA 006', dateForDay(3)).restricted,
        ).toBe(true);
    });

    it('Medellín carro: Thursday restricts 5,9', () => {
        expect(
            checkPicoPlaca('carro', 'medellin', 'AAA 005', dateForDay(4)).restricted,
        ).toBe(true);
        expect(
            checkPicoPlaca('carro', 'medellin', 'AAA 009', dateForDay(4)).restricted,
        ).toBe(true);
    });

    it('Medellín carro: Friday restricts 2,8', () => {
        expect(
            checkPicoPlaca('carro', 'medellin', 'AAA 002', dateForDay(5)).restricted,
        ).toBe(true);
        expect(
            checkPicoPlaca('carro', 'medellin', 'AAA 008', dateForDay(5)).restricted,
        ).toBe(true);
    });

    // ──────────────────────────────────
    // MEDELLÍN – motos (PRIMER dígito)
    // ──────────────────────────────────

    it('Medellín moto uses FIRST digit of plate', () => {
        // Plate "1AB 23" → first digit = 1, restricted on Monday
        const r = checkPicoPlaca('moto', 'medellin', '1AB 23', dateForDay(1));
        expect(r.restricted).toBe(true);
        expect(r.digit).toBe('1');
    });

    it('Medellín moto: Monday restricts first digit 1,7', () => {
        expect(
            checkPicoPlaca('moto', 'medellin', '7XY 00', dateForDay(1)).restricted,
        ).toBe(true);
    });

    it('Medellín moto: Tuesday restricts first digit 0,3', () => {
        expect(
            checkPicoPlaca('moto', 'medellin', '0AB 12', dateForDay(2)).restricted,
        ).toBe(true);
        expect(
            checkPicoPlaca('moto', 'medellin', '3AB 12', dateForDay(2)).restricted,
        ).toBe(true);
    });

    it('Medellín moto: first digit 5 NOT restricted on Monday', () => {
        expect(
            checkPicoPlaca('moto', 'medellin', '5XY 00', dateForDay(1)).restricted,
        ).toBe(false);
    });

    it('Medellín moto message says "primer dígito"', () => {
        const r = checkPicoPlaca('moto', 'medellin', '1AB 23', dateForDay(1));
        expect(r.message).toContain('primer dígito');
    });

    // ──────────────────────────────────
    // Edge cases
    // ──────────────────────────────────

    it('Returns invalid for plate with no digits', () => {
        const r = checkPicoPlaca('carro', 'bogota', 'ABCDEF', dateForDay(1));
        expect(r.restricted).toBe(false);
        expect(r.message).toContain('inválida');
    });
});
