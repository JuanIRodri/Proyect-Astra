import { useCallback, useEffect, useRef, useState } from 'react'
import {
  applyFullscreen,
  loadVideoSettings,
  saveVideoSettings,
} from '../../game/videoSettings'
import { emitVideoSettingsChange } from '../../game/gameEvents'

export function useOpcionesVideo() {
  const [video, setVideo] = useState(loadVideoSettings)
  const wantFullscreenRef = useRef(video.pantallaCompleta)

  const toggle = useCallback((clave) => {
    setVideo((current) => {
      const next = { ...current, [clave]: !current[clave] }
      saveVideoSettings(next)
      if (clave === 'pantallaCompleta') {
        wantFullscreenRef.current = next.pantallaCompleta
        applyFullscreen(next.pantallaCompleta)
      } else {
        emitVideoSettingsChange()
      }
      return next
    })
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = Boolean(document.fullscreenElement)

      if (isFull) {
        wantFullscreenRef.current = true
        setVideo((current) => {
          if (current.pantallaCompleta === true) return current
          const next = { ...current, pantallaCompleta: true }
          saveVideoSettings(next)
          return next
        })
        return
      }

      if (wantFullscreenRef.current) {
        document.documentElement.requestFullscreen?.().catch(() => undefined)
        return
      }

      setVideo((current) => {
        if (current.pantallaCompleta === false) return current
        const next = { ...current, pantallaCompleta: false }
        saveVideoSettings(next)
        return next
      })
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return { video, toggle }
}