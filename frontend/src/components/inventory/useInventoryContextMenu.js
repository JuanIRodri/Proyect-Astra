import { useCallback, useMemo, useState } from 'react'
import { buildContextMenuActions, getContextMenuPosition } from './inventorySelectors'

export function useInventoryContextMenu({
  items,
  characterList,
  activeCharacterId,
  focusSlot,
  setTransferPromptActive,
  onUse,
  onEquip,
  onTransfer,
  onSplit,
  onShowDetails,
  onDrop,
}) {
  const [contextMenu, setContextMenu] = useState(null)
  const [contextMenuActionIndex, setContextMenuActionIndex] = useState(0)
  const [contextMenuSubmenuIndex, setContextMenuSubmenuIndex] = useState(null)

  const openContextMenu = useCallback((slotIndex, clientX, clientY, limitX, limitY) => {
    focusSlot(slotIndex)
    setTransferPromptActive(false)
    setContextMenuActionIndex(0)
    setContextMenuSubmenuIndex(null)
    setContextMenu({
      slotIndex,
      ...getContextMenuPosition(clientX, clientY, limitX, limitY),
    })
  }, [focusSlot, setTransferPromptActive])

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
    setContextMenuActionIndex(0)
    setContextMenuSubmenuIndex(null)
  }, [])

  const contextMenuActions = useMemo(() => {
    if (!contextMenu) return []
    return buildContextMenuActions({
      item: items[contextMenu.slotIndex],
      slotIndex: contextMenu.slotIndex,
      characterList,
      activeCharacterId,
      onUse,
      onEquip,
      onTransfer,
      onSplit,
      onShowDetails,
      onDrop,
    })
  }, [
    activeCharacterId,
    characterList,
    contextMenu,
    items,
    onDrop,
    onEquip,
    onShowDetails,
    onSplit,
    onTransfer,
    onUse,
  ])

  return {
    contextMenu,
    contextMenuActions,
    contextMenuActionIndex,
    contextMenuSubmenuIndex,
    setContextMenuActionIndex,
    setContextMenuSubmenuIndex,
    openContextMenu,
    closeContextMenu,
  }
}
