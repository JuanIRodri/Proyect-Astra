# Contexto de trabajo del proyecto

## Proyecto

Proyect-Astra es un RPG tactico 2D web. La interfaz usa React y Vite, la escena de exploracion usa Phaser 3, la API usa Node.js y Express, y los datos persisten en MySQL mediante Docker.

## Arquitectura que debo respetar

- `frontend/src/App.jsx` compone el dashboard y la vista de exploracion.
- `frontend/src/components/ExplorationView.jsx` conecta Phaser, el editor del lider y el inventario.
- `frontend/src/components/PhaserGame.jsx` crea Phaser y conecta los eventos React-Phaser.
- `frontend/src/game/ExplorationScene.js` controla mapa, movimiento, formacion y cambio de lider.
- `frontend/src/game/gameEvents.js` centraliza los `CustomEvent` compartidos.
- `frontend/src/components/InventoryPanel.jsx` controla la UI y el estado local del inventario.
- `frontend/src/hooks/usePersonajes.js` y `frontend/src/services/api.js` gestionan los personajes y la API.
- `backend/` contiene Express, controladores, rutas y conexion MySQL.
- `sentencias-sql/` contiene el esquema, datos iniciales, consultas y vistas.
- `start-app.sh` levanta Docker/MySQL, ejecuta la migracion, inicia backend y frontend.

## Estado confirmado por documentacion

- Exploracion Phaser integrada en React.
- Grupo de hasta tres personajes con seguidores.
- Cambio de lider con `1`, `2` y `3`.
- Movimiento con flechas y `WASD`.
- Colisiones y camara de exploracion.
- Edicion de estadisticas del lider con `U` y cierre con `Escape`.
- Inventario visual abierto con `I`, implementado pero pendiente de confirmacion manual del usuario.
- Eventos React-Phaser centralizados, implementados pero pendientes de confirmacion manual del usuario.

## Trabajo actual: inventario

`InventoryPanel.jsx` ofrece:

- Inventario separado por personaje.
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
- Capacidad de carga calculada como `10 + Fuerza * 1.5`.
- Cuadrícula ampliada a 48 ranuras de prueba con scroll interno para soportar más pilas.
- Equipamiento persistente por personaje con ranuras de casco, pecho, pantalón, botas, arma y arma secundaria.
- Bonificaciones de equipamiento para Fuerza, Destreza, Inteligencia, Constitución y Agilidad.
- El equipo puesto no se cuenta en el peso de la mochila; su bonificación de Fuerza sí aumenta la capacidad.

La seleccion numerica fue probada desde el navegador para el personaje 2 y funciona. La confirmacion funcional final corresponde al usuario.
El cambio de color por clase fue probado tecnicamente en navegador y queda pendiente de confirmacion visual del usuario.
La persistencia, el consumo y la capacidad quedan pendientes de prueba manual del usuario.

## Planning posterior del inventario

- Filtros por categoría y rareza.
- Aplicar los efectos de consumo a vida/maná reales del personaje.
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
