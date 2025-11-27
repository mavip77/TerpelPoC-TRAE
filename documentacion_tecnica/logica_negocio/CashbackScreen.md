# CashbackScreen

- Fecha: 2025-11-27
- Autor: Equipo TerpelPoC

## Propósito y funcionalidad
- Visualiza buckets de cashback, calcula redención según umbral y muestra alertas de vencimiento.
- Añade navegación “back” en el encabezado y permite redimir a puntos o al bolsillo.

## Diagrama de flujo (redención)
```
Usuario ingresa monto → Calcular
  Si < umbral → Redimir a puntos → Mostrar éxito
  Si ≥ umbral → Redimir al bolsillo → Mostrar éxito
```

## Requisitos de entrada/salida
- Entradas: `amount` (TextInput), interacción con botón “Redimir ahora”.
- Salidas: estado de redención, mensajes de éxito, listas de alertas.

## Dependencias
- `react`, `react-native`
- `react-native-vector-icons/MaterialCommunityIcons`
- `COLORS` constantes (`src/constants/HomeConstants`)

## Detalles técnicos
- Estado `buckets` inicial (`src/screens/CashbackScreen.tsx:158-161`).
- Botón back accesible: `cashback-back` (`src/screens/CashbackScreen.tsx:261-268`).
- Listas: movimientos y alertas de vencimiento (`src/screens/CashbackScreen.tsx:440-504`).

## Observaciones
- IDs y labels accesibles para E2E.
- Cálculo de umbral gobernado por constantes locales (ver pruebas unitarias).

