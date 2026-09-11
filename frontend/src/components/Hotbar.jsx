import { forwardRef, useImperativeHandle } from 'react'
import { useHotbar } from '../hooks/useHotbar'
import { useItemTooltip } from '../hooks/useItemTooltip'
import { HOTBAR_SLOT_COUNT, HOTBAR_KEYS } from '../game/hotbarConfig'
import { ItemTooltip } from './ItemTooltip'
import './Hotbar.css'

export const Hotbar = forwardRef(function Hotbar({
  personajeId,
  items,
  onUseRequest,
  useShortcuts = false,
  variant = 'overlay',
}, ref) {
  const {
    slots,
    pickerIndex,
    openPicker,
    closePicker,
    consumables,
    feedback,
    assignSlot,
    clearSlot,
    triggerSlot,
  } = useHotbar({ personajeId, items, onUseRequest, useShortcuts })

  const { itemTooltip, showTooltip, moveTooltip, hideTooltip } = useItemTooltip()

  useImperativeHandle(ref, () => ({
    assignSlot,
    openPicker,
    clearSlot,
    triggerSlot,
  }), [assignSlot, openPicker, clearSlot, triggerSlot])

  const handleSlotDrop = (slotIndex) => (event) => {
    event.preventDefault()
    if (!items) return
    const data = event.dataTransfer.getData('text/plain')
    if (!/^\d+$/.test(data)) return
    const ranura = Number(data)
    if (items[ranura]) {
      assignSlot(slotIndex, items[ranura])
    }
  }

  return (
    <div className={`hotbar hotbar--${variant}`}>
      {feedback && (
        <div className="hotbar-feedback" key={feedback.token}>
          {feedback.text}
        </div>
      )}

      <div className="hotbar-slots" role="group" aria-label="Barra de acceso rápido">
        {Array.from({ length: HOTBAR_SLOT_COUNT }, (_, slotIndex) => {
          const slot = slots[slotIndex]
          return (
            <button
              className={`hotbar-slot ${slot ? 'is-filled' : 'is-empty'}`}
              key={slotIndex}
              draggable={false}
              onClick={() => (slot ? triggerSlot(slotIndex) : openPicker(slotIndex))}
              onMouseEnter={(event) => slot && showTooltip(event, slot)}
              onMouseMove={moveTooltip}
              onMouseLeave={hideTooltip}
              onDragOver={(event) => items && event.preventDefault()}
              onDrop={items ? handleSlotDrop(slotIndex) : undefined}
              aria-label={slot ? `Usar ${slot.name}` : `Ranura ${slotIndex + 1} vacía`}
              title={slot ? `${slot.name}${slot.quantity > 0 ? ` (${slot.quantity})` : ''} — clic para usar` : `Arrastra un consumible o asigna con ${HOTBAR_KEYS[slotIndex]} (inv.) para llenar`}
            >
              {slot ? (
                <>
                  {slot.icon ? <span className="hotbar-icon" aria-hidden="true">{slot.icon}</span> : null}
                  <span className="hotbar-slot-name">{slot.name}</span>
                  {slot.quantity > 0 && <span className="hotbar-quantity">{slot.quantity}</span>}
                  <span
                    className="hotbar-clear"
                    role="button"
                    aria-label={`Quitar ${slot.name} de la barra`}
                    title="Quitar de la barra"
                    onClick={(event) => {
                      event.stopPropagation()
                      clearSlot(slotIndex)
                    }}
                  >
                    ✕
                  </span>
                </>
              ) : (
                <span className="hotbar-key" aria-hidden="true">{HOTBAR_KEYS[slotIndex]}</span>
              )}
            </button>
          )
        })}
      </div>

      <ItemTooltip item={itemTooltip?.item} x={itemTooltip?.x} y={itemTooltip?.y} />

      {pickerIndex !== null && (
        <div className="hotbar-picker-backdrop" onClick={closePicker}>
          <div className="hotbar-picker" onClick={(event) => event.stopPropagation()}>
            <p className="hotbar-picker-kicker">Barra de acceso rápido · ranura {pickerIndex + 1}</p>
            {consumables.length === 0 ? (
              <p className="hotbar-picker-empty">No hay objetos consumibles en la mochila.</p>
            ) : (
              <ul className="hotbar-picker-list">
                {consumables.map((item) => (
                  <li key={item.itemKey}>
                    <button
                      type="button"
                      className="hotbar-picker-row"
                      onMouseEnter={(event) => showTooltip(event, item)}
                      onMouseMove={moveTooltip}
                      onMouseLeave={hideTooltip}
                      onClick={() => assignSlot(pickerIndex, item)}
                    >
                      <span className="hotbar-picker-icon" aria-hidden="true">{item.icon}</span>
                      <span className="hotbar-picker-name">{item.name}</span>
                      <span className="hotbar-picker-qty">×{item.quantity}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {slots[pickerIndex] && (
              <button
                type="button"
                className="hotbar-picker-clear"
                onClick={() => clearSlot(pickerIndex)}
              >
                Liberar ranura
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
})