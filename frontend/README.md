# Frontend de TechMind

Aplicación web para autenticarse, clasificar contenido y consultar la biblioteca. Consume exclusivamente el [backend](../backend/README.md); no accede directamente a Oracle ni al modelo.

## Tecnologías

- React 19 y React DOM 19.
- TypeScript 5.7.
- Vite 8 con `@vitejs/plugin-react`.
- Tailwind CSS 4 mediante `@tailwindcss/vite`.
- Lucide React para iconos.
- pnpm y Corepack.
- Nginx en la imagen de producción.

Las versiones instaladas exactas se fijan en `pnpm-lock.yaml`. El Dockerfile construye con Node 22 Alpine; `package.json` no declara un rango `engines` ni una versión de pnpm.

## Estructura

```text
src/
├── App.tsx                 navegación principal
├── LandingPage.tsx         portada, registro e inicio de sesión
├── Classifier.tsx          formulario y resultado
├── ContentLibrary.tsx      listado y filtro por categoría
├── UserManagement.tsx      administración de usuarios
├── UserContext.tsx         sesión compartida
├── components/             componentes auxiliares
├── config/api.ts           URL base
├── services/               llamadas HTTP
└── types/                  tipos de autenticación
```

## Configuración

Vite exige esta variable durante desarrollo y build:

```env
VITE_API_URL=http://localhost:8080
```

Crea un archivo local `.env.local` dentro de `frontend/` o configura la variable en el proceso. `src/config/api.ts` elimina una barra final y detiene la aplicación si la variable no existe. Los archivos `.env` locales están ignorados; no deben contenerse en commits.

## Instalación y ejecución

Desde `frontend/`:

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm run dev
```

Vite escucha en `0.0.0.0`; el puerto predeterminado es `5173` y puede cambiarse con la variable de proceso `PORT`.

Comprobación TypeScript y build:

```powershell
corepack pnpm exec tsc --noEmit
corepack pnpm run build
```

El resultado se genera en `dist/`. Para previsualizarlo:

```powershell
corepack pnpm run preview
```

## Vistas y navegación

- **Landing:** portada, registro y login.
- **Clasificador:** el formulario principal llama a `POST /api/contenido/clasificar` y muestra carga, resultado o error.
- **Biblioteca:** lista contenidos, obtiene categorías y filtra con las rutas del backend.
- **Administración:** visible desde el clasificador cuando el usuario tiene rol `ADMIN`; opera sobre `/users`.
- **Aviso de invitado:** «Probar sin cuenta» abre `ComingSoonModal`; no crea una sesión invitada.

La navegación se controla mediante estado en `App.tsx`, sin router. Pulsar el logotipo vuelve a la portada sin cerrar sesión. El cierre explícito elimina la sesión.

## Sesión y JWT

`UserContext` guarda en `localStorage`, bajo la clave `user`, el id, nombre, correo, rol y token devueltos por login. Al recargar, restaura ese objeto y abre el clasificador. Las solicitudes protegidas envían:

```http
Authorization: Bearer <token>
```

El formulario evita clasificar sin token. Guardar JWT en `localStorage` es una limitación del MVP por el riesgo de XSS; no debe considerarse almacenamiento completamente seguro.

## Comunicación con el backend

| Servicio | Rutas utilizadas |
|---|---|
| `authService.ts` | `/auth/register`, `/auth/login` |
| `contentService.ts` | `/api/contenido/clasificar`, `/api/contenido`, `/api/contenido/categorias`, `/api/contenido/buscar` |
| `userService.ts` y `UserManagement.tsx` | CRUD bajo `/users` |

`contentService.ts` conserva el código HTTP en `ContentServiceError` y muestra el mensaje controlado del backend cuando existe.

## Funcionalidad real y simulada

- El botón principal de clasificación usa la API real.
- Los tres botones de ejemplos ejecutan `mockClassify` localmente y sus resultados son simulados.
- El modo oscuro funciona en memoria, pero no se persiste al recargar.
- «Recordarme» es visual; la sesión se conserva en `localStorage` independientemente de esa casilla.
- La recuperación de contraseña no está implementada.

## Pruebas

No existe Vitest, Jest, Playwright ni otro runner versionado. Las verificaciones disponibles son:

```powershell
corepack pnpm exec tsc --noEmit
corepack pnpm run build
```

Comprobación manual recomendada:

1. Registrar e iniciar sesión.
2. Recargar y verificar que la sesión se restaura.
3. Clasificar desde el formulario principal.
4. Abrir la biblioteca y filtrar una categoría sin resultados.
5. Volver con el logotipo y comprobar que la sesión sigue activa.
6. Con `ADMIN`, abrir gestión de usuarios; con `USER`, confirmar que el acceso no aparece y que el backend rechaza `/users`.

## Docker y solución de problemas

El Dockerfile instala con lockfile congelado, construye Vite y sirve `dist/` desde Nginx. El compose publica el contenedor en el puerto `3000`.

- Si falta `VITE_API_URL`, `src/config/api.ts` lanza un error al cargar.
- Si Vite informa módulos ausentes, ejecuta la instalación congelada desde `frontend/`.
- Si el navegador muestra `Failed to fetch`, verifica backend, URL, puerto y CORS.
- Un `401` indica sesión ausente o inválida; un `403`, permisos insuficientes; un `502` o `503`, un problema controlado con el clasificador.

`node_modules/`, `dist/`, `/.pnpm-store/` y archivos `.env` locales no se versionan.

[Volver al README principal](../README.md).
