// Test setup file for vitest
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Configure React Testing Library to work with vitest
import { configure } from '@testing-library/react'

configure({
  testIdAttribute: 'data-testid'
})

// Mock window.matchMedia which is not available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})
