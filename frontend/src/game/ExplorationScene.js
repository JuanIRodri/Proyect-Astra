import Phaser from 'phaser'
import { MOVEMENT_SPEED, CAMERA_ZOOM, CAMERA_SMOOTHNESS, WORLD_DEPTH_BASE } from './constants'
import { isoUnproject, isoWorldBounds } from './isometric'
import {
  buildPartyData,
  createParty,
  updateLeaderMarker,
  updatePartyLeaderStyling,
} from './party'
import { createGridOverlay } from './board'
import { createDecor, DECOR_DATA } from './decor'
import { createMovementKeys, moveParty } from './movement'
import { createKeyHandler } from './input'
import { emitCharacterEditorRequest, emitLeaderChange, emitPartyPositionUpdate, GAME_EVENTS } from './gameEvents'
import { isInputLocked } from './inputLock'
import { loadVideoSettings } from './videoSettings'
import { setPartyPositionsStore } from './partyPositionsStore'
import { setBlockedTiles } from './collision'

const MAP_EMIT_DISTANCE = 6

export class ExplorationScene extends Phaser.Scene {
  constructor() {
    super('ExplorationScene')
    this.partyData = []
    this.leaderIndex = 0
    this.partyOrder = [0, 1, 2]
    this.movementSpeed = MOVEMENT_SPEED
    this.partyTrail = []
  }

  init(data) {
    this.partyData = data?.personajes ?? []
    this.initialPositions = data?.positions ?? null
    this.leaderIndex = Number.isInteger(data?.leaderIndex) ? data.leaderIndex : 0
    this.partyOrder = [0, 1, 2].filter((index) => index !== this.leaderIndex)
    this.partyOrder.unshift(this.leaderIndex)
    this.lastEmitX = null
    this.lastEmitY = null
  }

  preload() {
    this.load.tilemapTiledJSON('mapa-prueba', 'maps/mapa-prueba.tmj')
    this.load.image('placeholder-tiles', 'tiles/placeholder-v5.png')
  }

  create() {
    this.partyData = buildPartyData(this.partyData)
    this.createTilemap()

    const { tokens, leaderMarker } = createParty(this, this.partyData, this.initialPositions)
    this.party = tokens
    this.leaderMarker = leaderMarker
    updatePartyLeaderStyling(this.party, this.leaderIndex)
    updateLeaderMarker(this.party, this.leaderMarker, this.leaderIndex)
    this.syncPositionsStore()

    this.applyVideoSettings()
    this.subscribeVideoSettings()

    this.configureCamera()
    this.createInput()
    this.emitPartyPositionIfNeeded(true)
  }

  createTilemap() {
    const map = this.make.tilemap({ key: 'mapa-prueba' })
    const tileset = map.addTilesetImage('placeholder', 'placeholder-tiles')
    this.sueloLayer = map.createLayer('suelo', tileset)
    this.caminosLayer = map.createLayer('caminos', tileset, 0, 0)
    this.obstaculosLayer = map.createLayer('obstaculos', tileset, 0, 0)
    this.decor = createDecor(this, DECOR_DATA)
    this.buildCollisions()
  }

  buildCollisions() {
    if (!this.obstaculosLayer) return
    const tiles = []
    const data = this.obstaculosLayer.layer?.data ?? []
    for (const row of data) {
      for (const tile of row) {
        if (tile?.index > 0) tiles.push({ x: tile.x, y: tile.y, kind: 'roca' })
      }
    }
    DECOR_DATA.forEach((entry) => {
      tiles.push({ x: entry.x, y: entry.y, kind: entry.kind })
    })
    setBlockedTiles(tiles)
  }

  applyVideoSettings() {
    this.videoSettings = loadVideoSettings()
    const { overlayCuadricula, marcadorLider, reducirEfectos } = this.videoSettings

    if (overlayCuadricula && !this.gridOverlay) {
      this.gridOverlay = createGridOverlay(this)
    } else if (!overlayCuadricula && this.gridOverlay) {
      this.gridOverlay.destroy()
      this.gridOverlay = null
    }

    if (!this.leaderMarker) return

    const wantsPulse = marcadorLider && !reducirEfectos
    this.leaderMarker.setVisible(marcadorLider)

    if (wantsPulse && !this.markerTween) {
      this.markerTween = this.tweens.add({
        targets: this.leaderMarker,
        alpha: { from: 0.55, to: 1 },
        duration: 700,
        yoyo: true,
        repeat: -1,
      })
    }

    if (!wantsPulse && this.markerTween) {
      this.markerTween.stop()
      this.markerTween.destroy()
      this.markerTween = null
      this.leaderMarker.setAlpha(1)
    }
  }

  subscribeVideoSettings() {
    const handler = () => this.applyVideoSettings()
    window.addEventListener(GAME_EVENTS.videoSettingsChange, handler)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener(GAME_EVENTS.videoSettingsChange, handler)
    })
  }

  createInput() {
    this.input.keyboard.on('keydown', createKeyHandler(this), this)
    this.movementKeys = createMovementKeys(this)
  }

  update(_, delta) {
    if (!this.movementKeys || !this.party?.length) return
    this.syncPartyDepths()
    if (isInputLocked()) return

    this.syncPositionsStore()
    if (moveParty(this, delta)) {
      updateLeaderMarker(this.party, this.leaderMarker, this.leaderIndex)
      this.emitPartyPositionIfNeeded(false)
    }
  }

  syncPartyDepths() {
    this.party.forEach((token) => {
      token.setDepth(WORLD_DEPTH_BASE + token.y)
    })
  }

  syncPositionsStore() {
    setPartyPositionsStore(
      this.party.map((token) => {
        const tile = isoUnproject(token.x, token.y)
        return { x: tile.u, y: tile.v }
      }),
      this.leaderIndex,
    )
  }

  emitPartyPositionIfNeeded(force) {
    const leader = this.party[this.leaderIndex]
    if (!leader) return
    if (!force) {
      const deltaX = leader.x - (this.lastEmitX ?? leader.x)
      const deltaY = leader.y - (this.lastEmitY ?? leader.y)
      if (Math.hypot(deltaX, deltaY) < MAP_EMIT_DISTANCE) return
    }
    this.lastEmitX = leader.x
    this.lastEmitY = leader.y
    emitPartyPositionUpdate(
      this.party.map((token) => {
        const tile = isoUnproject(token.x, token.y)
        return { x: tile.u, y: tile.v }
      }),
      this.leaderIndex,
    )
  }

  configureCamera() {
    const camera = this.cameras.main
    const { minX, minY, maxX, maxY } = isoWorldBounds()
    camera.setBounds(minX, minY, maxX - minX, maxY - minY)
    camera.roundPixels = true
    camera.setZoom(CAMERA_ZOOM)
    camera.startFollow(this.party[this.leaderIndex], true, CAMERA_SMOOTHNESS, CAMERA_SMOOTHNESS)
  }

  setLeader(index) {
    this.leaderIndex = index
    this.partyOrder = [index, ...this.partyOrder.filter((partyIndex) => partyIndex !== index)]
    updatePartyLeaderStyling(this.party, index)
    updateLeaderMarker(this.party, this.leaderMarker, index)
    this.cameras.main.startFollow(this.party[index], true, CAMERA_SMOOTHNESS, CAMERA_SMOOTHNESS)
    this.syncPositionsStore()
    emitLeaderChange(index)
    this.emitPartyPositionIfNeeded(true)
  }

  emitCharacterEditorRequest() {
    const character = this.partyData[this.leaderIndex]
    if (character?.id === undefined) {
      return
    }

    emitCharacterEditorRequest(character.id)
  }
}