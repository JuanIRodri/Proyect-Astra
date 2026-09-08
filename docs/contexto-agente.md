# Contexto de trabajo del proyecto

## Proyecto

Proyect-Astra es un RPG tactico 2D web. La interfaz usa React y Vite, la escena de exploracion usa Phaser 3, la API usa Node.js y Express, y los datos persisten en MySQL mediante Docker.

## Arquitectura que debo respetar

- `frontend/src/App.jsx` compone el dashboard y la vista de exploracion.
- `frontend/src/components/ExplorationView.jsx` conecta Phaser, el editor del lider y el inventario.
- `frontend/src/components/PhaserGame.jsx` crea Phaser y conecta los eventos React-Phaser.
- `frontend/src/game/ExplorationScene.js` controla mapa, movimiento, formacion y cambio de lider.
- `frontend/src/game/gameEvents.js` centraliza los `CustomEvent` compartidos.
- `frontend/src/components/inventory/` modula el inventario: `useInventoryPanel.js` (estado y acciones), `inventoryUtils.js` (helpers puros), `inventoryOperations.js` (operaciones puras de items y cálculo de carga/bonos), `inventoryKeyHandler.js` (teclado) y los subcomponentes `InventoryHeader.jsx`, `InventoryGrid.jsx`, `InventoryDetail.jsx`, `InventoryStats.jsx` y `TransferModal.jsx`; `InventoryPanel.jsx` los compone. Cada subcomponente tiene su propio `.css` (`InventoryPanel.css` conserva el layout y el tema por clase; `TransferModal.css` el modal); `inventoryKeyHandler.js` reutiliza `game/hotkeys.js` para los atajos de personaje.
- `frontend/src/hooks/usePersonajes.js` y `frontend/src/services/api.js` gestionan los personajes y la API.
- `backend/` contiene Express con capas separadas: rutas, controlador delgado, servicios (`personajesService.js`, `inventarioService.js`) y utilidades (`asyncDb.js`, `errors.js`) sobre un pool MySQL.
- `sentencias-sql/` contiene el esquema, datos iniciales, consultas y vistas.
- `start-app.sh` levanta Docker/MySQL, ejecuta la migracion, inicia backend y frontend.

## Estado confirmado por documentacion

- Exploracion Phaser integrada en React.
- Grupo de hasta tres personajes con seguidores.
- Cambio de lider con `1`, `2` y `3`.
- Movimiento con flechas y `WASD`.
- Colisiones y camara de exploracion.
- Edicion de estadisticas del lider con `U` y cierre con `Escape` (confirmado).
- Inventario visual abierto con `I` (confirmado).
- Eventos React-Phaser centralizados (confirmado).
- Modularizacion confirmada por pruebas en navegador: backend en capas (`services/`, `utils/`, controlador delgado sobre pool MySQL), exploracion descompuesta en `game/*` (constants, board, party, movement, input, hotkeys) e inventario en `components/inventory/*`.
- Persistencia de inventario y estadisticas entre reinicios: la migracion hace una carga inicial solo si las tablas estan vacias y no sobrescribe los datos del usuario (confirmado).

## Trabajo actual: inventario

El módulo de inventario (`frontend/src/components/inventory/`) ofrece:

