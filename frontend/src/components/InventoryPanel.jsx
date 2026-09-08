import { useInventoryPanel } from './inventory/useInventoryPanel'
import { InventoryHeader } from './inventory/InventoryHeader'
import { InventoryFilters } from './inventory/InventoryFilters'
import { InventoryGrid } from './inventory/InventoryGrid'
import { InventoryDetail } from './inventory/InventoryDetail'
import { InventoryStats } from './inventory/InventoryStats'
import { TransferModal } from './inventory/TransferModal'
import { InventoryContextMenu } from './inventory/InventoryContextMenu'
import './InventoryPanel.css'

export function InventoryPanel({ onClose, personajes, activeCharacterIndex, onActiveCharacterChange }) {
  const {
    activeCharacter,
    characterList,
    classThemeKey,
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
    handleOpenContextMenu,
    handleCloseContextMenu,
    handleDoubleClickSlot,
    handleEquipToSlot,
    handleUnequipToSlot,
    handleDoubleClickEquipment,
    handleSelectSlot,
    handleOpenDetails,
    handleSelectEquipmentSlot,
    handleDragStart,
    handleDragEnd,
    handleDrop,
  } = useInventoryPanel({ onClose, personajes, activeCharacterIndex, onActiveCharacterChange })

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
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          onDropEquipped={handleUnequipToSlot}
          onContextMenu={handleOpenContextMenu}
        />
        <InventoryDetail
          detailItem={detailItem}
          showItemDetails={showItemDetails}
          equipment={equipment}
          selectedEquipmentSlot={selectedEquipmentSlot}
          equipmentBonuses={equipmentBonuses}
          onSelectEquipmentSlot={handleSelectEquipmentSlot}
          onDoubleClickEquipmentSlot={handleDoubleClickEquipment}
          onDropEquip={handleEquipToSlot}
        />
      </div>

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
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onRun={(action) => {
            action.run()
            handleCloseContextMenu()
          }}
          onHover={setContextMenuActionIndex}
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
    </aside>
  )
}