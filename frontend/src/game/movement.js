import Phaser from 'phaser'
import { canOccupy } from './board'
import {
  TRAIL_LENGTH,
  FOLLOWER_SPACING,
  FOLLOWER_SMOOTHING,
} from './constants'
import { loadBindings, toPhaserKeyName } from './bindings'

export function createMovementKeys(scene) {
  const bindings = loadBindings()
  const names = {
    up: bindings.moverArriba
      ? toPhaserKeyName(bindings.moverArriba)
      : Phaser.Input.Keyboard.KeyCodes.UP,
    down: bindings.moverAbajo
      ? toPhaserKeyName(bindings.moverAbajo)
      : Phaser.Input.Keyboard.KeyCodes.DOWN,
    left: bindings.moverIzquierda
      ? toPhaserKeyName(bindings.moverIzquierda)
      : Phaser.Input.Keyboard.KeyCodes.LEFT,
    right: bindings.moverDerecha
      ? toPhaserKeyName(bindings.moverDerecha)
      : Phaser.Input.Keyboard.KeyCodes.RIGHT,
    arrowUp: Phaser.Input.Keyboard.KeyCodes.UP,
    arrowDown: Phaser.Input.Keyboard.KeyCodes.DOWN,
    arrowLeft: Phaser.Input.Keyboard.KeyCodes.LEFT,
    arrowRight: Phaser.Input.Keyboard.KeyCodes.RIGHT,
  }
  return scene.input.keyboard.addKeys(names)
}

export function getMovementVector(keys) {
  const horizontal = Number(keys.right.isDown || keys.arrowRight.isDown)
    - Number(keys.left.isDown || keys.arrowLeft.isDown)
  const vertical = Number(keys.down.isDown || keys.arrowDown.isDown)
    - Number(keys.up.isDown || keys.arrowUp.isDown)

  return {
    horizontal,
    vertical,
    magnitude: Math.hypot(horizontal, vertical),
  }
}

export function moveParty(scene, delta) {
  const { horizontal, vertical, magnitude } = getMovementVector(scene.movementKeys)
  if (horizontal === 0 && vertical === 0) return false

  const distance = scene.movementSpeed * (delta / 1000)
  const leader = scene.party[scene.leaderIndex]
  const nextPosition = {
    x: leader.x + ((horizontal / magnitude) * distance),
    y: leader.y + ((vertical / magnitude) * distance),
  }
  if (!canOccupy(nextPosition.x, nextPosition.y)) return false

  const previousLeaderPosition = { x: leader.x, y: leader.y }
  leader.setPosition(nextPosition.x, nextPosition.y)

  scene.partyTrail.unshift(previousLeaderPosition)
  scene.partyTrail = scene.partyTrail.slice(0, TRAIL_LENGTH)

  scene.partyOrder.slice(1).forEach((partyIndex, followerOrder) => {
    const trailPosition = scene.partyTrail[Math.min(scene.partyTrail.length - 1, (followerOrder + 1) * FOLLOWER_SPACING)]
    if (!trailPosition) return
    scene.party[partyIndex].x += (trailPosition.x - scene.party[partyIndex].x) * FOLLOWER_SMOOTHING
    scene.party[partyIndex].y += (trailPosition.y - scene.party[partyIndex].y) * FOLLOWER_SMOOTHING
  })

  return true
}