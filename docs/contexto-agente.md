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

La seleccion numerica fue probada desde el navegador para el personaje 2 y funciona. La confirmacion funcional final corresponde al usuario.
El cambio de color por clase fue probado tecnicamente en navegador y queda pendiente de confirmacion visual del usuario.

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
