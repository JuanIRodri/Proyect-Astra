import { forwardRef, useImperativeHandle } from 'react'
import { useInventoryPanel } from './inventory/useInventoryPanel'
import { InventoryHeader } from './inventory/InventoryHeader'
import { InventoryFilters } from './inventory/InventoryFilters'
import { InventoryGrid } from './inventory/InventoryGrid'
import { InventoryDetail } from './inventory/InventoryDetail'
import { InventoryStats } from './inventory/InventoryStats'
import { InventoryResources } from './inventory/InventoryResources'
import { TransferModal } from './inventory/TransferModal'
import { DetailsModal } from './inventory/DetailsModal'
import { InventoryContextMenu } from './inventory/InventoryContextMenu'
import { InventoryTooltip } from './inventory/InventoryTooltip'
import { SplitModal } from './inventory/SplitModal'
import './InventoryPanel.css'

export const InventoryPanel = forwardRef(function InventoryPanel({ onClose, personajes, activeCharacterIndex, onActiveCharacterChange, onTransferComplete }, ref) {
  const {
    activeCharacter,
    characterList,
    classThemeKey,
    resources,
    items,
    itemCount,
    equipment,
    detailItem,
    showItemDetails,
    equipmentBonuses,
    selectedEquipmentSlot,
    goldAmount,
    currentWeight,
    maxWeight,
    weightPercent,
    weightState,
    notice,
    inventoryLoading,
    equipKeyActive,
    transferPromptActive,
    handleTransferSelected,
    handleCancelTransfer,
    selectedItem,
    selectedSlotIndex,
    cursorSlotIndex,
    heldSlotIndex,
    draggedSlotIndex,
    slotRefs,
    filterCategory,
    handleCategoryChange,
    filterRarity,
    handleRarityChange,
    categoryOptions,
    rarityOptions,
    filteredOutIndexes,
    filteredCount,
    contextMenu,
    contextMenuActions,
    contextMenuActionIndex,
    setContextMenuActionIndex,
    contextMenuSubmenuIndex,
    setContextMenuSubmenuIndex,
    handleOpenContextMenu,
    handleCloseContextMenu,
    handleDoubleClickSlot,
    handleEquipToSlot,
    handleDoubleClickEquipment,
    handleCloseDetails,
    handleSelectSlot,
    handleGridWheel,
    handleOpenDetails,
    handleSelectEquipmentSlot,
    handleDragStartWithSplit,
    handleDragEnd,
    handleDropGrid,
    hoverItem,
    handleHoverItem,
    clearHoverItem,
    handleTransferFromSlot,
    splitPromptActive,
    handleConfirmSplit,
    handleCancelSplit,
  } = useInventoryPanel({ onClose, personajes, activeCharacterIndex, onActiveCharacterChange, onTransferComplete })

  useImperativeHandle(ref, () => ({
    transferFromSlot: handleTransferFromSlot,
  }), [handleTransferFromSlot])

  return (
    <aside className={`inventory-panel inventory-class-${classThemeKey}`} aria-label={`Inventario de ${activeCharacter?.nombre || 'personaje'}`}>
      <InventoryHeader activeCharacter={activeCharacter} onClose={onClose} />

      <InventoryFilters
        categoryOptions={categoryOptions}
        rarityOptions={rarityOptions}
        filterCategory={filterCategory}
        filterRarity={filterRarity}
        onCategoryChange={handleCategoryChange}
        onRarityChange={handleRarityChange}
        filteredCount={filteredCount}
        itemCount={itemCount}
      />

      <div className="inventory-content">
        <InventoryGrid
          items={items}
          selectedSlotIndex={selectedSlotIndex}
          cursorSlotIndex={cursorSlotIndex}
          heldSlotIndex={heldSlotIndex}
          draggedSlotIndex={draggedSlotIndex}
          filteredOutIndexes={filteredOutIndexes}
          slotRefs={slotRefs}
          onSelectSlot={handleSelectSlot}
          onOpenDetails={handleOpenDetails}
          onDoubleClickSlot={handleDoubleClickSlot}
          onDragStartWithSplit={handleDragStartWithSplit}
          onDragEnd={handleDragEnd}
          onDropGrid={handleDropGrid}
          onContextMenu={handleOpenContextMenu}
          onHoverItem={handleHoverItem}
          onLeave={clearHoverItem}
          onWheel={handleGridWheel}
        />
        <InventoryDetail
          equipment={equipment}
          selectedEquipmentSlot={selectedEquipmentSlot}
          equipmentBonuses={equipmentBonuses}
          onSelectEquipmentSlot={handleSelectEquipmentSlot}
          onDoubleClickEquipmentSlot={handleDoubleClickEquipment}
          onDropEquip={handleEquipToSlot}
          onHoverItem={handleHoverItem}
          onLeave={clearHoverItem}
        />
      </div>

      <InventoryResources resources={resources} />

      <InventoryStats
        goldAmount={goldAmount}
        currentWeight={currentWeight}
        maxWeight={maxWeight}
        weightPercent={weightPercent}
        weightState={weightState}
        notice={notice}
        inventoryLoading={inventoryLoading}
        equipKeyActive={equipKeyActive}
      />

      {contextMenu && contextMenuActions.length > 0 && (
        <InventoryContextMenu
          actions={contextMenuActions}
          actionIndex={contextMenuActionIndex}
          submenuIndex={contextMenuSubmenuIndex}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onRun={(action) => {
            action.run()
            handleCloseContextMenu()
          }}
          onHover={setContextMenuActionIndex}
          onHoverSubmenu={setContextMenuSubmenuIndex}
          onClose={handleCloseContextMenu}
        />
      )}

      {transferPromptActive && (
        <TransferModal
          item={selectedItem}
          characters={characterList}
          activeCharacterId={activeCharacter.idPersonaje}
          onTransfer={handleTransferSelected}
          onCancel={handleCancelTransfer}
        />
      )}

      {splitPromptActive && (
        <SplitModal
          item={selectedItem}
          onConfirm={handleConfirmSplit}
          onCancel={handleCancelSplit}
        />
      )}

      {showItemDetails && detailItem && (
        <DetailsModal item={detailItem} onClose={handleCloseDetails} />
      )}

      {hoverItem && <InventoryTooltip item={hoverItem} />}
    </aside>
  )
})