# Proyect-Astra — AGENTS.md

Guía operativa para agentes que trabajan en este repo.

RPG táctico 2D web: React 19 + Vite 8 (interfaz), Phaser 3.90 (exploración isométrica), Express 5 (API REST) y MySQL 8 en Docker (persistencia).

**Idioma**: textos de UI, comentarios y mensajes de commit en español. Nombres de archivos, funciones y variables en inglés, salvo el dominio ya existente en la base de datos (que está en español).

---

## 0. Reglas de oro (no negociables)

1. **Nunca commitees en `main`.** Creá la rama `feature/<tarea>` desde `main` actualizado y abrí un PR. En una rama solo se tocan archivos de esa tarea.
2. **Sin dependencias nuevas sin avisar.** Primero buscá una solución con lo que ya hay (react, phaser, axios, vitest, node:test). Si de verdad hace falta una librería, proponela antes de instalarla.
3. **No cambies el esquema de la BD ni el contrato HTTP** (rutas, nombres de campos, códigos de error) sin confirmación explícita.
4. **Modularizá siempre.** Un archivo = una responsabilidad. Si un archivo pasa las ~300 líneas, extraé la lógica a un módulo (helper puro, hook o subcomponente) y dejá el punto de entrada componiendo.
5. **Responsive obligatorio** en cualquier panel, modal u overlay.
6. **Verificá antes de entregar**: `pnpm lint`, `pnpm test` y `pnpm run build` en verde (§10).
7. **Cero secretos**: `backend/.env` nunca al repo.
8. **Nada de refactors colaterales**: si encontrás un problema fuera del alcance, anotalo y reportalo; no lo arregles de paso.
9. **Queda "pendiente de confirmación"** hasta que el usuario lo pruebe en el navegador.

---

## 1. Stack tecnológico y límites de uso

| Área | Tecnología | Se usa para | Evitar |
| --- | --- | --- | --- |
| UI | React 19 (`react-dom`) | componentes, hooks, overlays | — |
| Build | Vite 8 + `@vitejs/plugin-react` | dev server, build, alias `@/` → `src/` | imports con rutas relativas |
| Juego | Phaser 3.90 | escena, tilemap, cámara, sprites | lógica de negocio dentro de la escena |
| HTTP | axios 1.16 | **solo** en `frontend/src/services/api.js` | `axios`/`fetch` en componentes o hooks |
| API | Express 5 | rutas y middlewares (helmet, cors, rate-limit, morgan) | lógica de negocio en rutas o controladores |
| BD | MySQL 8 (`mysql2`) | SQL crudo en `backend/services/` | ORM, query builder, migraciones automáticas |
| Tests FE | Vitest 5 (`environment: 'node'`) | módulos puros | RTL/jsdom (no están instalados) |
| Tests BE | `node:test` + `node:assert` | servicios sin BD | tests que peguen a la BD real |
| Lint | ESLint 10 (flat config) | `frontend/src` | Prettier (no existe en el repo) |
| Git | pnpm 9 + husky + lint-staged | pre-commit, CI | `npm install` (hay lockfiles npm duplicados) |

---

## 2. Dónde va cada cosa

| Si la pieza es… | Va en… | Ejemplo |
| --- | --- | --- |
| Escena, rejilla, isométrica, colisión, input o settings de Phaser | `frontend/src/game/<tema>.js` | `collision.js`, `isometric.js` |
| Estado/datos compartidos por varios componentes | `frontend/src/hooks/useXxx.js` | `usePersonajes.js` |
| Estado/hook que consume un solo componente o feature | junto a ese componente | `inventory/useInventoryPanel.js` |
| Lógica pura testeable (sin React, sin red, sin JSX) | `*Utils.js` / `*Operations.js` | `inventoryOperations.js` |
| Vista | `components/<feature>/Xxx.jsx` + `Xxx.css` | `InventoryGrid.jsx` |
| Cliente HTTP | `frontend/src/services/api.js` | — |
| SQL y reglas de negocio | `backend/services/*.Service.js` | `inventarioService.js` |
| Validación de entrada | `backend/utils/validate.js` | `expectIntParam` |
| Errores HTTP | `backend/utils/errors.js` | `AppError` |

