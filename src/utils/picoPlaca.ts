/**
 * Pico y Placa logic for Colombian cities.
 *
 * Rules vigentes (2025-2026):
 *
 * BOGOTÁ – Carros particulares (último dígito de la placa):
 *   Días impares del mes → pueden circular placas terminadas en 1,2,3,4,5
 *                        → RESTRINGIDAS placas terminadas en 6,7,8,9,0
 *   Días pares del mes   → pueden circular placas terminadas en 6,7,8,9,0
 *                        → RESTRINGIDAS placas terminadas en 1,2,3,4,5
 *   Horario: 6:00 a.m. a 9:00 p.m. Lunes a viernes (excepto festivos).
 * BOGOTÁ – Motos: sin restricción general.
 *
 * MEDELLÍN – Carros particulares (último dígito) y motos (primer dígito):
 *   Lun: 1,7 | Mar: 0,3 | Mié: 4,6 | Jue: 5,9 | Vie: 2,8 | Sáb/Dom: libre
 *   Horario: 5:00 a.m. a 8:00 p.m. Lunes a viernes.
 */

export type VehicleType = 'carro' | 'moto';
export type City = 'bogota' | 'medellin';

export interface PicoPlacaResult {
    restricted: boolean;
    message: string;
    /** The relevant digit used for the check (last for carros, first for motos in Medellín) */
    digit: string;
    dayName: string;
}

const DAY_NAMES = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
];

/**
 * Medellín restriction: day of week (1=Mon…5=Fri) → restricted digits.
 * Applies to carros (último dígito) and motos (primer dígito).
 */
const MEDELLIN_DIGITS: Record<number, number[]> = {
    1: [1, 7], // Lunes
    2: [0, 3], // Martes
    3: [4, 6], // Miércoles
    4: [5, 9], // Jueves
    5: [2, 8], // Viernes
};

/** Bogotá: digits restricted on odd day-of-month (6,7,8,9,0) */
const BOGOTA_RESTRICTED_ODD_DAY = [6, 7, 8, 9, 0];
/** Bogotá: digits restricted on even day-of-month (1,2,3,4,5) */
const BOGOTA_RESTRICTED_EVEN_DAY = [1, 2, 3, 4, 5];

function getLastDigit(plate: string): number | null {
    const cleaned = plate.replace(/[^0-9]/g, '');
    if (cleaned.length === 0) {
        return null;
    }
    return Number(cleaned[cleaned.length - 1]);
}

function getFirstDigit(plate: string): number | null {
    const cleaned = plate.replace(/[^0-9]/g, '');
    if (cleaned.length === 0) {
        return null;
    }
    return Number(cleaned[0]);
}

export function checkPicoPlaca(
    vehicle: VehicleType,
    city: City,
    plate: string,
    date?: Date,
): PicoPlacaResult {
    const now = date ?? new Date();
    const dayOfWeek = now.getDay(); // 0=Sun … 6=Sat
    const dayOfMonth = now.getDate(); // 1–31
    const dayName = DAY_NAMES[dayOfWeek];

    // Determine the relevant digit based on city + vehicle
    const relevantDigit =
        city === 'medellin' && vehicle === 'moto'
            ? getFirstDigit(plate)
            : getLastDigit(plate);

    const digitSource =
        city === 'medellin' && vehicle === 'moto' ? 'primer' : 'último';

    if (relevantDigit === null) {
        return {
            restricted: false,
            message: 'Placa inválida. Ingresa al menos un número.',
            digit: '-',
            dayName,
        };
    }

    const digitStr = String(relevantDigit);

    // Weekends: no restriction for either city
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return {
            restricted: false,
            message: `¡Hoy ${dayName} no hay pico y placa! Puedes circular libremente.`,
            digit: digitStr,
            dayName,
        };
    }

    // 1-indexed weekday (Mon=1 … Fri=5)
    const weekday = dayOfWeek;

    // ── BOGOTÁ ──
    if (city === 'bogota') {
        if (vehicle === 'moto') {
            return {
                restricted: false,
                message: `En Bogotá las motos no tienen pico y placa. ¡Circula libremente hoy ${dayName}!`,
                digit: digitStr,
                dayName,
            };
        }

        // Odd/even day of month determines which plates are restricted
        const isOddDay = dayOfMonth % 2 !== 0;
        const restrictedDigits = isOddDay
            ? BOGOTA_RESTRICTED_ODD_DAY // odd day → 6,7,8,9,0 restricted
            : BOGOTA_RESTRICTED_EVEN_DAY; // even day → 1,2,3,4,5 restricted

        const restricted = restrictedDigits.includes(relevantDigit);
        const dayType = isOddDay ? 'impar' : 'par';

        return {
            restricted,
            message: restricted
                ? `🚫 Hoy ${dayName} ${dayOfMonth} (día ${dayType}) tu carro con placa terminada en ${digitStr} tiene pico y placa en Bogotá (6:00 a.m. – 9:00 p.m.).`
                : `✅ Hoy ${dayName} ${dayOfMonth} (día ${dayType}) tu carro con placa terminada en ${digitStr} NO tiene pico y placa en Bogotá.`,
            digit: digitStr,
            dayName,
        };
    }

    // ── MEDELLÍN (carros y motos comparten tabla de dígitos) ──
    const restricted = MEDELLIN_DIGITS[weekday]?.includes(relevantDigit) ?? false;
    const vehicleLabel = vehicle === 'carro' ? 'carro' : 'moto';
    const plateRef =
        vehicle === 'moto'
            ? `placa con ${digitSource} dígito ${digitStr}`
            : `placa terminada en ${digitStr}`;

    return {
        restricted,
        message: restricted
            ? `🚫 Hoy ${dayName} tu ${vehicleLabel} con ${plateRef} tiene pico y placa en Medellín (5:00 a.m. – 8:00 p.m.).`
            : `✅ Hoy ${dayName} tu ${vehicleLabel} con ${plateRef} NO tiene pico y placa en Medellín.`,
        digit: digitStr,
        dayName,
    };
}
