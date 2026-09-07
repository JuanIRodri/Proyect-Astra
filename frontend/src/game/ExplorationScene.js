import Phaser from 'phaser'
import {
  emitCharacterEditorRequest,
  emitInventoryToggle,
} from './gameEvents'

const TILE_SIZE = 48
const GRID_WIDTH = 36
const GRID_HEIGHT = 22

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
    this.movementSpeed = 180
    this.partyTrail = []
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
    board.fillRect(16 * TILE_SIZE, 7 * TILE_SIZE, TILE_SIZE, TILE_SIZE)
    board.fillRect(16 * TILE_SIZE, 8 * TILE_SIZE, TILE_SIZE, TILE_SIZE)
    board.fillRect(16 * TILE_SIZE, 9 * TILE_SIZE, TILE_SIZE, TILE_SIZE)
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
    this.movementKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      arrowUp: Phaser.Input.Keyboard.KeyCodes.UP,
      arrowDown: Phaser.Input.Keyboard.KeyCodes.DOWN,
      arrowLeft: Phaser.Input.Keyboard.KeyCodes.LEFT,
      arrowRight: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    })
  }

  update(_, delta) {
    if (!this.movementKeys || !this.party?.length) return

    const horizontal = Number(this.movementKeys.right.isDown || this.movementKeys.arrowRight.isDown)
      - Number(this.movementKeys.left.isDown || this.movementKeys.arrowLeft.isDown)
    const vertical = Number(this.movementKeys.down.isDown || this.movementKeys.arrowDown.isDown)
      - Number(this.movementKeys.up.isDown || this.movementKeys.arrowUp.isDown)
    if (horizontal === 0 && vertical === 0) return

    const magnitude = Math.hypot(horizontal, vertical)
    const distance = this.movementSpeed * (delta / 1000)
    const leader = this.party[this.leaderIndex]
    const nextPosition = {
      x: leader.x + ((horizontal / magnitude) * distance),
      y: leader.y + ((vertical / magnitude) * distance),
    }
    if (!this.canOccupy(nextPosition.x, nextPosition.y)) return

    const previousLeaderPosition = { x: leader.x, y: leader.y }
    leader.setPosition(nextPosition.x, nextPosition.y)
    this.partyTrail.unshift(previousLeaderPosition)
    this.partyTrail = this.partyTrail.slice(0, 42)
    this.partyOrder.slice(1).forEach((partyIndex, followerOrder) => {
      const trailPosition = this.partyTrail[Math.min(this.partyTrail.length - 1, (followerOrder + 1) * 14)]
      if (!trailPosition) return
      this.party[partyIndex].x += (trailPosition.x - this.party[partyIndex].x) * 0.18
      this.party[partyIndex].y += (trailPosition.y - this.party[partyIndex].y) * 0.18
    })
    this.updateLeaderMarker()
  }

  canOccupy(x, y) {
    const radius = 15
    const worldWidth = GRID_WIDTH * TILE_SIZE
    const worldHeight = GRID_HEIGHT * TILE_SIZE
    if (x < radius || x > worldWidth - radius || y < radius || y > worldHeight - radius) return false

    const wallLeft = 16 * TILE_SIZE
    const wallRight = wallLeft + TILE_SIZE
    const wallTop = 7 * TILE_SIZE
    const wallBottom = 10 * TILE_SIZE
    return !(x + radius > wallLeft && x - radius < wallRight && y + radius > wallTop && y - radius < wallBottom)
  }

  configureCamera() {
    const camera = this.cameras.main
    camera.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE)
    camera.setZoom(0.72)
    camera.startFollow(this.party[this.leaderIndex], true, 0.12, 0.12)
  }

  handleKeyDown(event) {
    const key = event.key.toLowerCase()
    const code = event.code.toLowerCase()
    const leaders = { '1': 0, '2': 1, '3': 2, digit1: 0, digit2: 1, digit3: 2 }
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

  }

  emitCharacterEditorRequest() {
    const character = this.partyData[this.leaderIndex]
    if (character?.id === undefined) {
      return
    }

    emitCharacterEditorRequest(character.id)
  }

  setLeader(index) {
    this.leaderIndex = index
    this.partyOrder = [index, ...this.partyOrder.filter((partyIndex) => partyIndex !== index)]
    this.party.forEach((token, tokenIndex) => {
      token.setStrokeStyle(3, tokenIndex === index ? 0xffffff : 0x18202b)
    })
    this.updateLeaderMarker()
    this.cameras.main.startFollow(this.party[index], true, 0.12, 0.12)
  }

  updateLeaderMarker() {
    const leader = this.party[this.leaderIndex]
    this.leaderMarker.setPosition(leader.x, leader.y)
  }

}