No existe un `utils/` global: los helpers son privados de su feature (p. ej. `components/inventory/inventoryUtils.js`).

---

## 3. Convenciones de código

- **Archivos**: camelCase (`inventoryKeyHandler.js`), componentes en PascalCase (`InventoryGrid.jsx`), hooks `useXxx.js`, servicios backend `xService.js`, controladores `xController.js`, rutas `xRoutes.js`, tests `x.test.js` pegados al módulo.
- **Tamaño**: ~300 líneas como techo por archivo (§0.4). Hoy el peor caso es `backend/services/inventarioService.js` (~310 líneas). El panel de inventario ya se dividió en sub-hooks (ver §4).
- **Estilos**: CSS plano, un `.css` por componente, importado desde su `.jsx`. Sin CSS-in-JS, sin `!important` salvo necesidad puntual. Clases en kebab-case; el tema por clase de personaje usa el prefijo `inventory-class-*` + la variable CSS `--inventory-accent`.
- **Comentarios**: sólo para explicar *por qué*, nunca *qué*. En español.
- **Constantes**: nada de números mágicos; van en `game/constants.js`, `inventory/inventoryConstants.js`, `inventory/inventoryUtils.js` o `backend/utils/validate.js`.
- **Errores**: en backend los servicios lanzan `AppError(status, msg)` y el middleware central responde `{ error: mensaje }`. En frontend se lee `error.response?.data?.error` y se muestra un aviso al usuario.

---

## 4. React: componentes y hooks

Las aplica `eslint-plugin-react-hooks` en CI: romperlas = lint rojo.

- **Nombre y ubicación**: `useXxx.js`. Si lo consumen **2 o más** componentes → `src/hooks/`. Si lo consume **uno solo** → junto a ese componente (`components/<feature>/`).
- **Un hook no renderiza**: devuelve `{ datos, acciones }` y nada de JSX.
- **Hooks de React solo en componentes y hooks.** Dentro de `game/` (Phaser) no se usan: el estado de la escena vive en los objetos de Phaser.
- **`useEffect` sólo para efectos**: suscripciones, timers, listeners, peticiones. **Nada de estado derivado en `useEffect`** → `useMemo`.
- **Limpieza siempre**: toda suscripción a `gameEvents.js` devuelve el cleanup (`return subscribeToGameEvent(...)`) y todo listener de `window` se quita en el cleanup del efecto.
- **Dependencias completas** en `useEffect`/`useCallback`/`useMemo` (regla `exhaustive-deps`). Si falta una, se cambia el diseño (sub-hook o `useRef`), no se silencia la regla.
- **Estado derivado**: `useMemo` para listas y cálculos caros (filtros, índices filtrados, `computeLoadStats`).
- **Callbacks hacia abajo**: las props de función son `useCallback` cuando el hijo las usa como dependencia.
- **Evitar prop drilling**: a más de dos niveles, subir el estado a un hook común o componer.
- **Refs y portales**: `useRef` para refs de DOM (el inventario scrollea la ranura activa con `slotRefs`) y para exponer API imperative (`useImperativeHandle` en `InventoryPanel`). Los overlays flotantes (tooltip, modales) usan `createPortal` a `document.body`.
- **Patrón canónico**: `components/inventory/useInventoryPanel.js` es solo el **orquestador**: compone sub-hooks (`useInventoryData`, `useInventorySelection`, `useInventoryActions`, `useInventoryDrag`, `useInventoryContextMenu`), helpers puros (`inventorySelectors.js`, `inventoryUtils.js`, `inventoryOperations.js`) y el teclado (`inventoryKeyHandler.js` + `keys/`). Cuando un sub-hook supere el límite, se divide en otro sub-hook; lo que se pueda, se baja a un helper puro testeado.

