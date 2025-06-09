import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import SortableMascot from '../components/SortableMascot'

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false
  })
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: { toString: () => '' }
  }
}))

let container

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  container.remove()
  container = null
})

describe('SortableMascot', () => {
  it('uses fallback image when asset fails to load', () => {
    act(() => {
      createRoot(container).render(
        <SortableMascot id="friend_type-man.png" src="invalid.png" rank={1} />
      )
    })

    const img = container.querySelector('img')
    expect(img.getAttribute('src')).toBe('invalid.png')

    act(() => {
      img.dispatchEvent(new Event('error'))
    })

    expect(img.getAttribute('src')).toBe('mascots/missing.png')
  })
})