- Inventario separado por personaje.
- El aside de personajes (`EQUIPO`) muestra la cantidad de objetos de cada personaje (se calcula desde la API al abrir el inventario); el pie del panel quedó solo con el aviso de estado.
- Seleccion por teclado con `1`, `2` y `3`.
- Navegacion y seleccion visual con `WASD` o flechas.
- Seleccion y preparacion de objetos con `Enter` o espacio.
- El movimiento de objetos requiere confirmar con `Enter` despues de seleccionar el destino.
- Movimiento, intercambio y acumulacion mediante teclado o arrastrar y soltar.
- Division de pilas con `R`.
- Soltar objetos con `Q`.
- Indicador de oro, peso y detalle del objeto.
- Tema de color según la clase del personaje activo, visible en el borde, selección, controles y cabecera.
- Persistencia por personaje mediante las tablas `Objeto` e `Inventario` y la API de inventario.
- Consumo de objetos con la tecla `E`.
- Equipar/desequipar con la tecla `E`, soltar con `Q` y dividir pilas con `R`.
- El pie muestra las claves de acceso rápido: `E` Equipar·Usar, `Q` Soltar, `R` Dividir, `V` Detalles, `G` Equipo, `I` Salir.
- `Ver detalles` aparece al posicionarse sobre una ranura ocupada y la descripción se abre al pulsarla de nuevo.
- `G` cambia entre la navegación de mochila y equipamiento; en equipamiento se recorren las seis ranuras con WASD/flechas y Enter.
- El peso total conserva el peso de los objetos equipados, mientras la capacidad sigue dependiendo de la Fuerza.
- Movimiento de exploración continuo en 360 grados con diagonales normalizadas, límites y colisión contra la pared.
- Capacidad de carga calculada como `10 + Fuerza * 1.5`.
- Cuadrícula ampliada a 48 ranuras de prueba con scroll interno para soportar más pilas.
- Equipamiento persistente por personaje con ranuras de casco, pecho, pantalón, botas, arma y arma secundaria.
- Bonificaciones de equipamiento para Fuerza, Destreza, Inteligencia, Constitución y Agilidad.
- El equipo puesto no se cuenta en el peso de la mochila; su bonificación de Fuerza sí aumenta la capacidad.
- Filtros por categoría y rareza en la cabecera del inventario, con contador de objetos visibles y botón para limpiar filtros. Atajos de teclado: `F` cicla la categoría y `Shift+F` la rareza (dan la vuelta por las opciones).
- Auto-orden de la mochila con la tecla `O`: une pilas del mismo objeto (respetando el máximo por pila) y acomoda la cuadrícula por categoría/nombre/rareza.
- Traspaso de la pila seleccionada con la tecla `T`: abre un modal visual que muestra el objeto y pregunta a qué personaje enviarlo. Se elige con botones o con `1/2/3` (el personaje activo queda deshabilitado), `Escape` o `Cancelar` cierra. Se junta en pilas del mismo objeto del destino y, si hace falta, ocupa el primer slot vacío; si el destino elegido está lleno, no recibe el objeto. El backend lo hace en una transacción (`POST /personajes/:id/inventario/:ranura/transferir`).
- La navegación con WASD/flechas salta a los objetos que coinciden con el filtro activo; los que no coinciden se atenúan.
- Mientras el inventario o el editor está abierto, el input de Phaser queda bloqueado (`game/inputLock.js`: `lockInput`/`unlockInput`/`isInputLocked`), por lo que el grupo no se mueve ni responden atajos de la escena hasta cerrar el panel.
- El panel mide `min(96vw, 1240px)` con una cuadrícula de 8 columnas (48 ranuras en 6 filas); la navegación por teclado sigue usando `GRID_COLUMNS`.
- Doble clic sobre un objeto de la mochila lo equipa (si es equipable) o lo consume (si es consumible). Doble clic sobre una ranura de equipamiento desequipa el objeto al primer hueco libre de la mochila.
- Arrastre con el mouse también funciona en ambos sentidos: soltar un objeto de la mochila sobre la ranura de equipo correcta lo equipa (no en otra ranura), y arrastrar un objeto equipado sobre un hueco de la mochila lo desequipa directo a ese hueco. El backend usa una variante de desequipado a ranura concreta (`POST /personajes/:id/equipamiento/:ranura/desequipar/:ranuraDestino`, transacción).

La seleccion numerica fue probada desde el navegador para el personaje 2 y funciona. La confirmacion funcional final corresponde al usuario.
El cambio de color por clase fue confirmado visualmente por el usuario.
La persistencia, el consumo y la capacidad quedan pendientes de prueba manual del usuario.
El consumo con `E` fue confirmado por el usuario (la cantidad de la pila baja y el objeto desaparece al llegar a 0).
El peso total y la capacidad se muestran en el pie, pero la capacidad de peso NO bloquea mover/acomodar objetos dentro del inventario: el jugador puede dejar un objeto aunque esté sobre el límite, para transferirlo a otro personaje que sí tenga capacidad. El límite se aplicará al recoger objetos desde la exploración (pendiente, en el planning).
El equipamiento con `G` fue confirmado por el usuario: equipar/desequipar con `E`, soltar con `Q` y dividir pilas con `R` funcionando.
El movimiento continuo fue probado y confirmado por el usuario.
Confirmado por el usuario: contador de objetos por personaje en el aside, pie del panel solo con el aviso de estado, filtros con `F`/`Shift+F`, auto-orden con `O`, bloqueo de input con el panel abierto, ancho de panel ampliado, grilla de 8 columnas y el traspaso con `T` (modo que pregunta a qué personaje enviar con `1/2/3`, Escape cancela).
- El drag y el doble clic quedan pendientes de confirmación visual del usuario.
- "Ver detalles" (`V` o clic sobre el objeto ya seleccionado) ya no se despliega dentro de la columna derecha: abre un modal tipo el de traspaso (`DetailsModal.jsx`, portal a `body`, clic fuera/Escape/botón Cerrar lo cierra, keyhandler bloquea el resto mientras está abierto). La columna derecha queda solo con la equipación.
- Mejoras con mouse implementadas (pendientes de confirmación): tooltip al pasar el cursor sobre un objeto de la mochila o equipo (`InventoryTooltip.jsx`, portal a `body`); drop sobre el tab de otro personaje en `CharacterSelector` transfiere el objeto arrastrado directamente (el panel expone `transferFromSlot` por ref, sin pasar modal); soltar una pila con `Shift`/`Ctrl` separa 1 unidad a ese hueco (`moveSingleItem`); el swap al soltar sobre un slot ocupado ya existía en `moveOrMergeItems`.
- Mejoras mouse/teclado de nueva interacción (pendientes de confirmación): la rueda del mouse sobre la grilla mueve la selección con una pasada filtrada si hay filtro activo, y `Shift+rueda` cicla la categoría (hacia abajo) o la rareza (hacia arriba) — listener nativo con `passive: false` en `InventoryGrid` para poder hacer `preventDefault`. El menú contextual del clic derecho tiene ahora una opción "Enviar a" con submenú por personaje (excluye al activo) que transfiere directo al destino elegido; se navega con flechas/Enter y `Escape` cierra una capa a la vez. `C` sobre una pila abre el modal `SplitModal.jsx` para separar una cantidad exacta (`splitStackByQuantity` en `inventoryOperations.js`); `Tab`/`Shift+Tab` cambia de personaje en el panel y el doble clic sobre una pestaña del aside también lo activa.
- Vida y maná reales por personaje: la tabla `Estadistica` tiene `vidaActual`/`manaActual` (persistidos). Los máximos NO se guardan: se derivan como `vidaMax = 30 + constitucion*5` y `manaMax = 20 + inteligencia*5` (duplicado en `migrate-rpg.js`, `personajesService.js` y `inventarioService.js`; a diferencia de la fórmula de pesos por clase, esta es cálculo puro, no requiere mantenerse en el form React). La migración hace backfill inicial (recursos al máximo para filas existentes). Al consumir un objeto con `efectoVida`, `usarObjeto` aplica el incremento con tope en `vidaMax` dentro de la misma transacción y devuelve `effect: { vida, vidaActual, manaActual }`. `GET /personajes` y `GET /personajes/:id` exponen `vidaActual`, `vidaMax`, `manaActual`, `manaMax`. Al editar stats (PUT), los recursos actuales se clampean al nuevo máximo. Las barras de Vida/Maná se muestran en el panel en `InventoryResources.jsx/.css`. Todo queda pendiente de confirmación visual del usuario.

