# AeroUtil

App Expo para aviacion general en Argentina. Centraliza enlaces operativos, METAR, calculadoras, bitacora local, vencimientos, reservas y flujo SOS.

## Target de despliegue

El target principal del proyecto es `iOS + Android` usando `EAS Build`.

- `Expo Go` queda como entorno de desarrollo y QA manual.
- `Web` queda fuera del alcance del release actual.

## Requisitos

- `Node.js >= 20.19`
- `npm >= 10`

## Instalacion

```bash
npm install
```

## Desarrollo

```bash
npm run start
```

Atajos utiles:

```bash
npm run android
npm run ios
npm run typecheck
```

## Release

Preview interna:

```bash
npm run release:preview
```

Build de produccion:

```bash
npm run release:android
npm run release:ios
```

Submit a stores:

```bash
npm run submit:android
npm run submit:ios
```

## Notas operativas

- La primera vez que ejecutes `npx eas build`, Expo te va a pedir iniciar sesion y vincular o crear el proyecto EAS.
- El archivo `eas.json` ya deja preparados los perfiles `preview` y `production`.
- La app no necesita backend ni variables de entorno obligatorias.
- La ubicacion se usa solo para:
  - detectar aeropuertos cercanos
  - adjuntar coordenadas al mensaje SOS
- Los datos operativos siguen dependiendo de fuentes externas y oficiales:
  - `aviationweather.gov` para METAR
  - `EANA / ANAC / SMN / FAA` para consultas abiertas en navegador
