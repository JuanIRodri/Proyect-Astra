import Phaser from 'phaser'
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  TILE_SIZE,
  MOVEMENT_SPEED,
  CAMERA_ZOOM,
  CAMERA_SMOOTHNESS,
} from './constants'
import {
  buildPartyData,
  createParty,
  updateLeaderMarker,
  updatePartyLeaderStyling,
} from './party'
import { drawBoard, createGridOverlay } from './board'
import { createMovementKeys, moveParty } from './movement'
import { createKeyHandler } from './input'
import { emitCharacterEditorRequest, emitLeaderChange, emitPartyPositionUpdate, GAME_EVENTS } from './gameEvents'
import { isInputLocked } from './inputLock'
import { loadVideoSettings } from './videoSettings'
import { setPartyPositionsStore } from './partyPositionsStore'

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

  create() {
    this.partyData = buildPartyData(this.partyData)
    drawBoard(this)

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
    if (isInputLocked()) return

    this.syncPositionsStore()
    if (moveParty(this, delta)) {
      updateLeaderMarker(this.party, this.leaderMarker, this.leaderIndex)
      this.emitPartyPositionIfNeeded(false)
    }
  }

  syncPositionsStore() {
    setPartyPositionsStore(
      this.party.map((token) => ({
        x: (token.x - TILE_SIZE / 2) / TILE_SIZE,
        y: (token.y - TILE_SIZE / 2) / TILE_SIZE,
      })),
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
      this.party.map((token) => ({ x: token.x, y: token.y })),
      this.leaderIndex,
    )
  }

  configureCamera() {
    const camera = this.cameras.main
    camera.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE)
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