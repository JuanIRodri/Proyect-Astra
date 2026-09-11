import { useCallback, useEffect, useRef, useState } from 'react'

export function useMenuNav({ count, onActivate, onBack, onDelete, disabled }) {
  const [focusedIndex, setFocusedIndex] = useState(0)
  const refs = useRef([])

  const registerRef = useCallback((index) => (node) => {
    refs.current[index] = node
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (disabled) return
      const key = event.key.toLowerCase()
      if (key === 'escape') {
        event.preventDefault()
        onBack()
        return
      }
      if (key === 'x' || key === 'backspace') {
        if (onDelete) {
          event.preventDefault()
          onDelete(focusedIndex)
        }
        return
      }
      if (count === 0) return
      if (key === 'w' || key === 'arrowup') {
        event.preventDefault()
        setFocusedIndex((index) => (index - 1 + count) % count)
        return
      }
      if (key === 's' || key === 'arrowdown') {
        event.preventDefault()
        setFocusedIndex((index) => (index + 1) % count)
        return
      }
      if (key === 'enter' || key === ' ') {
        event.preventDefault()
        onActivate(focusedIndex)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [count, focusedIndex, onActivate, onBack, onDelete, disabled])

  useEffect(() => {
    refs.current[focusedIndex]?.focus()
  }, [focusedIndex, count])

  return { focusedIndex, setFocusedIndex, registerRef }
}