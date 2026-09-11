Documento de Diseño y Arquitectura: RPG Táctico Web
________________
1. Visión General del Proyecto
Juego de rol (RPG) 2D desarrollado para la web con enfoque en la exploración, la toma de decisiones basada en estadísticas del grupo y un sistema de combate por turnos en arenas acotadas.
2. Pila Tecnológica (Tech Stack)
Capa / Módulo
	Tecnología
	Responsabilidad
 
	Interfaz & Estado
	React
	Gestión del estado global (ficha de personaje, stats, inventario, UI de combate, cuadros de diálogo y logs).
	Motor Gráfico
	Phaser 3
	Renderizado del mapa 2D, físicas, colisiones, animaciones de movimiento y cámara.
	Edición de Mapas
	Tiled
	Diseño de niveles por capas (tilemaps) y definición de objetos/zonas de interacción.
	Comunicación
	Events (JS)
	Emisión y recepción de eventos nativos (CustomEvent / window.dispatchEvent) entre React y Phaser.
	3. Sistema de Personajes y Estadísticas
Ficha de Personaje (Manejada en React)
El jugador gestiona un grupo de 2 a 3 personajes, cada uno con un rol y estadísticas propias que influyen directamente en la jugabilidad.
* Fuerza: Permite interactuar con obstáculos físicos en el mapa (ej. mover piedras) y aumenta el daño físico.
* Percepción: Revela objetos, cofres o pasajes ocultos al explorar.
* Agilidad: Determina el rango de movimiento por casillas dentro de las batallas y la velocidad de desplazamiento.
* Vida (HP) / Maná (MP): Recursos de combate.
4. Modos de Juego y Mecánicas
4.1. Modo Exploración (Mapa)
* Formación de Grupo (Seguidor): El grupo camina junto. El Líder guía el camino y los acompañantes siguen su historial de posiciones a una distancia fija.
* Cambio de Líder en Tiempo Real (1, 2, 3): Al presionar las teclas numéricas, el jugador cambia qué personaje es el líder. La cámara de Phaser se reajusta automáticamente al nuevo personaje.
* Interacción con el Entorno (Checks de Stats):
   * Al presionar la tecla de acción (ej: E), se evalúa la casilla/objeto frente al grupo.
   * Si el objeto requiere un valor de stat (ej: Fuerza >= 14), se compara contra el personaje seleccionado o el máximo del grupo.
   * Éxito: Phaser ejecuta la animación (mueve la piedra, revela el pasaje).
   * Fallo: Phaser emite un evento a React para mostrar una notificación en la UI.
4.2. Modo Batalla (Combate por Turnos Táctico)
* Transición y Arena Acotada:
   * Al colisionar con un enemigo en el mapa, el juego entra en estado de combate.
   * Se genera una arena o límite físico estático en esa zona del mapa que impide que los personajes o enemigos escapen.
* Movimiento Limitado por Casillas (Algoritmo BFS):
   1. Inicio de Turno: Phaser calcula las casillas alcanzables según la stat de Agilidad/Movimiento del personaje activo mediante un algoritmo de Breadth-First Search (Inundación).
   2. Overlay Visual: Se dibujan recuadros azules semi-transparentes sobre las casillas válidas en la grilla.
   3. Desplazamiento: Al hacer clic en una casilla permitida, el personaje se mueve mediante un tween animado.
   4. Pausa para Acción: Al terminar el movimiento, React habilita la UI de comandos ([Atacar], [Habilidad], [Pasar Turno]).
5. Arquitectura de Comunicación (React ↔ Phaser)
                       ┌──────────────────────────────┐
                      │          REACT (UI)          │
                      │  • Estado de Stats (Stats)   │
                      │  • UI de Diálogos y Menús    │
                      └──────────────┬───────────────┘
                                     │
              ┌──────────────────────┴──────────────────────┐
              │                                             │
              ▼ (Pasa stats iniciales)                      ▼ (Escucha eventos de juego)
┌──────────────────────────────┐             ┌──────────────────────────────┐
│           PHASER 3           │  Eventos    │         COMPONENTES UI       │
│  • Bucle de Juego (Render)   ├────────────►│  • Notificaciones de checks  │
│  • Físicas y Colisiones      │  Nativos    │  • Menú de Acciones Batalla  │
│  • Detección de Teclado      │             │  • Barras de Vida / Maná     │
└──────────────────────────────┘             └──────────────────────────────┘

