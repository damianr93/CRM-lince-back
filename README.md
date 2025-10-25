# LinceCRM - Sistema de Gestión de Clientes

Sistema completo de gestión de clientes con seguimiento automático y mensajería integrada, desarrollado con NestJS y MongoDB.

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Módulos del Sistema](#-módulos-del-sistema)
- [Sistema de Mensajería Automática](#-sistema-de-mensajería-automática)
- [API Endpoints](#-api-endpoints)
- [Configuración de Variables de Entorno](#-configuración-de-variables-de-entorno)
- [Despliegue](#-despliegue)
- [Desarrollo](#-desarrollo)

## 🚀 Características Principales

### Gestión de Clientes
- **CRUD completo** de clientes con validaciones
- **Estados de seguimiento** automáticos
- **Importación masiva** desde Excel
- **Exportación de datos** en Excel
- **Búsqueda y filtrado** avanzado

### Sistema de Seguimiento Automático
- **Mensajería automática** basada en estados
- **Múltiples canales** de comunicación (WhatsApp, Email)
- **Plantillas personalizables** de mensajes
- **Programación inteligente** de seguimientos

### Análisis y Reportes
- **Dashboard de analytics** en tiempo real
- **Métricas de conversión** por estado
- **Reportes de satisfacción** del cliente
- **Estadísticas de mensajería**

### Autenticación y Seguridad
- **JWT Authentication** con refresh tokens
- **Guards de autorización** por roles
- **Validación de datos** con class-validator
- **CORS y seguridad** configurada

## 🏗️ Arquitectura del Sistema

```
LinceCRM Backend
├── 📁 src/
│   ├── 📁 modules/
│   │   ├── 👥 customer/          # Gestión de clientes
│   │   ├── 🔐 auth/              # Autenticación
│   │   ├── 📊 analytics/         # Análisis y reportes
│   │   ├── 😊 satisfaction/      # Encuestas de satisfacción
│   │   └── 👤 users/             # Gestión de usuarios
│   ├── 📁 common/                # Utilidades compartidas
│   ├── 📁 config/                # Configuración
│   └── 📁 services/              # Servicios globales
├── 📁 test/                      # Tests
└── 📁 dist/                      # Build de producción
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- **Node.js** 18+ 
- **MongoDB** 4.4+
- **npm** o **yarn**

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd linceCRMBack

# Instalar dependencias
npm install

# Configurar variables de entorno
cp ENV_EXAMPLE.md .env
# Editar .env con tus configuraciones

# Iniciar en desarrollo
npm run start:dev
```

### Scripts Disponibles
```bash
npm run start:dev      # Desarrollo con hot reload
npm run start:prod     # Producción
npm run build          # Compilar TypeScript
npm run test           # Ejecutar tests
npm run lint           # Linter
npm run format         # Formatear código
```

## 📦 Módulos del Sistema

### 👥 Customer Module
**Gestión completa de clientes**

**Funcionalidades:**
- CRUD de clientes con validaciones
- Estados de seguimiento automático
- Importación/exportación Excel
- Búsqueda y filtrado avanzado
- Sistema de seguimiento automático

**Estados de Cliente:**
- `PENDIENTE` - Cliente nuevo
- `DERIVADO_A_DISTRIBUIDOR` - Derivado a distribuidor
- `NO_CONTESTO` - No respondió
- `SE_COTIZO_Y_PENDIENTE` - Cotizó pero no compró
- `SE_COTIZO_Y_NO_INTERESO` - Cotizó pero no le interesa
- `COMPRO` - Cliente que compró

**Endpoints:**
```
GET    /clients              # Listar clientes
POST   /clients              # Crear cliente
GET    /clients/:id          # Obtener cliente
PATCH  /clients/:id          # Actualizar cliente
DELETE /clients/:id          # Eliminar cliente
POST   /clients/import       # Importar desde Excel
GET    /clients/export       # Exportar a Excel
```

### 🔐 Auth Module
**Sistema de autenticación JWT**

**Funcionalidades:**
- Login con JWT
- Refresh tokens
- Guards de autorización
- Decoradores de autenticación

**Endpoints:**
```
POST   /auth/login           # Iniciar sesión
POST   /auth/refresh         # Renovar token
POST   /auth/logout          # Cerrar sesión
```

### 📊 Analytics Module
**Análisis y métricas del sistema**

**Funcionalidades:**
- Dashboard de métricas
- Conversión por estados
- Estadísticas de mensajería
- Reportes de rendimiento

**Endpoints:**
```
GET    /analytics/dashboard  # Dashboard principal
GET    /analytics/conversion # Métricas de conversión
GET    /analytics/messaging  # Estadísticas de mensajería
```

### 😊 Satisfaction Module
**Encuestas de satisfacción**

**Funcionalidades:**
- Creación de encuestas
- Respuestas de clientes
- Análisis de satisfacción
- Reportes de feedback

**Endpoints:**
```
GET    /satisfaction         # Listar encuestas
POST   /satisfaction         # Crear encuesta
GET    /satisfaction/:id     # Obtener encuesta
PATCH  /satisfaction/:id     # Actualizar encuesta
```

### 👤 Users Module
**Gestión de usuarios del sistema**

**Funcionalidades:**
- CRUD de usuarios
- Roles y permisos
- Gestión de accesos

**Endpoints:**
```
GET    /users                # Listar usuarios
POST   /users                # Crear usuario
GET    /users/:id            # Obtener usuario
PATCH  /users/:id            # Actualizar usuario
DELETE /users/:id            # Eliminar usuario
```

## 📱 Sistema de Mensajería Automática

### Características
- **Seguimiento automático** basado en estados
- **Múltiples canales** de comunicación
- **Plantillas personalizables**
- **Programación inteligente**

### Canales Disponibles

#### 🟢 Respond.io (Activo)
- **API profesional** de mensajería
- **Alta confiabilidad** y escalabilidad
- **Integración empresarial**
- **Soporte para múltiples canales**

#### 📧 Email (Fallback)
- **SMTP configurable**
- **Plantillas HTML**
- **Fallback automático**

#### 🔵 WhatsApp Business API (Secundario)
- **API oficial** de WhatsApp
- **Alta confiabilidad**
- **Para uso empresarial**

### Reglas de Seguimiento

| Estado | Delay | Plantilla | Canales |
|--------|-------|-----------|---------|
| `NO_CONTESTO` | 24 horas | `NO_RESPONSE_24H` | Respond.io → Email |
| `SE_COTIZO_Y_PENDIENTE` | 48 horas | `QUOTE_PENDING_48H` | Respond.io → Email |
| `COMPRO` | 14 días | `SATISFACTION_14D` | Respond.io → Email |

### Configuración de Canales

**Archivo:** `src/modules/customer/follow-up/messaging/channel-config.ts`

```typescript
export const CHANNEL_CONFIG = {
  // Respond.io - Canal principal
  RESPOND_IO: { 
    channel: 'RESPOND_IO', 
    contactPreference: 'PHONE' 
  },

  // WhatsApp Business API - Canal secundario
  WHATSAPP_API: { 
    channel: 'WHATSAPP_API', 
    contactPreference: 'PHONE' 
  },

  // Email - Canal de fallback
  EMAIL: { 
    channel: 'EMAIL', 
    contactPreference: 'EMAIL' 
  },
};
```

### Configuración de Respond.io

Para configurar Respond.io, agrega las siguientes variables a tu archivo `.env`:

```env
# Respond.io Configuration
RESPOND_IO_TOKEN=tu_bearer_token_aqui
RESPOND_IO_CHANNEL_ID=123456
RESPOND_IO_ENABLED=true
```

## 🔧 Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# ========================================
# CONFIGURACIÓN BÁSICA
# ========================================
NODE_ENV=development
PORT=3000

# ========================================
# BASE DE DATOS
# ========================================
MONGO_URI=mongodb://localhost:27017/lincecrm

# ========================================
# AUTENTICACIÓN
# ========================================
JWT_SECTRET=tu_jwt_secret_super_seguro_aqui

# ========================================
# FRONTEND
# ========================================
FRONTEND_URL=http://localhost:5173
ADDITIONAL_FRONTEND_URLS=

# ========================================
# APIS EXTERNAS
# ========================================
EXTERNAL_FIXED_TOKEN=tu_token_externo_aqui

# ========================================
# EMAIL (OPCIONAL)
# ========================================
MAILER_HOST=smtp.gmail.com
MAILER_PORT=587
MAILER_SECURE=false
MAILER_EMAIL=tu_email@gmail.com
MAILER_SECRET_KEY=tu_contraseña_de_aplicacion

# ========================================
# RESPOND.IO (PRINCIPAL)
# ========================================
RESPOND_IO_TOKEN=tu_bearer_token_aqui
RESPOND_IO_CHANNEL_ID=123456
RESPOND_IO_ENABLED=true

# ========================================
# WHATSAPP BUSINESS API (SECUNDARIO)
# ========================================
# WHATSAPP_API_TOKEN=tu_token_de_whatsapp_business
# WHATSAPP_API_PHONE_NUMBER_ID=tu_phone_number_id
# WHATSAPP_API_BUSINESS_ACCOUNT_ID=tu_business_account_id
# WHATSAPP_API_ENABLED=false
```

### Configuración de Email (Gmail)

1. **Activa la verificación en 2 pasos** en tu cuenta de Google
2. **Genera una "Contraseña de aplicación"** específica
3. **Usa esa contraseña** en `MAILER_SECRET_KEY`
4. **Para otros proveedores**, ajusta `MAILER_HOST` y `MAILER_PORT`

### Configuración de Respond.io

1. **Obtén tu Bearer Token** desde el panel de Respond.io
2. **Configura** `RESPOND_IO_TOKEN` con tu token
3. **Configura** `RESPOND_IO_CHANNEL_ID` con tu channel ID (debe ser un número)
4. **Habilita** `RESPOND_IO_ENABLED=true`
5. **¡Listo!** El sistema enviará mensajes por Respond.io

## 🚀 Despliegue

### Desarrollo
```bash
npm run start:dev
```

### Producción
```bash
# Compilar
npm run build

# Iniciar
npm run start:prod
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 💻 Desarrollo

### Estructura de Archivos
```
src/
├── modules/           # Módulos de funcionalidad
├── common/           # Utilidades compartidas
├── config/           # Configuración
└── services/         # Servicios globales
```

### Convenciones
- **Controllers**: Manejan las rutas HTTP
- **Services**: Lógica de negocio
- **DTOs**: Validación de datos
- **Schemas**: Modelos de MongoDB
- **Guards**: Autenticación y autorización

### Testing
```bash
npm run test          # Tests unitarios
npm run test:e2e      # Tests end-to-end
npm run test:cov      # Coverage
```

### Linting y Formato
```bash
npm run lint          # ESLint
npm run format        # Prettier
```

## 📚 Tecnologías Utilizadas

### Backend
- **NestJS** - Framework de Node.js
- **MongoDB** - Base de datos
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **Class Validator** - Validación de datos

### Mensajería
- **WhatsApp WebJS** - Cliente de WhatsApp
- **Nodemailer** - Envío de emails
- **WhatsApp Business API** - API oficial de WhatsApp (futuro)

### Utilidades
- **ExcelJS** - Manejo de archivos Excel
- **Bcrypt** - Hash de contraseñas
- **Helmet** - Seguridad HTTP
- **Compression** - Compresión de respuestas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- **Email**: soporte@lincecrm.com
- **Documentación**: [Wiki del proyecto]
- **Issues**: [GitHub Issues]

---

**LinceCRM** - Sistema de Gestión de Clientes con Seguimiento Automático