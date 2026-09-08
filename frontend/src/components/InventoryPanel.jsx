import { useInventoryPanel } from './inventory/useInventoryPanel'
import { InventoryHeader } from './inventory/InventoryHeader'
import { InventoryFilters } from './inventory/InventoryFilters'
import { InventoryGrid } from './inventory/InventoryGrid'
import { InventoryDetail } from './inventory/InventoryDetail'
import { InventoryStats } from './inventory/InventoryStats'
import './InventoryPanel.css'

export function InventoryPanel({ onClose, personajes, activeCharacterIndex, onActiveCharacterChange }) {
  const {
    activeCharacter,
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
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
        />
        <InventoryDetail
          detailItem={detailItem}
          showItemDetails={showItemDetails}
          equipment={equipment}
          selectedEquipmentSlot={selectedEquipmentSlot}
          equipmentBonuses={equipmentBonuses}
          onSelectEquipmentSlot={handleSelectEquipmentSlot}
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
    </aside>
  )
}