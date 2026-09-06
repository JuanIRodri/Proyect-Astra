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

### Implementado pero pendiente de confirmacion del usuario
- [ ] Centralizar los eventos de comunicacion entre React y Phaser mediante `CustomEvent`.
- [ ] Mostrar el inventario visual con la tecla `I` durante la exploracion.

### Pendiente de implementacion
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