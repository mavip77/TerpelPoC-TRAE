# OtpInput

- Fecha: 2025-11-27
- Autor: Equipo TerpelPoC

## Propiedades
- `length` (número de dígitos)
- `value` (string)
- `onChange(value: string)`
- Opcional: manejo de autofill iOS `textContentType="oneTimeCode"`.

## Ejemplo de uso
```tsx
<OtpInput length={6} value={code} onChange={setCode} />
```

## Requisitos de estilo
- Cajas con estados activo/inactivo, tipografía y colores según `COLORS`.

## Eventos
- Emite `onChange` por cada digitación.

## Dependencias
- `react`, `react-native`

