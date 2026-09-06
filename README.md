# Proyect-Astra

RPG táctico 2D para la web, centrado en la exploración, la gestión de un grupo de aventureros y las decisiones basadas en sus estadísticas. El proyecto combina una interfaz React, una escena interactiva con Phaser 3, una API REST con Express y una base de datos MySQL.

## Estado actual

- Dashboard para listar, consultar, crear, editar y eliminar personajes.
- Gestión de clase, nivel, estadísticas y características del grupo.
- Modo de exploración 2D integrado con Phaser.
- Grupo de hasta tres personajes con formación de seguidores.
- Cambio de líder con las teclas `1`, `2` y `3`.
- Movimiento con flechas o `WASD`, cámara siguiendo al líder y bloqueo contra obstáculos.
- Edición de estadísticas del líder durante la exploración con `U`.
- Comunicación React-Phaser mediante eventos `CustomEvent` centralizados.

El combate táctico, los mapas exportados desde Tiled, las interacciones con el entorno y el movimiento por casillas forman parte de la hoja de ruta del proyecto.

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
| `GET` | `/api/personajes/:id/inventario` | Consultar inventario persistente |
| `PUT` | `/api/personajes/:id/inventario` | Guardar ranuras del inventario |
| `POST` | `/api/personajes/:id/inventario/:ranura/usar` | Consumir un objeto |
| `GET` | `/api/personajes/:id/equipamiento` | Consultar equipo puesto |
| `POST` | `/api/personajes/:id/inventario/:ranura/equipar` | Equipar un objeto |
| `POST` | `/api/personajes/:id/equipamiento/:ranura/desequipar` | Quitar un objeto equipado |

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
