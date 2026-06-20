# CLAUDE.md — Lince CRM Backend

## Proyecto

Backend del CRM interno de Lince SA (empresa agropecuaria argentina). Gestiona leads/clientes captados principalmente desde ManyChat (Instagram/WhatsApp), cotizaciones de productos ganaderos (bloques de melaza PIPO), seguimiento de asesores comerciales y análisis de datos geográficos.

**Stack:** NestJS 11, MongoDB (Mongoose), TypeScript, JWT, Nodemailer, ExcelJS, PDFKit, YCloud WhatsApp API.

**Directorio:** `CRM-lince-back/`
**Frontend:** `CRM-lince/` (React + Vite + Redux, desplegado en Netlify)
**Base de datos:** MongoDB Atlas (cluster0.z3dpsyf.mongodb.net)

---

## Estructura del proyecto

```
src/
├── app.module.ts              # Módulo raíz, registra guards/filters/interceptors globales
├── main.ts                    # Bootstrap: CORS, Helmet, Swagger, ValidationPipe
├── config/
│   └── envs.ts                # Variables de entorno tipadas con env-var
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts   # Filter global de errores HTTP
│   ├── interceptors/
│   │   └── logging.interceptor.ts     # Logging de requests/responses
│   └── validators/
│       └── custom-validators.ts       # Validadores reutilizables (email, phone, mongoId)
├── services/
│   ├── database/              # Conexión MongoDB (providers pattern)
│   └── logger/
│       └── logger.ts          # Logger custom de NestJS
├── utils/
│   └── use.token.ts           # Decodificación JWT (usa jwt.decode, NO jwt.verify)
└── modules/
    ├── auth/                  # Login, AuthGuard global, JWT strategy (no usada)
    ├── users/                 # CRUD usuarios del sistema (asesores/admins)
    ├── customer/              # CRUD clientes/leads
    │   ├── follow-up/         # Sistema de seguimiento automático
    │   │   ├── messaging/     # Canales: email interno, YCloud WhatsApp, consola
    │   │   └── follow-up.rules.ts  # Reglas por estado del cliente
    │   └── utils/
    ├── analytics/             # Métricas, reportes PDF, geoestadísticas
    ├── satisfaction/          # Encuestas de satisfacción post-compra
    └── geo/                   # Geocodificación via Nominatim + IGN GeoServer
```

---

## Módulos principales

### Auth
- **Guard global:** `AuthGuard` aplicado en `APP_GUARD` → protege todos los endpoints.
- **Excepción pública:** `@Public()` decorator en endpoints sin autenticación.
- **Dos mecanismos de auth en paralelo:**
  1. Header `codrr_token` con token fijo `EXTERNAL_FIXED_TOKEN` → para integraciones externas (ManyChat).
  2. Cookie `Authentication` con JWT → para el frontend.
- `JwtStrategy` de Passport está declarada pero **nunca se usa** activamente.
- Token decodificado con `jwt.decode()` (sin verificar firma) — ver hallazgos.

### Clientes (Customer)
- Modelo con campos: nombre, apellido, teléfono, correo, actividad (CRIA/RECRIA/MIXTO/DISTRIBUIDOR), estado, siguiendo (asesor), producto, ubicación normalizada.
- `validateClientData()` en el servicio limpia y tolera datos sucios de ManyChat (placeholders `{{cuf_...}}`, valores nulos, etc.).
- `isReconsulta` se detecta automáticamente si el teléfono ya existe.
- Exportación a Excel con ExcelJS.

### Follow-up automático
- Reglas en `follow-up.rules.ts` por estado del cliente:
  - `NO_CONTESTO` → delay 24h → template `NO_RESPONSE_24H`
  - `SE_COTIZO_Y_PENDIENTE` → delay 48h → template `QUOTE_PENDING_48H`
  - `COMPRO` → delay 30 días → template `SATISFACTION_14D`
- `@Cron(EVERY_MINUTE)` procesa tareas pendientes.
- Canales disponibles: `INTERNAL_EMAIL`, `YCLOUD_WHATSAPP`, `CONSOLE`.
- Canal activo controlado por `FOLLOW_UP_AUTOMATION_ENABLED` y `YCLOUD_ENABLED`.
- Si la automatización está deshabilitada, los eventos aparecen en la UI como manuales.

### Analytics
- Endpoints: totales, evolución mensual, comparación anual, demanda de productos, estado de compras, follow-up events, resumen geográfico, heatmap, PDF, mapa SVG.
- Normalización de ubicaciones en background via Nominatim (con caché en memoria + retry TTL 12h).
- Genera PDF con PDFKit y mapa SVG de Argentina.

### Geo
- `GeoService.search()` → Nominatim OSM API con caché en memoria (TTL 1h).
- `argentinaProvincesGeoJson()` → IGN GeoServer (TTL 24h).

---

## Variables de entorno requeridas

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor |
| `MONGO_URI` | URI de MongoDB Atlas |
| `JWT_SECTRET` | Secreto para firmar JWTs (**typo intencional en el código**) |
| `FRONTEND_URL` | URL del frontend para CORS |
| `EXTERNAL_FIXED_TOKEN` | Token fijo para integraciones externas (ManyChat) |
| `NODE_ENV` | `development` o `production` |
| `FOLLOW_UP_AUTOMATION_ENABLED` | Habilita envío automático |
| `FOLLOW_UP_NOTIFY_*_EMAIL` | Emails de cada asesor |
| `MAILER_HOST/PORT/EMAIL/SECRET_KEY` | Configuración SMTP (Gmail) |
| `YCLOUD_API_KEY/BASE_URL/ENABLED` | API de WhatsApp YCloud |
| `YCLOUD_*_PHONE` | Números de WhatsApp por asesor |

**Ver** `env.template` para el listado completo.

---

## Convenciones y patrones del proyecto

- **Providers pattern de Mongoose:** Los modelos se registran como providers (`'CLIENT_MODEL'`, `'USER_MODEL'`, etc.) en archivos `*.providers.ts` y se inyectan con `@Inject('CLIENT_MODEL')`.
- **Guards globales:** `AuthGuard` en `APP_GUARD`, `HttpExceptionFilter` en `APP_FILTER`, `LoggingInterceptor` en `APP_INTERCEPTOR`.
- **DTOs:** Usan `class-validator` + `class-transformer`. La `ValidationPipe` global tiene `whitelist: true` y `transform: true`.
- **Enum hardcodeados:** Asesores (`EZEQUIEL`, `DENIS`, `MARTIN`, `JULIAN`, `SIN_ASIGNAR`), estados, actividades.
- **Mensajes de error en español:** Toda la capa de negocio responde en español.

---

## Comandos útiles

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build && npm run start:prod

# Tests (existen spec files pero están vacíos/incompletos)
npm test
```

---

## Notas para Claude

- El `JWT_SECTRET` tiene un typo histórico que está en el código real; no "corregirlo" sin actualizar también el `.env` y la documentación.
- Los templates de follow-up en `follow-up.rules.ts` son mensajes estáticos (no usan variables del cliente porque ManyChat los requería sin personalización).
- `validateClientData()` en `customer.service.ts` es tolerante a propósito: nunca rechaza un lead, solo limpia datos sucios. Esto es un requisito de negocio.
- La detección de `isReconsulta` usa el teléfono normalizado como clave de deduplicación.
- El campo `createdAt` en el schema de clientes es `immutable: false` a propósito para permitir importaciones con fechas históricas.