6. Próximos Pasos Pendientes (Fase de Desarrollo)
* Configurar el proyecto inicial montando Phaser dentro de un componente <div id="phaser-game"> en React.
* Diseñar el mapa de prueba básico en Tiled exportado a formato JSON.
* Crear el script de lectura de mapa con capas de colisión en Phaser.
* Implementar la lógica del grupo con formación seguidor y cambio de líder (1, 2, 3).
* Desarrollar la lógica BFS de rango de movimiento en grilla para las batallas.

7. Estado de Avance y Seguimiento
Este apartado registra lo que ya se implemento y lo que continua pendiente. Debe actualizarse despues de cada avance confirmado por el usuario.

### Completado y confirmado por el usuario
- [x] Instalar Phaser 3.90.0 en `frontend/` mediante pnpm.
- [x] Montar Phaser dentro de React mediante `frontend/src/components/PhaserGame.jsx`.
- [x] Crear una escena de exploracion inicial en `frontend/src/game/ExplorationScene.js`.
- [x] Renderizar un tablero de prueba con personajes y una pared bloqueante.
- [x] Detectar teclas `1`, `2`, `3`, flechas y `WASD`.
- [x] Cambiar el lider y moverlo en la escena.
- [x] Detectar el bloqueo contra el elemento de la pantalla.
- [x] Confirmar funcionamiento visual y de teclado mediante prueba manual del usuario.
- [x] Implementar y confirmar la formacion de seguidores mediante historial de posiciones.
- [x] Separar y confirmar la prueba de Phaser del dashboard mediante una vista React independiente.
- [x] Enlazar y confirmar los personajes del dashboard con la formacion de Phaser.
- [x] Incluir y confirmar la edicion de estadisticas del lider mediante la tecla `U` en exploracion.
- [x] Cerrar y confirmar con `Escape` el editor de estadisticas abierto desde la exploracion.
- [x] Evitar y confirmar la edicion del nombre al modificar estadisticas desde la exploracion.
- [x] Implementar y confirmar la camara siguiendo al lider actual.
- [x] Implementar y confirmar el tablero de exploracion ampliado.
- [x] Barra de acceso rápido (hotbar) con 5 ranuras (teclas `4`-`8`): visible en la pantalla de exploración para usar consumibles de un teclazo o asignándolos con el mouse (picker), y dentro del inventario donde se rellena arrastrando objetos desde la mochila o asignando con `4`-`8` estando el objeto seleccionado. Las asignaciones se guardan por personaje en `localStorage` (`astra-hotbar`) como referencia al `itemKey` (robusto a reordenamientos). Al usar un consumible se consume desde la ranura real de la mochila y se muestra feedback (`+X Vida`); si se agota, la ranura se libera sola. El cambio de líder (`1`/`2`/`3`) emite `leader-change` para mantener sincronizado a React. Módulos: `game/hotbarConfig.js`, `hooks/useHotbar.js`, `components/Hotbar.jsx` + `Hotbar.css`.
- [x] Tooltip de ficha de objeto reemplazando al anterior: al pasar el mouse sobre cualquier objeto de la mochila, un slot de equipamiento o una ranura/pick de la hotbar se muestra una tarjeta flotante (vía portal a `document.body`, con ajuste a los bordes de la ventana) con nombre, cantidad, rareza (color según Raro/Épico/Legendario), categoría, peso, efecto de vida, pila máxima, descripción y bonificaciones de stats. Módulos: `hooks/useItemTooltip.js`, `components/ItemTooltip.jsx` + `ItemTooltip.css`. Se eliminó el `InventoryTooltip` anterior.
- [x] Guardar las posiciones exactas del grupo en la partida: la tabla `Partida` ahora tiene la columna `posiciones` (JSON) con las coordenadas de los 3 personajes; al cargar se restauran tal cual y `getSafePositions()` (en `board.js`) reubica cualquier ficha que hubiera quedado dentro de una colisión antes de spawnear (también cubre guardados viejos que solo tenían `liderX/liderY`).
- [x] Rediseñar el menú de inicio con la estética del inventario: "Continuar" retoma la partida guardada más reciente, "Cargar partida" lista todos los guardados para elegir, "Nueva partida" pide confirmar el slot a sobrescribir y "Opciones" ofrece dos subpantallas: "Audio" (Música y Efectos de sonido, persistidos en `localStorage` como `astra-opciones`) y "Atajos de teclado". Navegación por teclado (W/S + Enter, A/D o flechas para ajustar, X para borrar y ESC para volver) en `mainmenu/` (`MenuHome.jsx`, `MenuCargar.jsx`, `MenuNueva.jsx`, `MenuOpciones.jsx`, `MenuOpcionesAudio.jsx`, `MenuOpcionesTeclas.jsx`, `useMenuNav.js`, `useOpciones.js`, `useTeclas.js`, `utils.js`).
- [x] Atajos de teclado editables desde Opciones (persistidos en `localStorage` como `astra-teclas`): cada acción (movimiento, líderes 1/2/3, editar estadísticas, inventario, interactuar) se puede rebindear pulsando una tecla sobre su fila. Si la tecla ya está asignada a otra acción se muestra un mensaje de conflicto: Enter la reasigna (la quita de la otra acción, que queda sin tecla) o ESC cancela. También hay opción de restablecer los valores por defecto. El juego (`hotkeys.js`, `input.js`, `movement.js`) y el inventario leen los bindings desde `game/bindings.js`.
- [x] Bloquear el scroll global de la página para que el juego no se comporte como una web (`overflow: hidden` + `overscroll-behavior: none` en `index.css`); los paneles del menú tienen scroll interno solo si exceden la altura de la ventana.
- [x] Subpantalla "Video" en Opciones (persistida en `localStorage` como `astra-video`): Pantalla completa (fullscreen API; no se sale con ESC — el hook `useOpcionesVideo` vuelve a pedir fullscreen de inmediato mientras el toggle esté activo, solo se desactiva desde Opciones), Marcador del líder (el recuadro dorado que sigue al héroe activo), Overlay de cuadrícula (capa de casillas brillantes sobre el tablero, `createGridOverlay()` en `board.js`) y Reducir efectos visuales (desactiva la pulsación del marcador; queda preparado para partículas/screen shake). Los cambios se aplican **en vivo**: el hook emite `video-settings-change` (`gameEvents.js`) y la escena los aplica sin recrear (también se leen al crearla, para el caso del menú de inicio).
- [x] Opciones disponible también durante la exploración: el menú de pausa (ESC) suma "Opciones", y tanto el menú de inicio como la pausa comparten el mismo stack reutilizable `mainmenu/OpcionesStack.jsx` (hub Audio/Video/Atajos + subpantallas). PauseMenu maneja el ESC propio (de subpantallas → hub → pausa → cerrar) para no interferir con las capturas de tecla.
- [x] Centralizar los eventos de comunicacion entre React y Phaser mediante `CustomEvent` (modulo `gameEvents.js`).
- [x] Mostrar el inventario persistente por personaje con la tecla `I` durante la exploracion.
- [x] Consumir objetos desde el inventario (los objetos se consumen correctamente; los efectos en vida/mana quedan pendientes hasta implementar el sistema de HP/MP).
- [x] Calcular la capacidad de carga segun la Fuerza del personaje.
- [x] Ampliar la cuadricula del inventario y soportar mas pilas de objetos.
- [x] Equipar casco, pecho, pantalón, botas, arma y arma secundaria por personaje.
- [x] Aplicar bonificaciones de equipamiento a las cinco estadisticas.
- [x] Agregar boton en el inventario para cambiar a la vista de equipamiento (tecla `G`).
- [x] Excluir el equipo puesto del peso de la mochila.
- [x] Añadir filtros por categoria y rareza al inventario.
- [x] Auto-orden de la mochila: unir pilas del mismo objeto y acomodar la cuadricula (tecla `O`).
- [x] Confirmar movimiento continuo en 360 grados con diagonales y seguidores suaves.

### Pendiente de implementacion
- [ ] Decidir si se añaden ranuras de aretes, collar u otros accesorios.
- [x] Aplicar los efectos de consumo a los recursos de vida/maná del personaje (pendiente de confirmación visual).
- [ ] Diseñar y cargar un mapa de prueba exportado desde Tiled.
- [ ] Leer capas de colision desde un mapa Tiled.
- [ ] Reajustar la camara al personaje lider.
- [ ] Interaccion con el entorno mediante tecla `E` y checks de estadisticas.
- [ ] Emitir notificaciones de checks fallidos hacia React.
- [ ] Transicion a combate al colisionar con un enemigo.
- [ ] Crear arena acotada con limites fisicos.
- [ ] Implementar BFS para el rango de movimiento tactico.
- [ ] Dibujar overlay de casillas alcanzables.
- [ ] Permitir movimiento tactico y habilitar comandos de combate en React.

### Regla de seguimiento
Antes de comenzar una tarea, consultar este documento y `docs/project-graph.md`. No repetir tareas marcadas como completadas. Al terminar una implementacion, dejarla como pendiente de confirmacion; marcarla como completada solo despues de que el usuario confirme la prueba funcional en el navegador.