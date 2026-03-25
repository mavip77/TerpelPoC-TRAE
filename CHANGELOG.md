# Changelog – TerpelPoC

Todos los cambios notables del proyecto se documentan en este archivo.

---

## [Unreleased] – 2026-03-25

### Nuevas funcionalidades

#### Pico y Placa – modal y banner (`src/utils/picoPlaca.ts`, `src/components/PicoYPlacaModal.tsx`)
- **Modal de consulta**: modal tipo bottom-sheet que se muestra al iniciar la app para que el usuario consulte si su vehículo tiene pico y placa.
  - Selector de tipo de vehículo (Carro / Moto).
  - Selector de ciudad (Bogotá / Medellín).
  - Campo de texto para número de placa (auto-mayúsculas, máx. 7 caracteres).
  - Botón **Guardar**: calcula el resultado con las reglas vigentes, envía los datos al Home y cierra el modal.
  - El usuario puede re-abrir el modal tocando el banner en el header.
- **Reglas implementadas**:
  - **Bogotá – Carros**: día par/impar del mes determina las placas restringidas.
    - Días impares → restringidas: 6, 7, 8, 9, 0. Días pares → restringidas: 1, 2, 3, 4, 5.
    - Horario: 6:00 a.m. – 9:00 p.m., lunes a viernes.
  - **Bogotá – Motos**: sin restricción general.
  - **Medellín – Carros (último dígito) y Motos (primer dígito)**:
    - Lunes: 1, 7 | Martes: 0, 3 | Miércoles: 4, 6 | Jueves: 5, 9 | Viernes: 2, 8.
    - Horario: 5:00 a.m. – 8:00 p.m., lunes a viernes.
  - Sábados y domingos: sin restricción.
- **Banner en el header del Home** (`src/screens/HomeScreen.tsx`, `src/styles/HomeStyles.ts`):
  - Se muestra después de guardar la consulta, dentro del header rojo.
  - **Con restricción**: fondo blanco con borde rojo, texto rojo "Hoy tienes pico y placa", ícono `car-off`.
  - **Sin restricción**: fondo verde semi-transparente, texto verde claro "Hoy NO tienes pico y placa", ícono `car-connected`.
  - Muestra ciudad, tipo de vehículo y placa debajo del título.
  - Ícono de lápiz para re-abrir el modal y cambiar datos.

#### Autenticación biométrica (`src/utils/biometricAuth.ts`)
- Nuevo utilitario con `getSupportedBiometry()` y `authenticateWithBiometrics()` usando `react-native-keychain`.
- Protege el acceso a **Mi Bolsillo** y **Cashback**: las 4 rutas de navegación requieren autenticación biométrica.
- Si el dispositivo no soporta biometría, muestra alerta y bloquea acceso.

#### Enmascaramiento de saldos (`src/screens/HomeScreen.tsx`)
- Las tarjetas de Mi Bolsillo y Cashback muestran `$ ****` por defecto.
- Al autenticarse exitosamente con biometría, se revelan los saldos reales (`$ 8.100`, `$ 18.500`).
- Si la biometría falla, los saldos permanecen enmascarados.

#### Cashback en Secciones (`src/screens/HomeScreen.tsx`)
- Se añadió **Cashback** como quinto ítem en la sección "Secciones".
- La grilla se convirtió en un `ScrollView` horizontal para acomodar 5 ítems.
- Estilo `gridIconFuchsia` para el ícono de Cashback.

#### Navegación desde sección Mi Bolsillo (`src/screens/HomeScreen.tsx`)
- El ítem "Mi bolsillo" en la sección Secciones ahora navega a la pantalla MiBolsillo (con autenticación biométrica).

### Cambios

#### OTP de 6 a 8 caracteres
- **Constante centralizada** (`src/constants/OtpConstants.ts`): `OTP_LENGTH = 8`.
- `OtpModal.tsx`: 5 referencias actualizadas para usar la constante.
- `OtpInput.tsx`: cajas de 38×48px con gap de 8px para que 8 dígitos quepan en pantallas ≥ 320px.
- `App.tsx`: regex de SMS cambiado a `\d{8}`.
- Tests unitarios y E2E actualizados para 8 dígitos.

### Correcciones de bugs

#### VirtualizedList nesting warning
- **HomeScreen.tsx**: reemplazados 2 `FlatList` dentro de `ScrollView` por `.map()`.
- **MiBolsillo.tsx**: reemplazados 2 `FlatList` dentro de `ScrollView` por `.map()`.

#### Ícono inválido "coin"
- El ícono `coin` no existe en `MaterialCommunityIcons`. Reemplazado por `star-circle` en 3 ubicaciones (HomeScreen ×2, MiBolsillo ×1).

### Archivos nuevos

| Archivo | Descripción |
|---------|-------------|
| `src/utils/picoPlaca.ts` | Lógica de pico y placa para Bogotá y Medellín |
| `src/components/PicoYPlacaModal.tsx` | Modal de consulta de pico y placa |
| `src/utils/biometricAuth.ts` | Utilitario de autenticación biométrica |
| `src/constants/OtpConstants.ts` | Constante `OTP_LENGTH = 8` |
| `__tests__/PicoPlaca.test.tsx` | 22 tests de lógica de pico y placa |
| `__tests__/PicoYPlacaModal.test.tsx` | 8 tests del modal de pico y placa |

### Archivos modificados

| Archivo | Cambios principales |
|---------|---------------------|
| `App.tsx` | Import PicoYPlacaModal, estado `picoPlacaData`, paso de datos al Home, regex SMS `\d{8}` |
| `src/screens/HomeScreen.tsx` | Banner pico y placa, biometría, enmascaramiento, Cashback en secciones, `.map()` en vez de FlatList |
| `src/screens/MiBolsillo.tsx` | `.map()` en vez de FlatList, ícono `star-circle` |
| `src/components/OtpModal.tsx` | Usa `OTP_LENGTH` constante |
| `src/components/OtpInput.tsx` | Cajas 38px, gap 8px, soporte dinámico de longitud |
| `src/styles/HomeStyles.ts` | Estilos banner pico y placa, `gridIconFuchsia`, `gridRow` horizontal |
| `__tests__/HomeScreen.test.tsx` | 17 tests (13 original + 4 banner pico y placa) |
| `__tests__/OtpModal.test.tsx` | Actualizado a 8 dígitos |
| `__tests__/OtpInput.autofill.test.tsx` | Actualizado a 8 dígitos |
| `tests/e2e/otp.android.spec.js` | Loop de 8 iteraciones |
| `tests/e2e/otp.ios.spec.js` | Loop de 8 iteraciones |

### Tests

- **Total tests unitarios pasando**: 58 (6 suites)
  - `HomeScreen.test.tsx`: 17 tests
  - `MiBolsillo.test.tsx`: 9 tests
  - `PicoPlaca.test.tsx`: 22 tests
  - `PicoYPlacaModal.test.tsx`: 8 tests
  - `OtpModal.test.tsx`: 2 tests
  - `OtpInput.autofill.test.tsx`: 2 tests
- Tests E2E (WDIO/Appium) actualizados pero se ejecutan fuera de Jest.

### Notas de infraestructura

- Puerto 8081 liberado múltiples veces durante la sesión de desarrollo.
- Build de Android exitoso en emulador y dispositivo físico tras liberar espacio en emulador (420 MB).
