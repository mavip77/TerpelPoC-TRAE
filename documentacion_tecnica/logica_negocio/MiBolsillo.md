# MiBolsillo

- Fecha: 2025-11-27
- Autor: Equipo TerpelPoC

## Propósito y funcionalidad
- Gestiona el flujo de “Mi Bolsillo”: transferencias, recargas, historial y favoritos (CRUD).
- Persiste favoritos de forma segura (alias, tipo y número de documento, foto opcional) y permite transferir rápidamente a un favorito.

## Diagrama de flujo (favoritos)
```
Usuario ingresa datos destinatario → Confirmar →
  ¿Existe favorito? → Sí → Actualizar alias/foto
                    → No → Crear favorito
→ Guardar en Keychain → Actualizar estado UI → Mostrar confirmación
```

## Requisitos de entrada/salida
- Entradas:
  - `recipientName` (string)
  - `docType` ('CC' | 'CE')
  - `docNumber` (string numérica)
  - `recipientPhotoUri` (string, URL opcional)
  - `monto` / `favAmount` (string numérica)
- Salidas:
  - Actualización de estado (`favoritos`, `saldo`, modales)
  - Persistencia en almacenamiento seguro (lista de `Favorito`)

## Dependencias
- `react`, `react-native` (UI y estado)
- `react-native-keychain` (almacenamiento seguro)
- `react-native-vector-icons/MaterialCommunityIcons` (iconos)
- `react-native-modal` (modales)

## Detalles técnicos
- Modelo `Favorito`:
  - `{ name: string; docType: 'CC' | 'CE'; docNumber: string; photoUri?: string }` (`src/screens/MiBolsillo.tsx:46`)
- CRUD:
  - Crear/Actualizar: dentro del flujo de envío (`src/screens/MiBolsillo.tsx:115-133`)
  - Eliminar: acción en cada item (`src/screens/MiBolsillo.tsx:807-824`)
  - Editar: modal edición (`src/screens/MiBolsillo.tsx:662-718`)
- Accesibilidad para E2E:
  - Ejemplos: `tab-transferir`, `transfer-name-input`, `transfer-doc-input`, `transfer-photo-input`, `open-fav-list`, `fav-edit-...`, `fav-delete-...`

## Eventos y navegación
- Apertura modales: lista, confirmación, edición.
- Transferencias actualizan `saldo` y muestran `Alert` de éxito.

## Observaciones de rendimiento
- Inputs numéricos sanitizan caracteres.
- Filtrado de favoritos por búsqueda (`favSearch`).

