export function handleContextMenuKey(event, key, config) {
  const { state, actions } = config

  event.preventDefault()
  event.stopPropagation()

  const selectedAction = state.contextMenuActions[state.contextMenuActionIndex]
  const hasSubmenu = Boolean(selectedAction?.submenu?.length)
  const submenuOpen = hasSubmenu && state.contextMenuSubmenuIndex !== null

  if (key === 'escape') {
    if (submenuOpen) {
      actions.setContextMenuSubmenuIndex(null)
    } else {
      actions.handleCloseContextMenu()
    }
    return
  }

  if (submenuOpen) {
    if (key === 'arrowleft' || key === 'a') {
      actions.setContextMenuSubmenuIndex(null)
      return
    }
    if (key === 'arrowdown' || key === 's') {
      actions.setContextMenuSubmenuIndex((index) => (index + 1) % selectedAction.submenu.length)
      return
    }
    if (key === 'arrowup' || key === 'w') {
      actions.setContextMenuSubmenuIndex((index) => (index - 1 + selectedAction.submenu.length) % selectedAction.submenu.length)
      return
    }
    if (key === 'enter' || key === ' ') {
      selectedAction.submenu[state.contextMenuSubmenuIndex]?.run()
      actions.handleCloseContextMenu()
      return
    }
    return
  }

  const openSubmenu = () => {
    if (hasSubmenu) {
      actions.setContextMenuSubmenuIndex(0)
      return true
    }
    return false
  }

  if (key === 'enter' || key === ' ') {
    if (!openSubmenu()) {
      selectedAction?.run()
      actions.handleCloseContextMenu()
    }
    return
  }
  if (key === 'arrowright' || key === 'd') {
    if (!openSubmenu()) {
      actions.setContextMenuActionIndex((index) => (index + 1) % state.contextMenuActions.length)
    }
    return
  }
  if (key === 'arrowdown' || key === 's') {
    actions.setContextMenuActionIndex((index) => (index + 1) % state.contextMenuActions.length)
    return
  }
  if (key === 'arrowup' || key === 'w' || key === 'arrowleft' || key === 'a') {
    actions.setContextMenuActionIndex((index) => (index - 1 + state.contextMenuActions.length) % state.contextMenuActions.length)
  }
}
