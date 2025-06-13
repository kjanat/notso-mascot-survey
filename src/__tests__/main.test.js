import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock react-dom/client before any imports
const mockRender = vi.fn()
const mockCreateRoot = vi.fn(() => ({
  render: mockRender
}))

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: mockCreateRoot
  },
  createRoot: mockCreateRoot
}))

// Mock App component
vi.mock('../App', () => ({
  default: vi.fn(() => 'Mocked App Component')
}))

// Mock CSS import
vi.mock('../styles.css', () => ({}))

describe('main.jsx entry point', () => {
  const originalGetElementById = document.getElementById

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules() // Reset module cache between tests
    // Reset document.getElementById to original
    document.getElementById = originalGetElementById
  })

  it('creates root and renders App component successfully', async () => {
    // Create a mock root element
    const mockRootElement = document.createElement('div')
    mockRootElement.id = 'root'

    // Mock getElementById to return our mock element
    document.getElementById = vi.fn(() => mockRootElement)

    // Import the main module - this triggers the rendering
    await import('../main.jsx')

    // Verify getElementById was called with 'root'
    expect(document.getElementById).toHaveBeenCalledWith('root')

    // Verify createRoot was called with the root element
    expect(mockCreateRoot).toHaveBeenCalledWith(mockRootElement)

    // Verify render was called
    expect(mockRender).toHaveBeenCalledTimes(1)
  })

  it('handles missing root element by calling createRoot with null', async () => {
    // Mock getElementById to return null (no root element found)
    document.getElementById = vi.fn(() => null)

    // Import should not throw even with null root
    await import('../main.jsx')

    // Verify getElementById was called
    expect(document.getElementById).toHaveBeenCalledWith('root')

    // Verify createRoot was still called (with null)
    expect(mockCreateRoot).toHaveBeenCalledWith(null)
  })
})
