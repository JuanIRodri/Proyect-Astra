import { useState } from 'react'
import { MenuOpciones } from './MenuOpciones'
import { MenuOpcionesAudio } from './MenuOpcionesAudio'
import { MenuOpcionesVideo } from './MenuOpcionesVideo'
import { MenuOpcionesTeclas } from './MenuOpcionesTeclas'

export function OpcionesStack({ onExit }) {
  const [vista, setVista] = useState('hub')

  if (vista === 'audio') {
    return <MenuOpcionesAudio onBack={() => setVista('hub')} />
  }

  if (vista === 'video') {
    return <MenuOpcionesVideo onBack={() => setVista('hub')} />
  }

  if (vista === 'teclas') {
    return <MenuOpcionesTeclas onBack={() => setVista('hub')} />
  }

  return (
    <MenuOpciones
      onBack={onExit}
      onAudio={() => setVista('audio')}
      onVideo={() => setVista('video')}
      onTeclas={() => setVista('teclas')}
    />
  )
}