## Trabajo actual: interfaz (rama `interfaz`)

Iteración de interfaz sobre la exploración, empezando por un minimapa y un HUD de grupo fijo (ambos pendientes de confirmación visual del usuario):

- `frontend/src/components/Minimap.jsx`/`.css`: radar en la esquina superior derecha sobre el canvas. Dibuja en un `<canvas>` el mundo completo escalado (36×22 tiles): fondo, grilla, muros de `WALL_TILES` y un punto por ficha del grupo con su color de `PARTY_COLORS`; el líder lleva un aro blanco y radio mayor.
- `frontend/src/components/GroupHud.jsx`/`.css`: panel fijo en la esquina inferior izquierda con los 3 personajes (nombre, barra de Vida en rojo y barra de Maná en azul, con porcentaje real desde `vidaActual/vidaMax/manaActual/manaMax`); el líder se resalta con el color dorado del tema.
- `frontend/src/hooks/usePartyPositions.js`: suscribe el evento `party-position-update` y mantiene las posiciones en coordenadas de tile (convierte los px del mundo con `worldToTile`) más el `leaderIndex`. El estado inicial sale de `PARTY_POSITIONS`.
- Puente Phaser→React: `gameEvents.js` ganó `partyPositionUpdate` y el emisor `emitPartyPositionUpdate(positions, leaderIndex)`. `ExplorationScene.js` lo dispara al crear la escena, al cambiar de líder (`setLeader`) y en `update` cuando el líder cambia de casilla (se cachea la última casilla para no spamear eventos en cada frame).
- Ambas piezas se montan en `ExplorationView.jsx` junto a `<PhaserGame/>`; son overlays con `pointer-events: none` para no bloquear el input de la escena.

## Planning posterior del inventario

- Validar límites de pila y capacidad al recoger objetos desde la exploración.
- Integrar el equipamiento con las estadísticas efectivas del personaje y el combate.
- Decidir si se incorporan ranuras de aretes, collar u otros accesorios.

## Como ejecutar

Desde la raiz del proyecto:

```bash
./start-app.sh
```

URLs esperadas:

- Frontend: `http://localhost:5173/`
- API: `http://localhost:3000/`

Requisitos: Docker, Node.js 18 o superior y `pnpm`.

## Regla de trabajo

Antes de iniciar una tarea debo consultar este archivo, `docs/project-graph.md`, el documento de diseño y arquitectura y `README.md`. Los cambios implementados se dejan pendientes de confirmacion hasta que el usuario los pruebe en el navegador. No debo repetir tareas ya marcadas como completadas ni modificar partes no relacionadas.

Siempre debo modularizar el codigo cuando sea posible: preferir archivos pequeños y con una sola responsabilidad (hooks, helpers puros, subcomponentes) y componerlos desde un punto de entrada, antes que acumular logica inline en archivos grandes.
