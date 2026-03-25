# Stack Tecnológico Detallado - Proyecto TerpelPoC

Este documento proporciona un análisis exhaustivo de las tecnologías, frameworks y herramientas utilizadas en el proyecto TerpelPoC.

## 1. Resumen Ejecutivo
El proyecto es una aplicación móvil nativa desarrollada con **React Native CLI**, priorizando el rendimiento nativo, la seguridad y la extensibilidad. Se utiliza **TypeScript** para garantizar la robustez del código y **React Navigation 7** para una navegación fluida y moderna.

## 2. Frontend Mobile (App)

### Framework Principal
- **React Native**: v0.76.9
  - **Propósito**: Desarrollo de la interfaz y lógica multiplataforma.
  - **Ventajas**: Acceso directo a APIs nativas, rendimiento cercano al nativo (especialmente con Hermes habilitado), y compatibilidad con la Nueva Arquitectura (Fabric/TurboModules).
  - **Configuración**: Inicializado con CLI (no Expo) para control total sobre dependencias nativas.

### Lenguaje
- **TypeScript**: v5.0.4
  - **Propósito**: Tipado estático y seguridad en tiempo de desarrollo.
  - **Ventajas**: Previene errores comunes (null reference, tipos incorrectos), mejora la autocompletación en el IDE y facilita la refactorización.
  - **Configuración**: `tsconfig.json` extiende `@react-native/typescript-config` con modo estricto.

### Navegación
- **React Navigation**: v7.x
  - **Core**: `@react-navigation/native` v7.0.14
  - **Stack**: `@react-navigation/native-stack` v7.1.4
  - **Propósito**: Gestión del historial de navegación y transiciones.
  - **Ventajas**:
    - **Native Stack**: Utiliza primitivas nativas (`UINavigationController` en iOS, `Fragment` en Android) para transiciones a 60fps y mejor manejo de memoria.
    - **v7**: Última versión estable con soporte mejorado para TypeScript y Deep Linking.

### Gestión de Estado
- **React Hooks** (`useState`, `useContext`, `useReducer`)
  - **Propósito**: Manejo del estado local y compartido simple.
  - **Justificación**: Para la complejidad actual de la PoC, no se requiere una librería externa como Redux o Zustand, manteniendo el bundle ligero.

### Componentes UI y Estilos
- **React Native Vector Icons**: v10.3.0
  - **Propósito**: Iconografía vectorial (MaterialCommunityIcons, Ionicons, etc.).
- **React Native Safe Area Context**: v5.0.0
  - **Propósito**: Manejo correcto de notches, dynamic islands y barras de navegación en dispositivos modernos.
- **React Native Screens**: v4.8.0
  - **Propósito**: Optimización de vistas nativas para navegación.
- **FastImage**: `@d11/react-native-fast-image` v8.9.2
  - **Propósito**: Renderizado eficiente de imágenes con caché agresivo.
  - **Ventajas**: Evita parpadeos y problemas de memoria comunes con el componente `<Image />` estándar.

### Utilidades Específicas
- **OTP Verify**: `react-native-otp-verify` v1.1.8
  - **Propósito**: Lectura automática de SMS para autocompletado de códigos OTP (Android).
- **Keychain**: `react-native-keychain` v10.0.0
  - **Propósito**: Almacenamiento seguro de credenciales.
  - **Ventajas**: Usa Keychain (iOS) y Keystore (Android) para encriptación a nivel de hardware/OS.

## 3. Configuración Nativa

### Android
- **Build System**: Gradle 8.x con AGP (Android Gradle Plugin).
- **Versiones SDK**:
  - `minSdkVersion`: 24 (Android 7.0) - Garantiza compatibilidad con ~95% de dispositivos.
  - `compileSdkVersion`: 35 (Android 15) - Compila con las últimas APIs.
  - `targetSdkVersion`: 34 (Android 14) - Cumple con requisitos de Play Store.
- **Lenguaje Nativo**: Kotlin 1.9.25.
- **NDK**: v26.1.10909125 (Requerido para Hermes y C++ modules).

### iOS
- **Gestor de Dependencias**: CocoaPods.
- **Despliegue**: iOS 13.4+ (Estándar en RN 0.76).
- **Configuración**: Uso de `.xcworkspace` para gestión de pods y proyecto.

## 4. Testing y Calidad (QA)

### E2E (End-to-End)
- **Appium**: v2.11.0
  - **Propósito**: Motor de automatización de pruebas móviles.
  - **Drivers**:
    - `appium-uiautomator2-driver`: Para automatización Android.
    - `appium-xcuitest-driver`: Para automatización iOS.
- **WebdriverIO**: v9.20.1
  - **Propósito**: Cliente de pruebas y test runner.
  - **Ventajas**: Sintaxis moderna (async/await), integración con servicios de Appium y reportes detallados.
- **Reporting**:
  - `@wdio/allure-reporter`: Generación de reportes visuales detallados.
  - `@wdio/spec-reporter`: Salida legible en consola.

### Unit & Integration
- **Jest**: v29.6.3
  - **Propósito**: Pruebas unitarias de lógica JavaScript/TypeScript.
- **React Test Renderer**: v18.3.1
  - **Propósito**: Renderizado de componentes para pruebas de snapshots.

### Calidad de Código
- **ESLint**: v8.19.0
  - **Configuración**: `@react-native/eslint-config`.
  - **Propósito**: Linter para detectar errores y forzar reglas de estilo.
- **Prettier**: v2.8.8
  - **Propósito**: Formateador de código automático.

## 5. Herramientas de Desarrollo
- **Metro Bundler**: Empaquetador de JavaScript para React Native.
- **Babel**: Transpilador de JS/TS moderno a código compatible.
- **React Native CLI**: Herramienta de línea de comandos para build, run y gestión del proyecto.

## 6. Integraciones Externas (Servicios)
- **Azure DevOps**:
  - **Uso**: Gestión del ciclo de vida de la aplicación (ALM), repositorios Git, Pipelines de CI/CD y seguimiento de trabajo (Boards).
- **Figma MCP**:
  - **Uso**: Integración para lectura de diseños y especificaciones UI (actualmente en modo lectura).

## 7. Justificación de la Arquitectura
La elección de **React Native CLI** sobre Expo se basa en la necesidad de integrar módulos nativos específicos (como OTP Verify y configuraciones avanzadas de seguridad) que a menudo requieren acceso directo a los archivos `android/` e `ios/`.

El uso de **TypeScript** es no-negociable para un proyecto financiero/transaccional como este, donde la integridad de los datos es crítica.

La estrategia de pruebas con **Appium + WebdriverIO** desacopla las pruebas del código fuente de la aplicación (black-box testing), permitiendo validar el flujo real del usuario final tal como lo experimentaría en un dispositivo físico, lo cual es superior a los mocks excesivos en pruebas de integración.
