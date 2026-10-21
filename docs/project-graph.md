# Grafo del Proyecto

Este documento es el mapa de rutas y responsabilidades del proyecto. Consultalo antes de buscar la ubicacion de un archivo, componente, servicio o modulo. Cuando se agregue, mueva o elimine una pieza estructural, actualiza este grafo en el mismo cambio.

```mermaid
flowchart TD
    Root[Proyect-Astra]

    Root --> Frontend[frontend/\nReact + Vite\nVitest (pnpm test) · alias @/ -> src/]
    Root --> Backend[backend/\nExpress + tests node:test]
    Root --> Ci[.github/workflows/ci.yml\nbuild · lint · tests (frontend+backend) · node --check]
    Root --> Hooks[.husky/pre-commit + lint-staged.config.mjs]
    Root --> Scripts[package.json (raiz)\npnpm lint · pnpm test]
    Root --> SQL[sentencias-sql/\nMySQL y modelo de datos]
    Root --> Infra[docker-compose.yml\nstart-app.sh]
    Root --> Design[Documento de Diseño y Arquitectura - RPG Táctico Web.md\nrequisitos y hoja de ruta]
    Root --> Readme[README.md\ninstalacion y comandos]
    Root --> Context[docs/contexto-agente.md\nestado y decisiones]
    Root --> Agents[AGENTS.md\nreglas para agentes]

    Frontend --> App[frontend/src/App.jsx\ncomposicion de la interfaz]
    Frontend --> Styles[frontend/src/App.css\nfrontend/src/index.css]
    Frontend --> Components[frontend/src/components/]
    Frontend --> FrontHooks[frontend/src/hooks/]
    Frontend --> Services[frontend/src/services/]
    Frontend --> Game[frontend/src/game/]
    Frontend --> Assets[frontend/src/assets/\nfrontend/public/]

    Components --> CharacterForm[CharacterForm.jsx\neditor de stats por clase (sin apariencia)]
    Components --> ExplorationView[ExplorationView.jsx\nvista separada de exploracion]
    Components --> PhaserGame[PhaserGame.jsx\npuente React -> Phaser]
    Components --> Inventory[components/inventory/\nInventoryPanel compone\nuseInventoryPanel.js (orquestador)\nuseInventoryData.js · useInventorySelection.js\nuseInventoryActions.js · useInventoryDrag.js\nuseInventoryContextMenu.js\ninventorySelectors.js · inventoryConstants.js\ninventoryUtils.js · inventoryOperations.js\ninventoryKeyHandler.js + keys/\nInventoryHeader.jsx · InventoryGrid.jsx\nInventoryDetail.jsx · InventoryStats.jsx\nInventoryFilters.jsx · InventoryResources.jsx\nDetailsModal.jsx · SplitModal.jsx\nTransferModal.jsx · InventoryContextMenu.jsx]
    Components --> Hotbar[Hotbar.jsx\nbarra de acceso rapido (overlay y panel)]
    Components --> ItemTooltip[ItemTooltip.jsx\nficha flotante de objeto]
    Components --> Minimap[Minimap.jsx\nminimapa con zoom, rueda y drag]
    Components --> GroupHud[GroupHud.jsx\nHUD de vida y mana del grupo]
    Components --> PauseMenu[PauseMenu.jsx\nmenu de pausa (ESC)]
    Components --> MapModules[components/map/\nMapView.jsx\nuseMapCanvasController.js]
    Components --> FormParts[components/form-parts/\nStatsFields.jsx]
    Components --> MainMenu[MainMenu.jsx\ncompositor del menu inicial]
    Components --> MenuModules[components/mainmenu/\nMenuHome.jsx · MenuCargar.jsx · MenuNueva.jsx\nOpcionesStack.jsx · MenuOpciones.jsx\nMenuOpcionesAudio.jsx · MenuOpcionesVideo.jsx\nMenuOpcionesTeclas.jsx\nuseMenuNav.js · useOpciones.js · useOpcionesVideo.js\nuseTeclas.js · utils.js]

    FrontHooks --> UsePersonajes[usePersonajes.js\nestado y operaciones de personajes]
    FrontHooks --> UsePartidas[usePartidas.js\nlistado de partidas guardadas]
    FrontHooks --> UsePartyPositions[usePartyPositions.js\nposiciones del grupo (leader-change)]
    FrontHooks --> UseHotbar[useHotbar.js\nestado y persistencia de la hotbar]
    FrontHooks --> UseItemTooltip[useItemTooltip.js\nestado del tooltip de objeto]
    Services --> Api[services/api.js\ncliente HTTP]
    Game --> Exploration[game/ExplorationScene.js\nescena Phaser 3]
    Game --> Iso[game/isometric.js\nproyección iso 48×24]
    Game --> Collision[game/collision.js\ncolisiones por hitbox de objeto]
    Game --> Board[game/board.js\noverlay de cuadrícula y posiciones seguras]
    Game --> Party[game/party.js\nfichas del grupo y marcador de líder]
    Game --> CharStats[game/characterStats.js\nstats iniciales y pesos por clase]
    Game --> Decor[game/decor.js\nárboles y arbustos 2.5D]
    Game --> Movement[game/movement.js\nmovimiento continuo del grupo]
    Game --> Input[game/input.js\natajos de la escena]
    Game --> Hotkeys[game/hotkeys.js\nlíder 1/2/3]
    Game --> Bindings[game/bindings.js\nteclas configurables]
    Game --> InputLock[game/inputLock.js\nbloqueo de input]
    Game --> VideoSettings[game/videoSettings.js\nvideo/overlay]
    Game --> PartyPositions[game/partyPositionsStore.js\nposiciones en vivo del grupo]
    Game --> HotbarConfig[game/hotbarConfig.js\nconfig de la hotbar]
    Game --> MapCanvas[game/mapCanvas.js\ndibujado del mapa M y minimapa]
    Game --> GameEvents[game/gameEvents.js\nCustomEvent compartidos]
    Game --> Constants[game/constants.js\nmedidas, colores y cámara]
    ExplorationView --> PhaserGame
    ExplorationView --> Inventory
    ExplorationView --> Minimap
    ExplorationView --> MapModules
    ExplorationView --> GroupHud
    ExplorationView --> Hotbar
    ExplorationView --> PauseMenu
    Minimap --> MapModules
    MapModules --> MapCanvas
    PhaserGame --> GameEvents
    PhaserGame --> Exploration
    Inventory --> InventoryState[inventory/useInventoryPanel.js\norquestador de sub-hooks]
    Inventory --> InventoryHooks[inventory/useInventoryData.js\nuseInventorySelection.js\nuseInventoryActions.js\nuseInventoryDrag.js\nuseInventoryContextMenu.js]
    Inventory --> InventorySelectors[inventory/inventorySelectors.js\nselectores puros y constantes]
    Inventory --> InventoryHelpers[inventory/inventoryUtils.js\nnormalizacion y navegacion]
    Inventory --> InventoryOps[inventory/inventoryOperations.js\noperaciones puras y carga]
    Inventory --> InventoryKeys[inventory/inventoryKeyHandler.js\ndispatcher + keys/]
    Inventory --> InventoryViews[inventory/InventoryGrid.jsx\nInventoryDetail.jsx\nInventoryStats.jsx]
    App --> Components
    App --> FrontHooks
    FrontHooks --> Api
    Api --> Backend

    Backend --> Entry[backend/index.js\nservidor Express]
    Backend --> Routes[backend/routes/\npersonajesRoutes.js\npartidasRoutes.js]
    Backend --> Controllers[backend/controllers/\npersonajesController.js\npartidasController.js]
    Backend --> Services[backend/services/\npersonajesService.js\ninventarioService.js\npartidasService.js]
    Backend --> Utils[backend/utils/\nasyncDb.js · errors.js · validate.js]
    Backend --> Config[backend/config/\ndb.js (pool) · env.js (validación de .env)]
    Backend --> TestsB[backend/**/*.test.js\nnode:test — validate, errors, personajesService, inventarioService, partidasService]
    Entry --> Routes
    Entry --> Config
    Routes --> Controllers
    Controllers --> Services
    Services --> Utils
    Utils --> Config
    Config --> SQL

    SQL --> Create[sentencias-sql/creaciones.sql]
    SQL --> Insert[sentencias-sql/inserciones.sql]
    SQL --> Queries[sentencias-sql/consultas.sql]
    SQL --> Views[sentencias-sql/vistas.sql]
    SQL --> Model[sentencias-sql/EER Diagram.mwb]
```