---

## 5. Phaser: `frontend/src/game/`

- `ExplorationScene.js` **compone, no implementa**: delega en `board.js`, `party.js`, `movement.js`, `input.js`, `decor.js`, `mapCanvas.js`. La lógica nueva de escena va en un módulo propio.
- Isométrica 48×24: `isometric.js` (`isoProject`, `isoUnproject`, `isoWorldBounds`). Mundo de 36×22 tiles (`constants.js`).
- Colisiones: `collision.js` (`OBJECT_RADII`, `isTileBlocked`, `canOccupy` con hitbox elíptica por objeto). `board.js` re-exporta `canOccupy` y aporta `createGridOverlay` + `getSafePositions`.
- Teclado: `input.js` (atajos de escena: `1/2/3` líder, `U` editor, `I` inventario, `M` mapa), `hotkeys.js` (`getLeaderIndex`, único lugar del cluster `1/2/3`), `bindings.js` (teclas rebindeables, `localStorage: astra-teclas`).
- Estado compartido React↔Phaser: **solo** `gameEvents.js` (`GAME_EVENTS` + emisores + `subscribeToGameEvent`). Eventos: `open-character-editor`, `toggle-inventory`, `party-position-update`, `video-settings-change`, `leader-change`, `toggle-map`.
- Bloqueo de input con overlays abiertos: `inputLock.js` (`lockInput(reason)` / `unlockInput(reason)` / `isInputLocked()`), con motivo para no liberar dos veces.
- Persistencia en `localStorage`: `astra-teclas`, `astra-video`, `astra-opciones`, `astra-hotbar`. No inventar claves nuevas sin motivo.

---

## 6. Backend (`backend/`)

- Capas: `routes/` (URL y método) → `controllers/` (parsea request, valida, responde; **delgado**) → `services/` (SQL y reglas de negocio) → `utils/` (`asyncDb`, `errors`, `validate`) → `config/db.js` (pool).
- `index.js`: arranque. helmet + request-id + morgan (salvo `NODE_ENV=test`) + rate-limit (300 req/15 min sobre `/api`) + CORS con whitelist (`CORS_ORIGINS`) + `express.json({ limit: '1mb' })` + routers + 404 + middleware central de errores.
- **Validación server-side obligatoria** en `utils/validate.js` (`validateBody`, `expectIntParam`, `expectEquipmentSlot`, `validateInventoryItems`). No confíes en el frontend.
- Transacciones con `withTransaction()` para `create`/`update` de personajes y para todas las operaciones de inventario/equipamiento.
- **Naming de los datos**: tablas y columnas en `PascalCase` (`Cabeza_Forma`, `idPersonaje`, `vidaActual`); el **body de las requests** usa `snake_case` (`cabello_corte`); las **respuestas** exponen alias `PascalCase` (`Cabello_Corte`, `Ojos_Color`, `vidaMax`, `manaMax`). Si tocás uno, tocás los tres.
- Fórmulas duplicadas a mantener sincronizadas: pesos de stats por clase en `frontend/src/game/characterStats.js` **y** `backend/migrate-rpg.js`. Máximos derivados: `vidaMax = 30 + constitucion*5` y `manaMax = 20 + inteligencia*5` (`migrate-rpg.js`, `personajesService.js`, `inventarioService.js`).
- Entorno: `config/env.js` valida al arrancar que existan `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, y expone `PORT` y `CORS_ORIGINS`. Plantilla en `backend/.env.example`.

---

## 7. Contrato API

- Base: `http://localhost:3000/api` — **URL hardcodeada** en `frontend/src/services/api.js` (no hay `import.meta.env`).
- Routers montados: `/api/personajes` (`routes/personajesRoutes.js`) y `/api/partidas` (`routes/partidasRoutes.js`).
- Toda llamada del frontend pasa por `services/api.js`; los componentes no conocen URLs.
- Errores: `{ error: "mensaje" }` con status HTTP (`404` no encontrado, `400` validación, `500` por defecto). El frontend muestra `error.response?.data?.error`.
- Inventario: 48 ranuras. Equipamiento: 6 ranuras (`pecho`, `casco`, `pantalon`, `botas`, `arma`, `arma-secundaria`).
- Partidas: snapshot ligero (`mapa`, `liderX`, `liderY`, `liderIndex`, `posiciones` JSON, `fechaGuardado`); autosave con debounce de 800 ms desde `ExplorationView`.

