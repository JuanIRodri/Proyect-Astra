const STORAGE_KEY = 'astra-teclas'

export const BINDING_LABELS = {
  moverArriba: 'Mover arriba',
  moverAbajo: 'Mover abajo',
  moverIzquierda: 'Mover izquierda',
  moverDerecha: 'Mover derecha',
  lider1: 'Líder 1',
  lider2: 'Líder 2',
  lider3: 'Líder 3',
  editarStats: 'Editar estadísticas',
  inventario: 'Inventario',
  interactuar: 'Interactuar',
}

export const BINDABLE_ACTIONS = Object.keys(BINDING_LABELS)

export const DEFAULT_BINDINGS = {
  moverArriba: 'W',
  moverAbajo: 'S',
  moverIzquierda: 'A',
  moverDerecha: 'D',
  lider1: '1',
  lider2: '2',
  lider3: '3',
  editarStats: 'U',
  inventario: 'I',
  interactuar: 'E',
}

export function loadBindings() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_BINDINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_BINDINGS
  }
  return DEFAULT_BINDINGS
}

export function saveBindings(bindings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings))
  } catch {
    return undefined
  }
}

export function resetBindings() {
  saveBindings({ ...DEFAULT_BINDINGS })
  return { ...DEFAULT_BINDINGS }
}

export function eventKeyToBinding(event) {
  const key = event.key
  if (key && key.length === 1 && /^[a-zA-Z0-9]$/.test(key)) return key.toUpperCase()
  const named = {
    ' ': 'SPACE',
    Escape: 'ESC',
    Enter: 'ENTER',
    Tab: 'TAB',
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
    Backspace: 'BACKSPACE',
  }
  return named[key] || null
}

const DIGIT_NAMES = {
  '0': 'ZERO',
  '1': 'ONE',
  '2': 'TWO',
  '3': 'THREE',
  '4': 'FOUR',
  '5': 'FIVE',
  '6': 'SIX',
  '7': 'SEVEN',
  '8': 'EIGHT',
  '9': 'NINE',
}

export function toPhaserKeyName(binding) {
  return DIGIT_NAMES[binding] || binding
}

const DISPLAY_NAMES = {
  SPACE: 'Espacio',
  ESC: 'Esc',
  ENTER: 'Enter',
  TAB: 'Tab',
  UP: '↑',
  DOWN: '↓',
  LEFT: '←',
  RIGHT: '→',
  BACKSPACE: 'Retroceso',
}

export function prettifyBinding(key) {
  if (!key) return '—'
  return DISPLAY_NAMES[key] || key
}