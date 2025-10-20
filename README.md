# minibio

Aplicación web creada con Next.js para generar páginas de presentación tipo “link in bio”. Permite a cada usuario definir su nombre público, biografía, foto de perfil, redes sociales y enlaces personalizados; luego expone cada perfil en una URL dinámica (`/tuusuario`).

## Características
- **Next.js 15** con enrutado App Router y componentes server/client.
- **TypeScript** y ESLint configurados para mantener la calidad de código.
- **Tailwind CSS** y componentes de la librería shadcn/ui.
- Persistencia en **PostgreSQL**, con auto creación de tablas en el primer despliegue.
- Las imágenes se codifican en base64 y se guardan directamente en PostgreSQL (sin servicios externos).

## Stack técnico
- Node.js 18/20+
- Next.js 15.2, React 19
- Tailwind CSS 4
- PostgreSQL 15+
- Driver oficial `pg` para conectarse a PostgreSQL

## Requisitos previos
1. Node.js 18.18 o superior (se recomienda 20 LTS).
2. PostgreSQL disponible (Railway, Neon u otro).

## Configuración local
1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear el archivo de variables de entorno:
   ```bash
   cp .env.example .env.local
   ```
3. Completar `.env.local` con la cadena `DATABASE_URL` de tu instancia PostgreSQL (o `NEON_POSTGRES_URL` si tu proveedor usa ese nombre). Si te conectás al host interno de Railway, agregá `PGSSLMODE=disable`.
4. Levantar el entorno de desarrollo:
   ```bash
   npm run dev
   ```

## Variables de entorno
| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión estándar de PostgreSQL. Railway la provee automáticamente al crear una base. |
| `NEON_POSTGRES_URL` / `POSTGRES_URL` | Variables alternativas compatibles (fallback). Úsalas solo si tu proveedor las expone con esos nombres. |
| `PGSSLMODE` | Define si el cliente debe usar SSL (`disable` para conexiones internas como `postgres.railway.internal`). |

## Base de datos (PostgreSQL)
La API crea la tabla `profiles` automáticamente en el primer request si el rol tiene permisos para:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE IF NOT EXISTS profiles (...);
```

Si tu proveedor no permite ejecutar `CREATE EXTENSION` desde la aplicación, habilítalo manualmente una sola vez:

```bash
# En tu shell de PostgreSQL
\c <nombre_de_tu_db>
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
\i scripts/002_create_profiles_table_v2.sql;
```

El archivo `scripts/002_create_profiles_table_v2.sql` incluye índices y políticas RLS abiertas (lectura/edición pública). Ajusta las políticas si más adelante agregas autenticación.

## Comandos disponibles
- `npm run dev` – entorno de desarrollo en `http://localhost:3000`.
- `npm run lint` – análisis estático con ESLint.
- `npm run build` – build de producción (requiere acceso a internet para descargar fuentes de Google la primera vez).
- `npm start` – arranca el servidor en modo producción después de `npm run build`.

## Despliegue en Railway
1. Crea un proyecto en Railway y selecciona “Deploy from GitHub” o “Railway CLI”.
2. Configura los comandos:
   - **Build**: `npm run build`
   - **Start**: `npm run start`
3. Añade estas variables en la sección *Variables*:
   - `DATABASE_URL` (Railway la inyecta si agregas el plugin PostgreSQL).
   - `PGSSLMODE=disable` si usas el host interno (`postgres.railway.internal`) para evitar negociar SSL.
4. Conecta un servicio PostgreSQL en Railway o enlaza uno existente. Railway entregará la cadena `DATABASE_URL`.
   - Dentro de Railway, el host interno suele ser `postgres.railway.internal`.
5. Ejecuta el script SQL (solo una vez) para habilitar `pgcrypto` y las tablas, desde el *Shell* de Railway:
   ```bash
   railway connect postgres
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   \i scripts/002_create_profiles_table_v2.sql;
   ```
   Si prefieres no ejecutar el script manualmente, asegúrate de que tu rol tenga permisos para crear extensiones; la app se encargará del resto durante el primer request.

### Almacenamiento de imágenes
Las imágenes se procesan en el navegador, se codifican en base64 y se envían junto con el resto de los datos del perfil. El backend sólo guarda y sirve el texto codificado en la columna `profile_image_url`. Tené en cuenta que esto incrementa el tamaño de la fila; se recomienda limitar las imágenes a menos de 2 MB.

## Estructura principal
```
app/                  # Rutas del App Router (landing, crear, editar, perfil público y APIs)
components/ui/        # Componentes reutilizables (shadcn/ui)
lib/db.ts             # Cliente de PostgreSQL y helpers de base de datos
lib/files.ts          # Utilidades para manejo de archivos/imágenes en el cliente
lib/social-links.ts   # Configuración de redes soportadas
scripts/              # SQL para inicializar o actualizar la base
styles/               # Archivos de estilos globales / tailwind
```

## Próximos pasos sugeridos
- Agregar autenticación para limitar quién puede actualizar cada perfil.
- Implementar un panel administrativo y estadísticas de visitas.
- Implementar un almacenamiento externo si en el futuro necesitás archivos más pesados o CDN.
