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
import { drawBoard } from './board'
import { createMovementKeys, moveParty } from './movement'
import { createKeyHandler } from './input'
import { emitCharacterEditorRequest } from './gameEvents'

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
  }

  create() {
    this.partyData = buildPartyData(this.partyData)
    drawBoard(this)

    const { tokens, leaderMarker } = createParty(this, this.partyData)
    this.party = tokens
    this.leaderMarker = leaderMarker
    updateLeaderMarker(this.party, this.leaderMarker, this.leaderIndex)

    this.configureCamera()
    this.createInput()
  }

  createInput() {
    this.input.keyboard.on('keydown', createKeyHandler(this), this)
    this.movementKeys = createMovementKeys(this)
  }

  update(_, delta) {
    if (!this.movementKeys || !this.party?.length) return

    if (moveParty(this, delta)) {
      updateLeaderMarker(this.party, this.leaderMarker, this.leaderIndex)
    }
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
  }

  emitCharacterEditorRequest() {
    const character = this.partyData[this.leaderIndex]
    if (character?.id === undefined) {
      return
    }

    emitCharacterEditorRequest(character.id)
  }
}