## Rutas clave

| Necesidad | Ruta principal | Depende de |
| --- | --- | --- |
| Entrada de la interfaz | `frontend/src/App.jsx` | componentes, hooks y Phaser |
| Menu inicial | `frontend/src/components/MainMenu.jsx` | `mainmenu/MenuHome.jsx`, `MenuCargar.jsx`, `MenuNueva.jsx`, `MenuOpciones.jsx`, `MenuOpcionesVideo.jsx` |
| Vista separada de exploracion | `frontend/src/components/ExplorationView.jsx` | `PhaserGame.jsx`, `Minimap.jsx`, `map/MapView.jsx`, `InventoryPanel.jsx` |
| Montar Phaser en React | `frontend/src/components/PhaserGame.jsx` | `frontend/src/game/ExplorationScene.js` |
| Mostrar inventario | `frontend/src/components/InventoryPanel.jsx` | `inventory/useInventoryPanel.js`, `inventory/useInventoryData.js`, `inventory/useInventorySelection.js`, `inventory/useInventoryActions.js`, `gameEvents.js` |
| Barra de acceso rapido | `frontend/src/components/Hotbar.jsx` | `hooks/useHotbar.js`, `services/api.js` |
| Menu de pausa | `frontend/src/components/PauseMenu.jsx` | `hooks/usePartyPositions.js`, `services/api.js` |
| Minimapa con zoom | `frontend/src/components/Minimap.jsx` | `map/useMapCanvasController.js`, `game/mapCanvas.js`, `usePartyPositions.js` |
| Mapa completo (tecla M) | `frontend/src/components/map/MapView.jsx` | `map/useMapCanvasController.js`, `game/mapCanvas.js`, `usePartyPositions.js` |
| Dibujado de mapas (diamante iso) | `frontend/src/game/mapCanvas.js` | `game/isometric.js`, `game/collision.js`, `game/constants.js` |
| Proyeccion isometrica (48×24) | `frontend/src/game/isometric.js` | `game/constants.js` |
| Colision (hitbox por objeto) | `frontend/src/game/collision.js` | `game/isometric.js`, `ExplorationScene.js`, `decor.js` |
| Overlay de cuadricula y posiciones seguras | `frontend/src/game/board.js` | `game/collision.js`, `game/isometric.js` |
| Fichas del grupo y marcador | `frontend/src/game/party.js` | `game/constants.js`, `isometric.js` |
| Decoracion 2.5D (arboles/arbustos) | `frontend/src/game/decor.js` | `game/constants.js`, `isometric.js` |
| Movimiento continuo del grupo | `frontend/src/game/movement.js` | `game/board.js`, `game/bindings.js` |
| Logica del mapa y exploracion | `frontend/src/game/ExplorationScene.js` | Phaser 3 |
| Eventos compartidos React-Phaser | `frontend/src/game/gameEvents.js` | `CustomEvent`, `PhaserGame.jsx`, `ExplorationScene.js` |
| Estado y actualizacion de personajes | `frontend/src/hooks/usePersonajes.js` | `frontend/src/services/api.js` |
| Listado de partidas | `frontend/src/hooks/usePartidas.js` | `frontend/src/services/api.js` |
| Posiciones del grupo en React | `frontend/src/hooks/usePartyPositions.js` | `game/gameEvents.js` |
| Tests de modulos puros | `frontend/src/**/*.test.js` | Vitest (`pnpm test`) |
| Peticiones al backend | `frontend/src/services/api.js` | API Express |
| Entrada de la API | `backend/index.js` | rutas, middlewares y conexion MySQL |
| Rutas de personajes | `backend/routes/personajesRoutes.js` | controlador de personajes |
| Rutas de partidas | `backend/routes/partidasRoutes.js` | controlador de partidas |
| Logica de personajes | `backend/services/personajesService.js` | `backend/utils/asyncDb.js` |
| Logica de inventario | `backend/services/inventarioService.js` | `backend/utils/asyncDb.js` |
| Logica de partidas | `backend/services/partidasService.js` | `backend/utils/asyncDb.js` |
| Controlador delgado | `backend/controllers/personajesController.js` | servicios de personajes e inventario |
| Validación de requests | `backend/utils/validate.js` | `errors.js`, `personajesController.js` |
| Variables de entorno | `backend/config/env.js` | `backend/.env`, `.env.example` |
| Conexion a la base de datos | `backend/config/db.js` | MySQL/Docker |
| Esquema y datos SQL | `sentencias-sql/` | `docker-compose.yml` |
| Requisitos y hoja de ruta del RPG | `Documento de Diseño y Arquitectura - RPG Táctico Web.md` | grafo y arquitectura |
| Contexto de trabajo y seguimiento | `docs/contexto-agente.md` | diseño, README y grafo |
| Reglas de trabajo para agentes | `AGENTS.md` | stack, hooks, verificación |
| Configuracion de dependencias frontend | `frontend/package.json` | pnpm |
| Arranque completo | `start-app.sh` | Docker, backend y frontend |
```

## Flujo de juego actual

```mermaid
sequenceDiagram
    participant R as React
    participant P as PhaserGame
    participant S as ExplorationScene
    participant U as Usuario

    R->>P: Renderiza el contenedor
    P->>S: Crea Phaser.Game con la escena (posiciones y líder de la partida)
    U->>S: Presiona 1/2/3 (líder), flechas/WASD (movimiento), U (editor), I (inventario), M (mapa)
    S-->>R: Emite party-position-update, leader-change y open-character-editor
    R-->>U: Muestra minimapa/mapa M (60 fps) y paneles de inventario/editor
```
