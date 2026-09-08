# Proyect-Astra — Contexto para el agente

RPG táctico 2D web. React + Vite para la UI, Phaser 3 para la exploración, Express para la API REST y MySQL (Docker) para persistencia. Idioma del código y de la UI: español.

## Cómo se ejecuta

- Entorno completo: `./start-app.sh` (levanta MySQL, migra, inicia backend y frontend).
- Backend solo: `cd backend && node index.js` (crear `backend/.env` desde `README.md`).
- Migración/seed: `cd backend && node migrate-rpg.js`.
- Frontend: `cd frontend && pnpm run dev`. URLs: frontend `:5173`, API `:3000`.
- Verificación: frontend `pnpm run build` y `pnpm exec eslint src/game` (el lint global **ya fallaba antes** en `CharacterForm.jsx`, `InventoryPanel.jsx`/`inventory/useInventoryPanel.js`, `usePersonajes.js` y `form-parts/*`; no son errores introducidos por cambios nuevos). Backend: `node --check <archivo>`.

## Arquitectura actual

### Backend (`backend/`) — Express, capas separadas

- `index.js` — arranque y montaje de rutas (`/api/personajes`).
- `routes/personajesRoutes.js` — rutas HTTP, delegan en el controlador.
- `controllers/personajesController.js` — controlador **delgado**: solo parsea la request, llama al servicio y responde (usa `asyncHandler`).
- `services/personajesService.js` e `inventarioService.js` — SQL y lógica de negocio (CRUD, inventario, equipamiento). `update`/`create`/inventario usan **transacciones**.
- `config/db.js` — pool de conexiones MySQL.
- `utils/asyncDb.js` — `query()` y `withTransaction()`. `utils/errors.js` — `AppError(status, msg)` y `asyncHandler`.

Patrón de error: los servicios lanzan `AppError` (p. ej. 404/400); el controlador devuelve `{ error: mensaje }`.

### Frontend (`frontend/src/`) — React + Phaser

- `game/` — módulos composición de la exploración:
  - `constants.js` — medidas del mundo, colores, teclas de movimiento.
  - `board.js` — `drawBoard()` y `canOccupy()` (colisiones).
  - `party.js` — datos del grupo, fichas, marcador y estilo del líder.
  - `movement.js` — teclas hay movimiento del grupo (líder + seguidores).
  - `input.js` — atajos: líderes `1/2/3`, `U` editor, `I` inventario.
  - `ExplorationScene.js` — escena que **compone** esos módulos (no lógica inline).
  - `gameEvents.js` — puente React↔Phaser mediante `CustomEvent` (`open-character-editor`, `toggle-inventory`).
- `components/` — `PhaserGame.jsx` (crea Phaser y suscribe eventos), `ExplorationView.jsx` (edición/inventario/selector), `InventoryPanel.jsx`, `inventory/` (lógica y subcomponentes del inventario: `useInventoryPanel.js`, `inventoryUtils.js`, `inventoryOperations.js`, `inventoryKeyHandler.js`, `InventoryHeader.jsx`, `InventoryGrid.jsx`, `InventoryDetail.jsx`, `InventoryStats.jsx`), `CharacterForm.jsx`, `form-parts/`, `CharacterSelector.jsx`.
- `hooks/usePersonajes.js` — estado de personajes (lista + update).
- `services/api.js` — cliente axios con todas las llamadas HTTP.

## Convenciones y gotchas

- Las tablas/columnas MySQL en español con tipos `PascalCase` (`Cabeza_Forma`), pero los campos de **request** del controller usan `snake_case` (`cabello_corte`). El frontend lee de `getPersonajeDetail`/`getPersonajes` los alias `PascalCase` (p. ej. `Cabello_Corte`, `Ojos_Color`) al construir el formulario.
- Hay una fórmula de estadísticas por clase (pesos Guerrero/Mago/Pícaro/Paladín/Cazador) que está duplicada en `frontend/src/components/CharacterForm.jsx` y `backend/migrate-rpg.js`. No alterar una sin la otra.
- El cluster de teclas `1/2/3` para líder está centralizado en `game/hotkeys.js` (`getLeaderIndex`) y se usa desde `game/input.js` e `InventoryPanel.jsx`.
- El documento de diseño cuenta con una hoja de ruta con casillas `[x]` — completado, pendiente de confirmación y pendiente de implementación. No repetir tareas ya completadas ni reimplementar lo existente.
- **Siempre modularizar cuando se pueda**: al implementar o refactorizar, dividir el código en módulos pequeños con una sola responsabilidad (un hook, helpers puros, subcomponentes) y componer desde un punto de entrada, en lugar de acumular lógica inline en archivos grandes.
- Los cambios implementados se dejan como "pendiente de confirmación" hasta que el usuario los pruebe en el navegador.
- **Flujo de trabajo con ramas**: trabajar siempre en ramas `feature/<tarea>` creadas desde `main`; `main` no se modifica directamente y la integración se hace mediante PR. En cada rama solo se tocan archivos relacionados con esa tarea; no mezclar cambios ajenos.

## Documentos de referencia (leer solo si hace falta)

Contexto extenso en `docs/contexto-agente.md`, mapa de rutas en `docs/project-graph.md`, requisitos y hoja de ruta en `Documento de Diseño y Arquitectura - RPG Táctico Web.md`, comandos en `README.md`. Esquema/seed en `sentencias-sql/`.