# OtpModal

- Fecha: 2025-11-27
- Autor: Equipo TerpelPoC

## Propiedades y métodos
- Props típicas (ejemplo): `visible: boolean`, `onClose: () => void`, `onVerify: (code: string) => void`.
- Métodos internos: control de inputs, cierre automático en iOS con `oneTimeCode`.

## Ejemplos de uso
```tsx
<OtpModal visible={open} onClose={close} onVerify={handleVerify} />
```

## Requisitos de estilo
- Consistentes con `HomeStyles` y paleta `COLORS`.

## Eventos emitidos
- `onVerify` al completar el código.
- `onClose` al cerrar el modal.

## Dependencias
- `react`, `react-native`

