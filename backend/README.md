# Backend de TechMind

API REST responsable de autenticación, autorización, clasificación, persistencia en Oracle y administración de usuarios. Conecta el [frontend](../frontend/README.md) con la [API Python](../python-api/README.md) y Oracle.

## Tecnologías y estructura

- Java 17 y Spring Boot 3.5.4.
- Spring Web, Security, Data JPA y Validation.
- Auth0 Java JWT 4.5.0 y BCrypt.
- Oracle JDBC 23.4.0.24.05, Flyway y H2 para pruebas.
- Springdoc OpenAPI 2.8.5 y Maven Wrapper.

```text
src/main/java/com/g9_latam_team_67/backend/
├── config/       seguridad, CORS y cliente HTTP
├── controller/   rutas REST
├── dto/          contratos de entrada y salida
├── entity/       User, Contenido y Role
├── exception/    errores y manejador global
├── filter/       filtro JWT
├── repository/   acceso JPA
└── service/      lógica de aplicación
```

## Requisitos y variables

Se requiere Java 17, Oracle accesible y la API Python. Un alias TNS requiere Oracle Wallet.

| Variable | Obligatoria | Predeterminado | Uso |
|---|---:|---|---|
| `APP_DB_URL` | Sí | — | URL JDBC de Oracle. |
| `APP_DB_USERNAME` | Sí | — | Usuario de Oracle. |
| `APP_DB_PASSWORD` | Sí | — | Contraseña de Oracle. |
| `APP_JWT_SECRET` | Sí | — | Firma HMAC256. |
| `APP_JWT_EXPIRATION` | Sí para el script | `7200000` en Spring | Duración del JWT en ms. |
| `APP_CLASSIFIER_API_URL` | Sí | — | URL completa terminada en `/predict`. |
| `CLASSIFIER_CONNECT_TIMEOUT` | No | `3000` | Timeout de conexión en ms. |
| `CLASSIFIER_READ_TIMEOUT` | No | `10000` | Timeout de lectura en ms. |
| `TNS_ADMIN` | Según Oracle | Detectado por el script | Directorio del wallet. |

### Configuración segura y wallet

1. Copia `.env.example` como `.env` dentro de `backend/`.
2. Sustituye los valores ficticios localmente.
3. No confirmes `.env` ni el wallet; ambos están ignorados.

Si `APP_DB_URL` tiene forma `jdbc:oracle:thin:@alias`, coloca `tnsnames.ora` y `sqlnet.ora` en `backend/src/main/resources/wallet/`. `run-local.ps1` configura `TNS_ADMIN` con esa carpeta. No se deben versionar archivos `.ora`, `.sso`, `.p12`, certificados ni claves.

## Ejecución, compilación y pruebas

```powershell
cd backend
.\run-local.ps1
```

El servidor usa el puerto `8080`. Maven se ejecuta con el wrapper:

```powershell
.\mvnw.cmd test
.\mvnw.cmd clean package
```

En Linux o macOS se usa `./mvnw`. Las pruebas usan H2 en modo Oracle, desactivan Flyway y no dependen de Oracle ni del clasificador reales.

## Migraciones Flyway

Flyway está habilitado y Hibernate valida el esquema con `ddl-auto=validate`.

| Migración | Contenido |
|---|---|
| `V1__create_table_users.sql` | Tabla `users`, rol, estado y correo único. |
| `V2__create_table_contenido.sql` | Tabla `contenido`, relación con usuario e índices. |

V2 permite `usuario_id` nulo en el esquema. El flujo real de clasificación asigna el usuario autenticado antes de guardar.

## Seguridad y alcance

- Registro, login, Swagger y OpenAPI son públicos.
- `/api/contenido/**` requiere `USER` o `ADMIN`.
- `/users/**` requiere `ADMIN`.
- La autenticación es stateless y usa `Authorization: Bearer <token>`.
- En listado, categorías y filtro, `USER` ve recursos propios y `ADMIN` ve recursos globales.
- Una búsqueda por categoría sin coincidencias devuelve `200 OK` y `[]`.

