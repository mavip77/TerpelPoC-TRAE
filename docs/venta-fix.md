# Corrección de error de venta

## Causa raíz
- No existía validación de monto de redención y se permitían entradas inválidas que podían producir inconsistencias de negocio.

## Cambios realizados
- Se agregó utilitario de transacciones (`src/utils/transactions.ts`) para sanitizar el monto, validar contra saldo disponible y aplicar la redención de forma determinística.
- Se integró la validación y aplicación en `CashbackScreen` con retroalimentación de errores de usuario.
- Se añadieron pruebas unitarias (`__tests__/Transactions.test.ts`) para los casos límite y secuencias de deducción.
- Se ajustó configuración de Jest para ignorar pruebas E2E en el runner unitario.

## Medidas preventivas
- Sanitización y validación del monto antes de aplicar cualquier operación.
- Pruebas unitarias que cubren montos inválidos, excedentes y aplicación secuencial.
- Separación de lógica en utilitarios puros, facilitando auditoría y pruebas.

## Impacto
- No se modifica almacenamiento histórico ni otras funcionalidades.
- Cumple buenas prácticas: entradas validadas, lógica pura testeada, cambios mínimos y reversibles.

## Lecciones aprendidas
- Centralizar validaciones de negocio y mantenerlas testeadas reduce errores y facilita mantenimiento.
- Ignorar directorios de E2E en Jest previene ruido en CI cuando los E2E se ejecutan con herramientas dedicadas.

