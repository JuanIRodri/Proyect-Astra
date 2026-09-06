import Phaser from 'phaser'
import {
  emitCharacterEditorRequest,
  emitExplorationStatus,
  emitInventoryToggle,
} from './gameEvents'

const TILE_SIZE = 48
const GRID_WIDTH = 16
const GRID_HEIGHT = 10

const PARTY_COLORS = [0xd9a441, 0x65c6d8, 0xd66d75]

export class ExplorationScene extends Phaser.Scene {
  constructor() {
    super('ExplorationScene')
    this.partyData = []
    this.leaderIndex = 0
    this.partyOrder = [0, 1, 2]
    this.partyPositions = [
      { x: 5, y: 4 },
      { x: 4, y: 4 },
      { x: 3, y: 4 },
    ]
  }

  init(data) {
    this.partyData = data?.personajes ?? []
  }

  create() {
    this.partyData = this.buildPartyData(this.partyData)
    this.drawBoard()
    this.createParty()
    this.configureCamera()
    this.createInput()
    this.emitStatus('Exploración activa')
  }

  buildPartyData(personajes = []) {
    return personajes.slice(0, 3).map((personaje, index) => ({
      id: personaje.idPersonaje,
      name: personaje.nombre || `Héroe #${personaje.idPersonaje}`,
      color: PARTY_COLORS[index],
    }))
  }

  drawBoard() {
    const board = this.add.graphics()
    board.fillStyle(0x172536, 1)
    board.fillRect(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE)
    board.lineStyle(1, 0x37506a, 0.75)

    for (let x = 0; x <= GRID_WIDTH; x += 1) {
      board.lineBetween(x * TILE_SIZE, 0, x * TILE_SIZE, GRID_HEIGHT * TILE_SIZE)
    }

    for (let y = 0; y <= GRID_HEIGHT; y += 1) {
      board.lineBetween(0, y * TILE_SIZE, GRID_WIDTH * TILE_SIZE, y * TILE_SIZE)
    }

    board.fillStyle(0x3d5264, 1)
    board.fillRect(7 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE)
    board.fillRect(7 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE)
    board.fillRect(7 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE)
  }

  createParty() {
    this.party = this.partyData.map((character, index) => {
      const position = this.partyPositions[index]
      const token = this.add.circle(
        position.x * TILE_SIZE + TILE_SIZE / 2,
        position.y * TILE_SIZE + TILE_SIZE / 2,
        15,
        character.color,
      )
      token.setStrokeStyle(3, index === this.leaderIndex ? 0xffffff : 0x18202b)
      token.setDepth(2)
      return token
    })

    this.leaderMarker = this.add.rectangle(0, 0, TILE_SIZE - 6, TILE_SIZE - 6)
    this.leaderMarker.setStrokeStyle(2, 0xffe28a)
    this.leaderMarker.setFillStyle(0xffffff, 0)
    this.leaderMarker.setDepth(1)
    this.updateLeaderMarker()
  }

  createInput() {
    this.input.keyboard.on('keydown', this.handleKeyDown, this)
  }

  configureCamera() {
    const camera = this.cameras.main
    camera.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE)
    camera.setZoom(1.1)
    camera.startFollow(this.party[this.leaderIndex], true, 0.12, 0.12)
  }

  handleKeyDown(event) {
    const key = event.key.toLowerCase()
    const code = event.code.toLowerCase()
    const leaders = { '1': 0, '2': 1, '3': 2, digit1: 0, digit2: 1, digit3: 2 }
    const directions = {
      arrowleft: { x: -1, y: 0 },
      a: { x: -1, y: 0 },
      keya: { x: -1, y: 0 },
      arrowright: { x: 1, y: 0 },
      d: { x: 1, y: 0 },
      keyd: { x: 1, y: 0 },
      arrowup: { x: 0, y: -1 },
      w: { x: 0, y: -1 },
      keyw: { x: 0, y: -1 },
      arrowdown: { x: 0, y: 1 },
      s: { x: 0, y: 1 },
      keys: { x: 0, y: 1 },
    }

    const leader = leaders[key] ?? leaders[code]
    if (leader !== undefined) {
      this.setLeader(leader)
      return
    }

    if (key === 'u' || code === 'keyu') {
      this.emitCharacterEditorRequest()
      return
    }

    if (key === 'i' || code === 'keyi') {
      emitInventoryToggle()
      return
    }

    const direction = directions[key] ?? directions[code]
    if (direction && !this.moving) this.moveLeader(direction.x, direction.y)
  }

  emitCharacterEditorRequest() {
    const character = this.partyData[this.leaderIndex]
    if (character?.id === undefined) {
      this.emitStatus('No hay un personaje disponible para editar')
      return
    }

    emitCharacterEditorRequest(character.id)
  }

  moveLeader(deltaX, deltaY) {
    const formationPositions = this.partyOrder.map((partyIndex) => this.partyPositions[partyIndex])
    const current = formationPositions[0]
    const next = { x: current.x + deltaX, y: current.y + deltaY }

    if (next.x < 0 || next.x >= GRID_WIDTH || next.y < 0 || next.y >= GRID_HEIGHT) return
    if (next.x === 7 && next.y >= 1 && next.y <= 3) {
      this.emitStatus('Movimiento bloqueado por una pared')
      return
    }

    const previousPositions = formationPositions.map((position) => ({ ...position }))
    this.partyPositions[this.partyOrder[0]] = next
    this.partyOrder.slice(1).forEach((partyIndex, followerOrder) => {
      this.partyPositions[partyIndex] = previousPositions[followerOrder]
    })
    this.moving = true
    this.partyOrder.forEach((partyIndex, formationIndex) => {
      const position = this.partyPositions[partyIndex]
      this.tweens.add({
        targets: this.party[partyIndex],
        x: position.x * TILE_SIZE + TILE_SIZE / 2,
        y: position.y * TILE_SIZE + TILE_SIZE / 2,
        duration: 140,
        onComplete: () => {
          if (formationIndex !== this.partyOrder.length - 1) return
          this.moving = false
          this.updateLeaderMarker()
          this.emitStatus(`${this.partyData[this.leaderIndex].name} avanzó y el grupo lo siguió`)
        },
      })
    })
  }

  setLeader(index) {
    this.leaderIndex = index
    this.partyOrder = [index, ...this.partyOrder.filter((partyIndex) => partyIndex !== index)]
    this.party.forEach((token, tokenIndex) => {
      token.setStrokeStyle(3, tokenIndex === index ? 0xffffff : 0x18202b)
    })
    this.updateLeaderMarker()
    this.cameras.main.startFollow(this.party[index], true, 0.12, 0.12)
    this.emitStatus(`${this.partyData[index].name} es el nuevo líder`)
  }

  updateLeaderMarker() {
    const position = this.partyPositions[this.leaderIndex]
    this.leaderMarker.setPosition(
      position.x * TILE_SIZE + TILE_SIZE / 2,
      position.y * TILE_SIZE + TILE_SIZE / 2,
    )
  }

  emitStatus(message) {
    emitExplorationStatus(message)
  }
}