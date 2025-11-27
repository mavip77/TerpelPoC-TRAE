# HomeScreen

- Fecha: 2025-11-27
- Autor: Equipo TerpelPoC

## Propósito y funcionalidad
- Pantalla de inicio: accesos a funcionalidades (Cashback, Mi Bolsillo, OTP modal).

## Diagrama de navegación
```
Home → (open-cashback) → CashbackScreen (cashback-back) → Home
```

## Requisitos de entrada/salida
- Entradas: taps sobre tarjetas/botones.
- Salidas: navegación a pantallas y apertura de modales.

## Dependencias
- `react`, `react-native`
- `react-navigation` (stack)

## Detalles técnicos
- ID accesible para abrir Cashback: `open-cashback` (`src/screens/HomeScreen.tsx:167-170`).
- Estilos en `src/styles/HomeStyles.ts`.