---

## 8. Tests

- **Backend** (`node:test`): `backend/**/*.test.js`, junto al módulo. `pnpm --dir backend test` → 56 tests. Para testear servicios sin BD se inyecta un stub de `../utils/asyncDb` en `require.cache` (el pool es lazy justamente para esto).
- **Frontend** (Vitest): `frontend/src/**/*.test.js`, junto al módulo. `pnpm --dir frontend test` → 55 tests. Ojo: el `include` es `src/**/*.test.js` → **los tests `.jsx` no se ejecutan**.
- Cobertura real: **módulos puros** (utils, operations, isométrica, colisión, stats). No hay RTL ni jsdom → no escribas tests de componentes React salvo que se acuerde instalar el entorno.
- Convención: un test por comportamiento, nombre descriptivo en español, `node:assert` en backend y `expect` de Vitest en frontend.

---

## 9. UI y CSS

- Responsive obligatorio: nada de anchos fijos; usá `min(…vw, Npx)`, `max-height` + scroll interno y `min-height: 0` en contenedores flex/grid.
- Los overlays (`position: fixed/absolute`) llevan `z-index` y `pointer-events` coherentes; el HUD y el minimapa usan `pointer-events: none` para no robarle el input a la escena.
- El inventario mide `min(96vw, 1240px)` con grilla de 8 columnas × 6 filas (48 ranuras).
- Tema por clase: `getClassThemeKey(clase)` → clases `inventory-class-*` + variable `--inventory-accent`.
- Accesibilidad: todo control es un `<button>` real, con `aria-label` cuando es solo ícono. La navegación por teclado es requisito, no extra.

---

## 10. Verificación (obligatoria antes de entregar)

```bash
pnpm lint          # raíz → eslint frontend/src  (debe salir en 0)
pnpm test          # raíz → vitest (55) + node --test (56)
cd frontend && pnpm run build
```

Comandos puntuales:

```bash
cd frontend && pnpm exec eslint src        # lint del frontend
cd frontend && pnpm run test               # vitest
cd backend  && node --test                 # tests del backend
node --check backend/<archivo>.js          # solo sintaxis (lo usan lint-staged y CI)
```

- El lint del frontend está **en cero**: si falla, es culpa del cambio nuevo; no hay deuda previa que justificar.
- CI (`.github/workflows/ci.yml`): job frontend (lint + test + build) y job backend (`node --test` + `node --check` de todos los `.js`). El PR está verde cuando ambos jobs pasan.
- `pre-commit` (husky + lint-staged): `eslint --fix` en `frontend/**` y `node --check` en `backend/**`.

---

## 11. Flujo de trabajo

1. `git checkout main && git pull --ff-only` → `git checkout -b feature/<tarea>`.
2. Implementá y verificá (§10).
3. Commit en español, con el formato del repo: `Ámbito: descripción corta` (ej. `Frontend: opciones de teclas rebindeables`, `Backend: validación server-side en update`). Sin prefijos tipo `feat:`/`fix:`.
4. `git push -u origin feature/<tarea>` y abrí el PR contra `main` con `gh pr create`.
5. En el PR describí **qué** cambió, **por qué** y **cómo se verificó**, y dejá explícito lo que queda pendiente de prueba del usuario.
6. No commitees ni borres trabajo del usuario sin permiso.

---

## 12. Anti-patrones

