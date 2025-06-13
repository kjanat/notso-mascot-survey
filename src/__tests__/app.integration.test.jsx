import React, { act } from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createRoot } from 'react-dom/client'

// Mock dependencies
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }) => <div data-testid="dnd-context">{children}</div>,
  PointerSensor: vi.fn(),
  TouchSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => [])
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }) => <div data-testid="sortable-context">{children}</div>,
  rectSortingStrategy: {}
}))

vi.mock('react-google-recaptcha', () => ({
  default: ({ onChange }) => (
    <button onClick={() => onChange('test-token')} data-testid="recaptcha">
      Complete CAPTCHA
    </button>
  )
}))

vi.mock('../utils/submissionTracker.js', () => ({
  hasUserSubmitted: vi.fn(() => Promise.resolve(false)),
  markAsSubmitted: vi.fn(() => Promise.resolve())
}))

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_DISABLE_CAPTCHA: 'true',
    VITE_DISABLE_SUBMISSION_CHECK: 'false',
    VITE_SHEET_DB_API: 'https://test-api.com',
    VITE_RECAPTCHA_SITE_KEY: 'test-key'
  },
  writable: true
})

let container
let App

beforeEach(async () => {
  container = document.createElement('div')
  document.body.appendChild(container)
  window.localStorage.clear()
  vi.resetModules()
  ;({ default: App } = await import('../App'))
})

afterEach(() => {
  container.remove()
  container = null
})

describe('App Basic Integration Tests', () => {
  it('renders successfully', () => {
    act(() => {
      createRoot(container).render(<App />)
    })

    expect(container.textContent).toContain('Survey')
    expect(container.textContent).toContain('Start')
  })

  it('shows language flags', () => {
    act(() => {
      createRoot(container).render(<App />)
    })

    const flags = container.querySelectorAll('img[alt*="lands"], img[alt*="English"]')
    expect(flags.length).toBeGreaterThan(0)
  })

  it('has privacy consent checkbox', () => {
    act(() => {
      createRoot(container).render(<App />)
    })

    const checkbox = container.querySelector('input[type="checkbox"]')
    expect(checkbox).toBeTruthy()
  })

  it('start button becomes enabled after privacy consent', () => {
    act(() => {
      createRoot(container).render(<App />)
    })

    // Initially disabled
    expect(container.querySelector('button[disabled]')).toBeTruthy()

    // Check privacy consent
    const privacyCheckbox = container.querySelector('input[type="checkbox"]')
    act(() => {
      privacyCheckbox.click()
    })

    // Now enabled
    expect(container.querySelector('button:not([disabled])')).toBeTruthy()
  })
})
