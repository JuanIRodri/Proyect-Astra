# Contexto de trabajo — Proyect-Astra

Este documento registra **el estado del proyecto**, las decisiones tomadas y lo que falta. Las reglas de trabajo (ramas, modularización, hooks, verificación, contrato de API) viven en [`AGENTS.md`](../AGENTS.md); el mapa de archivos, en [`docs/project-graph.md`](./project-graph.md). Si algo se contradice, manda `AGENTS.md`.

## Qué es el proyecto

RPG táctico 2D web. React + Vite para la interfaz, Phaser 3 para la exploración isométrica, Express para la API REST y MySQL (Docker) para persistencia. Todo el texto de UI, los comentarios y los commits están en español.

## Estado confirmado por el usuario

- Exploración Phaser integrada en React, con mapa isométrico real (Tiled, 48×24, mundo 36×22).
- Movimiento continuo en 360° con diagonales normalizadas, límites del mundo y colisión contra obstáculos.
- Cambio de líder con `1`, `2` y `3`; followers con estela.
- Persistencia de personajes, inventario, equipamiento y partida entre reinicios: la migración solo carga datos si las tablas están vacías y no pisa lo del usuario.
- Inventario visual completo: 48 ranuras, 6 de equipamiento, filtros, auto-orden, traspaso entre personajes, consumo, división de pilas, drag & drop, tooltip y menú contextual.
- Guardado de partida: snapshot ligero con autosave (debounce 800 ms), menú principal con 3 slots y menú de pausa con "Continuar / Opciones / Guardar y salir".
- Consola de tests en verde: 55 tests de módulos puros (Vitest) + 56 del backend (`node:test`), lint del frontend en cero y CI con dos jobs.

## Pendiente de confirmación del usuario

- Drag & drop y doble clic del inventario (arrastrar entre mochila y equipo, dividir al soltar con `Shift`/`Ctrl`).
- Tooltip flotante del objeto y drop sobre la pestaña de otro personaje.
- Rueda del mouse sobre la grilla y `Shift+rueda` para ciclar filtros.
- Menú contextual del clic derecho con la opción "Enviar a".
- Vida y maná por personaje en el panel y en el HUD del grupo.
- Minimapa, mapa `M`, hotbar y menú de opciones (audio/video/teclas).
- Que la capacidad de carga (10 + Fuerza × 1.5) **no** bloquea mover objetos dentro del inventario: hoy solo informational; el límite se aplicará al recoger objetos desde la exploración.

## Módulos y capacidades

### Exploración (`frontend/src/game/`)

- `ExplorationScene.js` compone el resto (mapa, decor, colisiones, cámara, input). La lógica nueva va en un módulo propio.
- Isométrica 48×24 (`isometric.js`), colisiones por hitbox elíptica (`collision.js`), overlay y posiciones seguras (`board.js`), fichas y marcador (`party.js`), movimiento (`movement.js`), atajos (`input.js`), cluster `1/2/3` (`hotkeys.js`), teclas rebindeables (`bindings.js`), bloqueo de input (`inputLock.js`), dibujado de minimapa y mapa (`mapCanvas.js`), posiciones en vivo (`partyPositionsStore.js`), video (`videoSettings.js`), hotbar (`hotbarConfig.js`), stats por clase (`characterStats.js`), eventos React↔Phaser (`gameEvents.js`).

### Interfaz (`frontend/src/components/`)

- `ExplorationView.jsx` monta Phaser y coordina minimapa, HUD, hotbar, pausa, mapa, inventario y editor de stats.
- `InventoryPanel.jsx` compone `inventory/`: `useInventoryPanel.js` (estado y acciones), `inventoryUtils.js` y `inventoryOperations.js` (helpers puros y testeados), `inventoryKeyHandler.js` (teclado) y los subcomponentes `InventoryHeader`, `InventoryGrid`, `InventoryDetail`, `InventoryStats`, `InventoryFilters`, `InventoryResources`, `DetailsModal`, `SplitModal`, `TransferModal`, `InventoryContextMenu`.
- `mainmenu/`: pantalla inicial, carga de partidas, opciones de audio/video/teclas y `OpcionesStack` (compartido con la pausa).
- `map/`: mapa completo (tecla `M`) con zoom y paneo.
- `Minimap.jsx`, `GroupHud.jsx`, `Hotbar.jsx`, `ItemTooltip.jsx`, `PauseMenu.jsx`, `CharacterForm.jsx` + `form-parts/StatsFields.jsx`.

### API (`backend/`)

- Capas: `routes/` → `controllers/` (delgado, valida con `utils/validate.js`) → `services/` (SQL, transacciones con `withTransaction()`) → `utils/` (`asyncDb`, `errors`, `validate`) → `config/` (`db.js` pool, `env.js` variables).
- Personajes (CRUD + inventario + equipamiento), partidas (guardado ligero) y errores centralizados `{ error: mensaje }`.

## Decisiones de diseño (con su porqué)

- **Inventario en un panel separado, no en el HUD**: el inventario tiene teclado, drag & drop, modales y filtros propios; mezclarlo con la escena isométrica saturaba la pantalla.
- **El estado de la escena vive en Phaser, el de la UI en React**: el puente es únicamente `gameEvents.js` (`CustomEvent`), lo que evita acoplar ambos runtimes.
- **Autosave de partida en vez de volcado completo de la BD**: los personajes ya persisten en vivo; la partida solo guarda posición del líder, líder activo y posiciones del grupo.
- **Vida/mana actuales persistidas, máximos derivados**: `vidaMax = 30 + constitucion*5`, `manaMax = 20 + inteligencia*5`; al editar stats se clampean los recursos actuales al nuevo máximo.
- **Fórmulas duplicadas a propósito**: los pesos de stats por clase están en `frontend/src/game/characterStats.js` y `backend/migrate-rpg.js` (el backend necesita repartir al crear personajes). Si tocás una, tocá la otra.
- **Stats sin apariencia**: la apariencia quedó fuera del editor (la hoja de ruta original la tenía) para no mezclar dos formularios en un panel; el catálogo de la BD sigue existiendo.

## Planning posterior

- Validar límites de pila y capacidad al recoger objetos desde la exploración.
- Integrar el equipamiento con las estadísticas efectivas y el combate.
- Decidir si se incorporan ranuras de aretes, collar u otros accesorios.
- Combate táctico por casillas, interacciones con el entorno y mapas exportados desde Tiled (ver la hoja de ruta del documento de diseño).

## Cómo ejecutar

```bash
./start-app.sh          # MySQL (Docker) + migración + backend + frontend
```

Frontend `http://localhost:5173` · API `http://localhost:3000`. Variables y ejecución manual en [`README.md`](../README.md).
