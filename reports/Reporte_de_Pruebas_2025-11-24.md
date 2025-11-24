# Reporte de Pruebas - 2025-11-24

## Pruebas Unitarias

- Resumen
  - Suites: 5
  - Estado: 100% ✅
  - Tiempo total: ~1.1s
  - Cobertura:
    - Líneas: 65.52%
    - Sentencias: 64.85%
    - Funciones: 55.45%
    - Branches: 60.78%

- Casos ejecutados
  - App.test.tsx
    - ✅ renders correctly (tiempo: N/D)
    - ✅ abre OTP al presionar el botón en Home (tiempo: N/D)
    - ✅ en Android, autofill verifica y cierra el modal (tiempo: N/D)
  - HomeScreen.test.tsx
    - ✅ llama onOpenOtp y muestra "Abriendo..." al presionar (tiempo: N/D)
    - ✅ deshabilita el botón cuando isOtpVisible=true (tiempo: N/D)
    - ✅ renderiza secciones visibles y encabezados (tiempo: N/D)
    - ✅ navega a Mi Bolsillo desde la tarjeta (tiempo: N/D)
    - ✅ renderiza etiquetas de la grilla (tiempo: N/D)
    - ✅ RNTL: muestra "Abriendo..." al presionar Abrir OTP (tiempo: N/D)
    - ✅ RNTL: navega a Mi Bolsillo al presionar la tarjeta (tiempo: N/D)
  - MiBolsillo.test.tsx
    - ✅ renderiza y muestra sección Transferir por defecto (tiempo: N/D)
    - ✅ cambia a la pestaña Recargar y muestra botón PSE (tiempo: N/D)
    - ✅ cambia a la pestaña Movimientos y muestra lista de transacciones (tiempo: N/D)
    - ✅ validación de documento y habilitación de envío (CC) (tiempo: N/D)
    - ✅ bloquea envío cuando el monto es mayor o igual al saldo (tiempo: N/D)
    - ✅ CE con documento corto mantiene botón deshabilitado (tiempo: N/D)
    - ✅ botón "Enviar a favoritos" inicia deshabilitado cuando no hay favoritos (tiempo: N/D)
    - ✅ RNTL: favoritos cargados habilitan botón y abre modal (tiempo: N/D)
    - ✅ RNTL: habilita envío con CC y doc válido (tiempo: N/D)
  - OtpModal.test.tsx
    - ✅ autoverifica con seedCode y cierra cuando onVerify=true (tiempo: N/D)
    - ✅ autoverifica con seedCode y no cierra cuando onVerify=false (tiempo: N/D)
  - OtpInput.autofill.test.tsx
    - ✅ fills and calls onComplete when seedCode has 6 digits (tiempo: N/D)
    - ✅ clears manual input and applies seedCode (tiempo: N/D)

- Errores
  - No se registraron fallos en pruebas unitarias en la corrida final.
  - Nota: tiempos por prueba no se exponen con la configuración actual de Jest; se pueden habilitar con reporteros especializados si se requiere.

## Pruebas End-to-End (E2E)

- Entorno y capacidades
  - iOS: `iPhone 16` iOS `18.1` (`udid`: `B82B101C-26C9-4B8A-9031-ED406810894B`)
  - Android: `Android Emulator` (`udid`: `emulator-5554`)
  - Capacidades centralizadas en `capabilities.json` y referenciadas por `wdio.*.conf.js`

- Flujos probados
  - iOS
    - App launch: verifica presencia de `open-otp`
    - OTP modal: abre/cierra; ingreso de 6 dígitos y verificación cierran modal
  - Android
    - App launch: verifica presencia de `open-otp` (fallback por texto "Abrir OTP")
    - OTP modal: abre/cierra; ingreso de 6 dígitos y verificación cierran modal

- Resultados por escenario
  - iOS
    - ✅ launches and shows open-otp button — 1.5s
    - ✅ abre y cierra el modal OTP — parte del suite `OTP Modal iOS`
    - ✅ ingresa código y verifica cierre — 19.9s
    - Total iOS: 2/2 passed, ~56s
  - Android
    - ✅ launches and shows open-otp button — 5.7s
    - ✅ abre y cierra el modal OTP — parte del suite `OTP Modal Android`
    - ✅ ingresa código y verifica cierre — 33.8s
    - Total Android: 2/2 passed, ~58s

- Evidencias (extracto de logs)

```
[./ios/build/Build/Products/Debug-iphonesimulator/TerpelPoC.app iOS #0-0] 1 passing (1.5s)
[./ios/build/Build/Products/Debug-iphonesimulator/TerpelPoC.app iOS #0-1] 2 passing (19.9s)
Spec Files:      2 passed, 2 total (100% completed) in 00:00:56
```

```
[./android/app/build/outputs/apk/debug/app-debug.apk Android #0-0] 1 passing (5.7s)
[./android/app/build/outputs/apk/debug/app-debug.apk Android #0-1] 2 passing (33.8s)
Spec Files:      2 passed, 2 total (100% completed) in 00:00:58
```

- Tiempos de respuesta
  - iOS: ~56s total (por archivo: 1.5s y ~20s)
  - Android: ~58s total (por archivo: 5.7s y ~34s)

- Errores y reproducción
  - Android inicial: `adb: device unauthorized`
    - Reproducción: dispositivo/emulador no autorizado con ADB; creación de sesión falla al consultar `ro.build.version.sdk`.
    - Solución aplicada: `adb kill-server && adb start-server`; confirmar autorización del emulador; reintentar ejecución.
    - Ajuste adicional: `waitForExist` de `~open-otp` aumentado a `15000ms` en specs Android.

## Resumen Ejecutivo

- Éxito total
  - Unitarias: 100% ✅
  - E2E: 100% ✅
  - Global: 100% ✅

- Problemas críticos identificados
  - Autorización ADB en Android (no autorizado) — mitigado y documentado.

- Recomendaciones
  - CI/Pre-run Android: reiniciar ADB (`adb kill-server && adb start-server`) y verificar autorización.
  - Aumentar timeouts de arranque en Android para dispositivos lentos.
  - Si se requiere tiempo por caso unitario: integrar reportero Jest con métricas por prueba.

- Métricas de rendimiento
  - E2E total: ~114s (iOS ~56s, Android ~58s)
  - Unitarias: ~1.1s
  - Cobertura líneas: 65.52%; branches: 60.78%; funciones: 55.45%; sentencias: 64.85%