- ❌ `axios`/`fetch` dentro de un componente → va en `services/api.js`.
- ❌ SQL en controladores → va en `services/`.
- ❌ Lógica de negocio dentro de `ExplorationScene.js` → va en `game/<tema>.js`.
- ❌ Estado derivado calculado en `useEffect` → `useMemo`.
- ❌ Archivos que crecen sin parar → dividir (hook, helper o subcomponente).
- ❌ `npm install` (conviven lockfiles npm y pnpm) → `pnpm`.
- ❌ Instalar dependencias nuevas sin avisar.
- ❌ Tocar `main` directo o mezclar tareas ajenas en la misma rama.
- ❌ Duplicar una fórmula (stats por clase, máximos de vida/maná) en un tercer lugar.
- ❌ Anchos fijos en px sin fallback fluido.
- ❌ Reimplementar algo que ya existe (buscá en `game/`, `inventory/`, `hooks/`).

---

## 13. Trampas conocidas

- `frontend/src/services/api.js` tiene la URL de la API **hardcodeada**: si cambia el puerto, hay que tocar el código.
- Conviven `package-lock.json` (backend y frontend) y `pnpm-lock.yaml`: **pnpm es el gestor canónico**; no regeneres ni borres lockfiles sin avisar.
- `start-app.sh` registra el `trap` de limpieza **después** de arrancar el frontend: si lo cortás con Ctrl+C puede quedar el backend huérfano (`pkill -f "node index.js"`).
- `backend/.env.test` existe pero ningún script lo usa.
- El paso de CI llamado "Verificar sintaxis" del backend en realidad ejecuta `node --test`.
- La migración (`backend/migrate-rpg.js`) solo carga datos si las tablas están vacías: no pisa lo que ya está.
- `docs/contexto-agente.md` y `docs/project-graph.md` son de referencia; si contradicen a este archivo, **manda `AGENTS.md`**.

---

## 14. Definition of Done

- [ ] Rama `feature/<tarea>` desde `main`, sin cambios fuera del alcance.
- [ ] `pnpm lint`, `pnpm test` y `pnpm run build` en verde.
- [ ] Sin secretos ni `.env` commiteado.
- [ ] Sin dependencias nuevas sin avisar; sin cambios de contrato ni de esquema sin confirmar.
- [ ] UI responsive (probada en ventana chica) si hubo cambios visuales.
- [ ] Documentación actualizada si cambió la estructura (`AGENTS.md`, `docs/project-graph.md`).
- [ ] PR abierto contra `main` describiendo qué, por qué y cómo se verificó.
- [ ] Lo implementado, marcado como pendiente de confirmación del usuario.

---

## 15. Documentos de referencia

| Documento | Cuándo leerlo |
| --- | --- |
| `AGENTS.md` (este) | Siempre, antes de tocar código. |
| `docs/project-graph.md` | Para ubicar un archivo o módulo y ver sus dependencias. |
| `docs/contexto-agente.md` | Estado actual, decisiones tomadas y pendientes de confirmación. |
| `Documento de Diseño y Arquitectura - RPG Táctico Web.md` | Requisitos del juego y hoja de ruta (`[x]` = hecho). No repetir tareas marcadas. |
| `README.md` | Instalación, variables de entorno y endpoints. |
| `sentencias-sql/` | Esquema, seeds, consultas y vistas de la BD. |

---

## 16. Cómo pedirme trabajo (para el usuario)

Para guiarme mejor, un mensaje con:

1. **Objetivo**: qué tiene que pasar al terminar.
2. **Alcance**: qué archivos o pantallas entran, y qué **no** se toca.
3. **Criterio de aceptación**: cómo se comprueba que está bien.
4. **Decisiones abiertas**: opciones con trade-offs, si las hay.

Por defecto trabajo con autonomía: decido lo mecánico y te reporto al final. **Te pregunto antes** de cambiar el esquema de la BD, cambiar el contrato de la API, agregar dependencias, tocar el diseño visual de una pantalla existente o hacer un refactor grande. Todo lo implementado queda **pendiente de confirmación** hasta que lo pruebes en el navegador.
