# Maniquí RPG

Aplicación web para gestionar personajes de un RPG táctico y personalizar sus características físicas. El proyecto combina una base de datos MySQL, una API REST y una interfaz React con un modo de exploración 2D desarrollado con Phaser.

## Funcionalidades

- Listar personajes y consultar su detalle.
- Crear, editar y eliminar personajes.
- Gestionar clase, nivel, altura, musculatura, rasgos faciales y estadísticas.
- Explorar los personajes en una vista interactiva con Phaser.
- Inicializar o actualizar las tablas y personajes RPG mediante una migración.

## Requisitos

- Docker y Docker Compose.
- Node.js 18 o superior.
- `pnpm`.

## Inicio rápido

El script de inicio levanta MySQL, ejecuta la migración RPG, inicia la API y deja el frontend disponible en primer plano:

```bash
chmod +x start-app.sh
./start-app.sh
```

Aplicación: `http://localhost:5173`

API: `http://localhost:3000`

## Configuración

El backend usa las variables de entorno siguientes. Crea `backend/.env` con los valores de desarrollo que coinciden con `docker-compose.yml`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=Maniqui
PORT=3000
```

No subas este archivo si contiene credenciales reales.

## Ejecución manual

### Base de datos

```bash
docker compose up -d
```

MySQL 8 se expone en `localhost:3306`. Los scripts de `sentencias-sql/creaciones.sql` e `sentencias-sql/inserciones.sql` se ejecutan al crear el volumen de la base de datos por primera vez.

### Backend

```bash
cd backend
pnpm install
node migrate-rpg.js
node index.js
```

La API expone las rutas bajo `/api/personajes`:

| Método | Ruta | Operación |
| --- | --- | --- |
| `GET` | `/api/personajes` | Listar personajes |
| `GET` | `/api/personajes/:id` | Consultar detalle |
| `POST` | `/api/personajes` | Crear personaje |
| `PUT` | `/api/personajes/:id` | Actualizar personaje |
| `DELETE` | `/api/personajes/:id` | Eliminar personaje |

### Frontend

En otra terminal:

```bash
cd frontend
pnpm install
pnpm run dev
```

El frontend está configurado para consumir la API en `http://localhost:3000/api`.

## Estructura del proyecto

```text
backend/             API Express, conexión MySQL y migración RPG
frontend/            Aplicación React, estilos y vista Phaser
sentencias-sql/      Creación, inserción, consultas y vistas SQL
docker-compose.yml   Servicio MySQL 8
start-app.sh         Arranque integrado del entorno local
docs/                Documentación y gráfico del proyecto
```

## Detener el entorno

Para detener la base de datos y conservar sus datos:

```bash
docker compose down
```

Para eliminar también el contenedor y sus volúmenes, usa `docker compose down -v`.

## Licencia

Este proyecto se distribuye bajo la licencia GNU General Public License v3.0 (GPLv3). Consulta el archivo `LICENSE` para ver el texto completo.
