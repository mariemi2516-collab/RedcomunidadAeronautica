# Backend - Red de Comunidad Aeronautica

Backend Node.js + TypeScript con Express. **No usa base de datos**: todos los
endpoints leen y escriben sobre archivos JSON en `data/` y se inicializan a
partir de seeds en `src/seed/*.ts`.

## Stack

- Express 4
- TypeScript estricto
- JWT para auth (Bearer token)
- bcryptjs para hashes
- Persistencia en `data/*.json` con escrituras atómicas

## Estructura

```
src/
  config/                 configuración (puerto, JWT, precio, horas curso)
  controllers/            handlers HTTP por dominio
  middleware/             auth + suscripción + errores
  models/                 tipos TS (User, Subscription, Aerodromo, ...)
  repositories/           acceso a datos (JSON files via JsonStore)
  routes/                 routers Express por dominio
  seed/                   datos iniciales (pilotos + aeródromos)
  services/               lógica de negocio
  utils/                  hash, jwt, ids, errores
data/                     persistencia JSON (auto-creada)
```

## Scripts

```bash
npm install
npm run dev          # arranca con ts-node-dev
npm run build        # compila a dist/
npm run start        # ejecuta dist/index.js
npm run typecheck
npm run seed         # fuerza la carga de seeds
```

Variables `.env` (ver `.env.example`):

```
PORT=4000
JWT_SECRET=cambia-este-secreto-en-produccion
JWT_EXPIRES_IN=7d
SUBSCRIPTION_PRICE_USD=4
COURSE_TOTAL_HOURS=40
```

## Endpoints

Todas las respuestas son JSON. Las rutas privadas usan `Authorization: Bearer <token>`.

### Públicas

- `GET /api/health` — ping
- `GET /api/config` — precio mensual y horas totales del curso
- `GET /api/community` — feed de la comunidad

### Auth

- `POST /api/auth/register` — `{ email, password, name, role: "piloto" | "aerodromo" }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/auth/me` — perfil + suscripción

### Suscripción

- `GET /api/subscriptions/me`
- `POST /api/subscriptions/activate` — activa por 30 días (precio configurable, USD 4 por defecto)
- `POST /api/subscriptions/cancel`

### Mi Aeródromo (rol `aerodromo` para escribir)

- `GET /api/aerodromos` — listado público para la comunidad
- `GET /api/aerodromos/me` — registro propio
- `PUT /api/aerodromos/me` — crear / actualizar

### Vencimientos (requiere suscripción activa)

- `GET /api/vencimientos`
- `POST /api/vencimientos`
- `DELETE /api/vencimientos/:id`

### Vuelos (requiere suscripción activa)

- `GET /api/flights`
- `POST /api/flights`
- `DELETE /api/flights/:id`
- `GET /api/flights/settings` / `PUT /api/flights/settings` — `pricePerHourUsd`
- `GET /api/flights/progress` — horas voladas, restantes, costo total/gastado/restante para llegar a las 40 hs

### Comunidad

- `GET /api/community` — feed público
- `POST /api/community` — crea post (`text`, `imageDataUrl` con `data:image/...;base64,`)
- `POST /api/community/:id/like`
- `DELETE /api/community/:id` — sólo el autor

## Usuarios seed

| Email                       | Password   | Rol        | Suscripción |
| --------------------------- | ---------- | ---------- | ----------- |
| `juan.piloto@aero.test`     | `piloto123` | piloto     | activa      |
| `maria.piloto@aero.test`    | `piloto123` | piloto     | inactiva    |
| `lucas.piloto@aero.test`    | `piloto123` | piloto     | inactiva    |
| `moron@aero.test`           | `aero123`   | aerodromo  | activa      |
| `rosario@aero.test`         | `aero123`   | aerodromo  | inactiva    |

Para ver el sistema de paywall en acción, ingresá con `maria.piloto` o
`rosario` y luego activá la suscripción desde la pantalla **Plan**.
