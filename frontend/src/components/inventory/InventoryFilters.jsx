const CATEGORY_LABELS = {
  todos: 'Todas',
}

const RARITY_LABELS = {
  todos: 'Todas',
}

export function InventoryFilters({
  categoryOptions,
  rarityOptions,
  filterCategory,
  filterRarity,
  onCategoryChange,
  onRarityChange,
  filteredCount,
  itemCount,
}) {
  const hasActiveFilters = filterCategory !== 'todos' || filterRarity !== 'todos'

  return (
    <div className="inventory-filters">
      <div className="inventory-filters-group">
        <label className="inventory-filters-label" htmlFor="inventory-filter-category">Categoría</label>
        <select
          id="inventory-filter-category"
          className="inventory-filter-control"
          value={filterCategory}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          {categoryOptions.map((option) => (
            <option key={option} value={option}>{CATEGORY_LABELS[option] || option}</option>
          ))}
        </select>
      </div>

      <div className="inventory-filters-group">
        <label className="inventory-filters-label" htmlFor="inventory-filter-rarity">Rareza</label>
        <select
          id="inventory-filter-rarity"
          className="inventory-filter-control"
          value={filterRarity}
          onChange={(event) => onRarityChange(event.target.value)}
        >
          {rarityOptions.map((option) => (
            <option key={option} value={option}>{RARITY_LABELS[option] || option}</option>
          ))}
        </select>
      </div>

      <span className="inventory-filters-count">{filteredCount} de {itemCount} objetos</span>

      {hasActiveFilters && (
        <button
          className="inventory-filters-clear"
          type="button"
          onClick={() => {
            onCategoryChange('todos')
            onRarityChange('todos')
          }}
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}