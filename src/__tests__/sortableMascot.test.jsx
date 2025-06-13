import React, { act } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRoot } from 'react-dom/client'
import SortableMascot from '../components/SortableMascot'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@dnd-kit/sortable', () => {
  const mockUseSortable = vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false
  }))

  return {
    useSortable: mockUseSortable
  }
})

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
        <SortableMascot id='friend_type-man.png' src='invalid.png' rank={1} />
      )
    })

    const img = container.querySelector('img')
    expect(img.getAttribute('src')).toBe('invalid.png')

    act(() => {
      img.dispatchEvent(new Event('error'))
    })

    expect(img.getAttribute('src')).toBe('mascots/missing.webp')
  })

  it('renders with fallback image on error', () => {
    render(
      <SortableMascot id='friend_type-man.webp' src='invalid.webp' rank={1} />
    )
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toBe('invalid.webp')
    fireEvent.error(img)
    expect(img.getAttribute('src')).toBe('mascots/missing.webp')
  })

  it('applies dragging styles when isDragging is true', async () => {
    // Import the mocked module
    const sortableModule = await import('@dnd-kit/sortable')
    const mockUseSortable = vi.mocked(sortableModule.useSortable)

    // Configure mock for this test
    mockUseSortable.mockReturnValueOnce({
      attributes: {},
      listeners: {},
      setNodeRef: () => {},
      transform: { x: 10, y: 5, scaleX: 1, scaleY: 1 },
      transition: 'transform 200ms',
      isDragging: true
    })

    act(() => {
      createRoot(container).render(
        <SortableMascot id='test-mascot' src='test.png' rank={1} />
      )
    })

    const dragElement = container.querySelector('div')
    expect(dragElement.className).toContain('shadow-lg')
    expect(dragElement.className).not.toContain('shadow-sm')
  })
})
