# Proyect-Astra

RPG táctico 2D para la web, centrado en la exploración, la gestión de un grupo de aventureros y las decisiones basadas en sus estadísticas. El proyecto combina una interfaz React, una escena interactiva con Phaser 3, una API REST con Express y una base de datos MySQL.

## Estado actual

- Listado, consulta, creación, edición y eliminación de personajes.
- Modo de exploración 2D isométrico integrado con Phaser (mapa Tiled, mundo 36×22 tiles, vista en diamante 48×24).
- Grupo de hasta tres personajes con formación de seguidores y cambio de líder con `1`, `2` y `3`.
- Movimiento continuo con flechas o `WASD`, cámara siguiendo al líder y colisión contra obstáculos.
- Minimapa con zoom y mapa completo con la tecla `M`.
- Inventario por personaje: 48 ranuras, 6 de equipamiento, filtros, auto-orden, traspaso entre personajes, consumo, división de pilas, drag & drop y menú contextual.
- Hotbar de acceso rápido, HUD del grupo con vida y maná, y editor de estadísticas del líder con `U`.
- Menú principal con 3 slots de partida, guardado con autosave, menú de pausa y menú de opciones (audio, video y teclas rebindeables).
- Comunicación React-Phaser mediante eventos `CustomEvent` centralizados.

El combate táctico, las interacciones con el entorno y el movimiento por casillas forman parte de la hoja de ruta del proyecto.

## Requisitos

- Docker y Docker Compose.
- Node.js 18 o superior.
- `pnpm`.

## Inicio rápido

El script de inicio levanta MySQL, ejecuta la migración de la base de datos, inicia la API y deja el cliente web disponible en primer plano:

```bash
chmod +x start-app.sh
./start-app.sh
```

Cliente web: `http://localhost:5173`

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
CORS_ORIGINS=http://localhost:5173
```

No subas este archivo si contiene credenciales reales. Hay una plantilla en `backend/.env.example`; `CORS_ORIGINS` es opcional y admite varios orígenes separados por coma.

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

La API expone las rutas bajo `/api/personajes` y `/api/partidas`:

### Personajes

| Método | Ruta | Operación |
| --- | --- | --- |
| `GET` | `/api/personajes` | Listar personajes |
| `GET` | `/api/personajes/:id` | Consultar detalle |
| `POST` | `/api/personajes` | Crear personaje |
| `PUT` | `/api/personajes/:id` | Actualizar personaje |
| `DELETE` | `/api/personajes/:id` | Eliminar personaje |
| `GET` | `/api/personajes/:id/inventario` | Consultar inventario persistente |
| `PUT` | `/api/personajes/:id/inventario` | Guardar ranuras del inventario |
| `POST` | `/api/personajes/:id/inventario/:ranura/usar` | Consumir un objeto |
| `GET` | `/api/personajes/:id/equipamiento` | Consultar equipo puesto |
| `POST` | `/api/personajes/:id/inventario/:ranura/equipar` | Equipar un objeto |
| `POST` | `/api/personajes/:id/inventario/:ranura/transferir` | Enviar un objeto a otro personaje |
| `POST` | `/api/personajes/:id/equipamiento/:ranura/desequipar` | Quitar un objeto equipado (primer hueco libre) |
| `POST` | `/api/personajes/:id/equipamiento/:ranura/desequipar/:ranuraDestino` | Quitar un objeto equipado a una ranura concreta |

### Partidas

| Método | Ruta | Operación |
| --- | --- | --- |
| `GET` | `/api/partidas` | Listar slots de partida |
| `GET` | `/api/partidas/:id` | Consultar un slot |
| `PUT` | `/api/partidas/:id` | Guardar posición, líder y posiciones del grupo |
| `POST` | `/api/partidas/:id/reset` | Vaciar el slot |

Los errores devuelven `{ "error": "mensaje" }` con el status HTTP correspondiente (`400` validación, `404` no encontrado, `500` por defecto).

### Frontend

En otra terminal:

```bash
cd frontend
pnpm install
pnpm run dev
```

El frontend está configurado para consumir la API en `http://localhost:3000/api`.

## Calidad: lint, tests y build

Desde la raíz del repo:

```bash
pnpm lint                        # ESLint sobre frontend/src
pnpm test                        # Vitest (frontend) + node --test (backend)
cd frontend && pnpm run build    # build de producción
```

- **Tests del frontend** (Vitest): `frontend/src/**/*.test.js`, junto al módulo. Hoy cubren los módulos puros (inventario, isométrica, colisiones, stats).
- **Tests del backend** (`node:test`): `backend/**/*.test.js`, junto al módulo. Los servicios se prueban sin base de datos inyectando un stub de `backend/utils/asyncDb.js`.
- **CI** (`.github/workflows/ci.yml`): un job de frontend (lint + tests + build) y uno de backend (tests + `node --check`).
- **Pre-commit** (husky + lint-staged): `eslint --fix` en `frontend/**` y `node --check` en `backend/**`.

## Estructura del proyecto

```text
backend/             API Express, conexión MySQL y migración RPG
frontend/            Aplicación React, estilos y vista Phaser
sentencias-sql/      Creación, inserción, consultas y vistas SQL
docs/                Contexto de trabajo y grafo del proyecto
docker-compose.yml   Servicio MySQL 8
start-app.sh         Arranque integrado del entorno local
AGENTS.md            Reglas de trabajo para agentes
```

## Detener el entorno

Para detener la base de datos y conservar sus datos:

```bash
docker compose down
```

Para eliminar también el contenedor y sus volúmenes, usa `docker compose down -v`.

## Licencia

Este proyecto se distribuye bajo la licencia GNU General Public License v3.0 (GPLv3). Consulta el archivo `LICENSE` para ver el texto completo.