## Endpoints

| Método | Ruta | Acceso | Resultado |
|---|---|---|---|
| `POST` | `/auth/register` | Público | Registro; `201`. |
| `POST` | `/auth/login` | Público | JWT y datos de sesión; `200`. |
| `POST` | `/api/contenido/clasificar` | `USER`, `ADMIN` | Clasifica y guarda; `201`. |
| `GET` | `/api/contenido` | `USER`, `ADMIN` | Lista según el rol. |
| `GET` | `/api/contenido/categorias` | `USER`, `ADMIN` | `{ "categorias": [...] }`. |
| `GET` | `/api/contenido/buscar?categoria=...` | `USER`, `ADMIN` | Filtra; parámetro vacío produce `400`. |
| `GET` | `/api/contenido/{id}` | `USER`, `ADMIN` | Consulta por id. |
| `POST` | `/api/contenido` | `USER`, `ADMIN` | Ruta heredada con clasificación simulada. |
| `GET` | `/users` | `ADMIN` | Lista usuarios. |
| `GET` | `/users/{id}` | `ADMIN` | Consulta un usuario. |
| `POST` | `/users` | `ADMIN` | Crea; `201`. |
| `PUT` | `/users/{id}` | `ADMIN` | Actualiza. |
| `PATCH` | `/users/{id}/activate` | `ADMIN` | Activa. |
| `PATCH` | `/users/{id}/deactivate` | `ADMIN` | Desactiva. |
| `DELETE` | `/users/{id}` | `ADMIN` | Elimina; `204`. |

### Contratos principales

```json
{
  "titulo": "Despliegue de contenedores",
  "texto": "Descripción técnica con al menos diez caracteres."
}
```

```json
{
  "id": 1,
  "titulo": "Despliegue de contenedores",
  "texto": "Descripción técnica con al menos diez caracteres.",
  "categoria": "cloud",
  "probabilidad": 0.93,
  "fecha": "2026-08-15T12:00:00"
}
```

Los valores de la respuesta son ilustrativos. El título admite hasta 150 caracteres y el texto entre 10 y 10 000.

## API Python y errores

El backend concatena título y texto y envía `{ "texto": "..." }`. Exige `category` no vacío y `probability` entre `0` y `1`; un fallo no se persiste.

- `400`: solicitud inválida.
- `401`: JWT ausente o inválido.
- `403`: rol insuficiente o usuario inactivo.
- `404`: recurso inexistente.
- `409`: recurso duplicado.
- `502`: error HTTP o respuesta inválida del clasificador.
- `503`: conexión o timeout del clasificador.
- `500`: error interno controlado.

Los errores uniformes contienen `timestamp`, `status`, `error`, `message` y `path`.

## Swagger, Docker y despliegue

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI: `http://localhost:8080/v3/api-docs`

`backend/Dockerfile` usa Eclipse Temurin 17. El compose raíz conecta los tres servicios y monta el wallet externo en `/opt/oracle/wallet`. El workflow `deploy.yml` despliega por SSH a un host OCI tras cambios en `main`, usando secretos de GitHub.

## Pruebas y limitaciones

La suite cubre contexto, autenticación, seguridad de usuarios, alcance de contenidos y errores del clasificador.

- `POST /api/contenido` guarda `Backend`/`0.90` de forma simulada y sin asociación explícita; el frontend principal no lo usa.
- `GET /api/contenido/{id}` no aplica en el servicio el mismo alcance por usuario del listado.
- La migración permite `usuario_id` nulo.
- CORS contiene el origen local `http://localhost:5173` y un origen de despliegue definido en código.
- Un alias TNS sin wallet válido impide conectar con Oracle.

[Volver al README principal](../README.md).
