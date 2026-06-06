<p align="center">
  <img src="assets/logo.svg" alt="TOTP Authentication Lab" width="128" />
</p>

<h1 align="center">TOTP Authentication Lab</h1>

<p align="center">
  Laboratorio para pruebas autenticación con TOTP (Time-based One-Time Password):
  login, sesión JWT, configuración de 2FA con código QR y persistencia en JSON.
</p>

<p align="center">
  <a href="https://github.com/yeremitantaraico/totp-authentication-lab">
    <img src="https://img.shields.io/badge/repo-totp--authentication--lab-181717?style=flat&logo=github&logoColor=white" alt="Repositorio" />
  </a>
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=flat&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/pnpm-9+-F69220?style=flat&logo=pnpm&logoColor=white" alt="pnpm" />
  <img src="https://img.shields.io/badge/TOTP-otplib-0F766E?style=flat" alt="TOTP otplib" />
  <img src="https://img.shields.io/badge/JWT-jsonwebtoken-000000?style=flat&logo=jsonwebtokens&logoColor=white" alt="JWT" />
</p>

<p align="center">
  <img src="https://visitor-badge.laobi.icu/badge?page_id=yeremitantaraico.totp-authentication-lab" alt="Visitas al repositorio" />
</p>

---

## Descripción

Proyecto de práctica que simula un flujo real de autenticación en dos pasos:

- Inicio de sesión con correo y contraseña.
- Opción de habilitar TOTP tras el primer acceso.
- Generación de código QR para apps como Google Authenticator o Microsoft Authenticator.
- Nombre personalizable de la cuenta dentro de la app de autenticación.
- Validación del código TOTP en cada login cuando 2FA está activo.

> [!NOTE]
> Es un **laboratorio**: no usa base de datos. Los usuarios y la configuración TOTP se guardan en `backend/data/users.json`.

## Arquitectura

Organización por dominio / feature, alineada con Clean Architecture en el backend:

```text
totp-authentication-lab/
├── backend/                 # API REST (NestJS)
│   └── src/modules/
│       ├── auth/              # Login, JWT, TOTP, guards
│       └── storage/           # Persistencia JSON
├── frontend/                # SPA (React + Vite)
│   └── src/
│       ├── features/          # auth, home, configuration
│       └── shared/            # layout, hooks, estilos
└── README.md
```

**Flujo principal**

1. El usuario inicia sesión en `/login`.
2. Si 2FA está deshabilitado → accede a `/home` y puede configurar TOTP.
3. En `/configuration` genera el QR, escanea y confirma con un código de 6 dígitos.
4. En logins posteriores, si 2FA está activo, se solicita el código TOTP antes de emitir el JWT.

## Stack

| Área | Tecnología |
|------|------------|
| Backend | NestJS 11, TypeScript, Express |
| Frontend | React 19, Vite 8, React Router |
| Autenticación | bcrypt, jsonwebtoken, otplib, qrcode |
| Almacenamiento | JSON (`backend/data/users.json`) |
| Gestor de paquetes | pnpm |

## Requisitos

- Node.js 20+
- pnpm 9+

## Instalación

### Backend

```bash
cd backend
cp .env.example .env
pnpm install
pnpm run start:dev
```

API disponible en `http://localhost:3000/api`.

### Frontend

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm run dev
```

UI disponible en `http://localhost:5173`.

> [!TIP]
> El frontend se comunica con el backend mediante **proxy inverso de Vite** (`/api` → `http://localhost:3000`). No hace falta definir la URL del API en el `.env` del frontend.

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del API (por defecto `3000`) |
| `API_NAME` | Nombre del emisor TOTP en la app de autenticación |
| `JWT_SECRET` | Secreto para firmar tokens JWT |

### Frontend (`frontend/.env`)

| Variable | Descripción |
|----------|-------------|
| `VITE_APP_NAME` | Nombre de la app (títulos de página y branding) |
| `VITE_APP_VERSION` | Versión mostrada en configuración |

## Rutas del frontend

| Ruta | Descripción |
|------|-------------|
| `/login` | Inicio de sesión y verificación TOTP |
| `/home` | Bienvenida, datos de sesión y acceso a configuración |
| `/configuration` | Habilitar/deshabilitar 2FA, QR y nombre en la app de auth |

Títulos de pestaña: `{VITE_APP_NAME} - Login`, `Home`, `Configuration`.

## API principal

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api` | Estado del API |
| `POST` | `/api/auth/login` | Login con correo y contraseña |
| `POST` | `/api/auth/verify-totp` | Verificación TOTP en login |
| `GET` | `/api/auth/me` | Perfil del usuario autenticado |
| `POST` | `/api/auth/totp/setup` | Generar QR (requiere `accountName`) |
| `POST` | `/api/auth/totp/enable` | Habilitar 2FA |
| `POST` | `/api/auth/totp/disable` | Deshabilitar 2FA |
| `POST` | `/api/auth/totp/dismiss-prompt` | Ocultar aviso inicial de 2FA |

## Usuario por defecto

| Campo | Valor |
|-------|-------|
| Nombre | Yeremi Tantraico |
| Email | yeremitantaraico@gmail.com |
| Contraseña | `12345678` |
| Rol | Admin TI |

El archivo se crea automáticamente en el primer arranque del backend. Plantilla de referencia: `backend/data/users_example.json`.

## Scripts útiles

| Ubicación | Comando | Uso |
|-----------|---------|-----|
| `backend/` | `pnpm run start:dev` | API en modo desarrollo |
| `backend/` | `pnpm run build` | Compilar backend |
| `frontend/` | `pnpm run dev` | UI en modo desarrollo |
| `frontend/` | `pnpm run build` | Build de producción |

## Licencia

Proyecto público desarrollado con fines educativos y de demostración para prácticas locales de integración frontend-backend con autenticación básica basada en pruebas autenticación con TOTP (Time-based One-Time Password).

