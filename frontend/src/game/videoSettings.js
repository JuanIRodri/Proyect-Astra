const STORAGE_KEY = 'astra-video'

export const DEFAULT_VIDEO = {
  pantallaCompleta: false,
  marcadorLider: true,
  overlayCuadricula: false,
  reducirEfectos: false,
}

export function loadVideoSettings() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_VIDEO, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_VIDEO }
  }
  return { ...DEFAULT_VIDEO }
}

export function saveVideoSettings(settings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    return undefined
  }
}

export function applyFullscreen(enabled) {
  if (enabled) {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => undefined)
    }
    return
  }
  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => undefined)
  }
}