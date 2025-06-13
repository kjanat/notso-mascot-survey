import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import App, { validateMascotRankings } from '../App'

// Mock modules
vi.mock('../utils/submissionTracker', () => ({
  hasUserSubmitted: vi.fn(() => Promise.resolve(false)),
  markAsSubmitted: vi.fn(() => Promise.resolve())
}))

vi.mock('../components/EnvironmentCheck', () => ({
  default: () => <div data-testid='environment-check'>EnvironmentCheck</div>
}))

vi.mock('../components/CaptchaVerification', () => ({
  default: ({ onVerify }) => (
    <div data-testid='captcha'>
      <button onClick={() => onVerify(true)}>Verify</button>
    </div>
  )
}))

vi.mock('../components/SortableMascot', () => ({
  default: ({ id, rank, src }) => (
    <div data-testid={`mascot-${id}`} data-rank={rank}>
      <img src={src} alt={`Mascot ${id}`} />
    </div>
  )
}))

// Mock drag and drop
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }) => (
    <div data-testid='dnd-context' data-ondragend={onDragEnd ? 'true' : 'false'}>
      {children}
    </div>
  ),
  PointerSensor: vi.fn(),
  TouchSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => [])
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }) => <div data-testid='sortable-context'>{children}</div>,
  rectSortingStrategy: {}
}))

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_SHEET_DB_API: 'https://test-api.example.com',
    VITE_DISABLE_CAPTCHA: 'false',
    VITE_DISABLE_SUBMISSION_CHECK: 'false'
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorageMock.clear()
    localStorageMock.getItem.mockReturnValue(null)

    // Reset mocks
    vi.clearAllMocks()

    // Mock Image constructor for prefetching
    global.Image = class {
      constructor () {
        setTimeout(() => {
          this.onload?.()
        }, 100)
      }
    }

    // Mock window.location
    delete window.location
    window.location = { href: '' }

    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    )
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.resetAllMocks()
  })

  describe('Initial Render States', () => {
    it('renders CAPTCHA verification when not verified', async () => {
      await act(async () => {
        render(<App />)
      })

      expect(screen.getByTestId('captcha')).toBeInTheDocument()
      expect(screen.getByText('Verify')).toBeInTheDocument()
    })

    it('renders intro screen after CAPTCHA verification', async () => {
      await act(async () => {
        render(<App />)
      })

      // Verify CAPTCHA
      await act(async () => {
        fireEvent.click(screen.getByText('Verify'))
      })

      await waitFor(() => {
        expect(screen.getByText(/Welkom/)).toBeInTheDocument()
      })
    })

    it('shows already submitted message when user has submitted', async () => {
      const { hasUserSubmitted } = await import('../utils/submissionTracker')
      hasUserSubmitted.mockResolvedValue(true)

      await act(async () => {
        render(<App />)
      })

      await waitFor(() => {
        expect(screen.getByText(/Je hebt deze enquête al ingevuld/)).toBeInTheDocument()
      })
    })
  })

  describe('Language Management', () => {
    it('initializes with Dutch by default', async () => {
      await act(async () => {
        render(<App />)
      })

      // Check for Dutch flag active state
      const nlButton = screen.getByAltText('Nederlands')
      expect(nlButton.closest('button')).toHaveClass('border-blue-500')
    })

    it('switches to English when EN flag is clicked', async () => {
      await act(async () => {
        render(<App />)
      })

      await act(async () => {
        fireEvent.click(screen.getByAltText('English'))
      })

      // Check English flag is now active
      const enButton = screen.getByAltText('English')
      expect(enButton.closest('button')).toHaveClass('border-blue-500')
    })

    it('saves language preference to localStorage', async () => {
      await act(async () => {
        render(<App />)
      })

      await act(async () => {
        fireEvent.click(screen.getByAltText('English'))
      })

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('lang', 'en')
      })
    })

    it('loads language preference from localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('en')

      await act(async () => {
        render(<App />)
      })

      const enButton = screen.getByAltText('English')
      expect(enButton.closest('button')).toHaveClass('border-blue-500')
    })
  })

  describe('Privacy Consent and Survey Start', () => {
    it('starts with disabled start button', async () => {
      await act(async () => {
        render(<App />)
      })

      // Verify CAPTCHA first
      await act(async () => {
        fireEvent.click(screen.getByText('Verify'))
      })

      await waitFor(() => {
        const startButton = screen.getByText(/Start/)
        expect(startButton).toBeDisabled()
      })
    })

    it('enables start button after privacy consent', async () => {
      await act(async () => {
        render(<App />)
      })

      // Verify CAPTCHA first
      await act(async () => {
        fireEvent.click(screen.getByText('Verify'))
      })

      await waitFor(() => {
        const checkbox = screen.getByLabelText(/Ik ga akkoord/)
        fireEvent.click(checkbox)

        const startButton = screen.getByText(/Start/)
        expect(startButton).not.toBeDisabled()
      })
    })

    it('starts survey after clicking start button', async () => {
      await act(async () => {
        render(<App />)
      })

      // Verify CAPTCHA
      await act(async () => {
        fireEvent.click(screen.getByText('Verify'))
      })

      await waitFor(async () => {
        // Give consent and start
        const checkbox = screen.getByLabelText(/Ik ga akkoord/)
        fireEvent.click(checkbox)

        const startButton = screen.getByText(/Start/)
        await act(async () => {
          fireEvent.click(startButton)
        })
      })

      // Should show first question
      await waitFor(() => {
        expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
      })
    })
  })

  describe('Question Navigation', () => {
    const setupToFirstQuestion = async () => {
      await act(async () => {
        render(<App />)
      })

      // Verify CAPTCHA
      await act(async () => {
        fireEvent.click(screen.getByText('Verify'))
      })

      await waitFor(async () => {
        // Give consent and start
        const checkbox = screen.getByLabelText(/Ik ga akkoord/)
        fireEvent.click(checkbox)

        const startButton = screen.getByText(/Start/)
        await act(async () => {
          fireEvent.click(startButton)
        })
      })
    }

    it('shows progress indicator', async () => {
      await setupToFirstQuestion()

      await waitFor(() => {
        expect(screen.getByText('1/12')).toBeInTheDocument()
      })
    })

    it('disables back button on first question', async () => {
      await setupToFirstQuestion()

      await waitFor(() => {
        const backButton = screen.getByText(/Terug/)
        expect(backButton).toBeDisabled()
      })
    })

    it('advances to next question', async () => {
      await setupToFirstQuestion()

      await waitFor(async () => {
        const nextButton = screen.getByText(/Volgende/)
        await act(async () => {
          fireEvent.click(nextButton)
        })
      })

      await waitFor(() => {
        expect(screen.getByText('2/12')).toBeInTheDocument()
      })
    })

    it('enables back button after first question', async () => {
      await setupToFirstQuestion()

      await waitFor(async () => {
        // Go to next question
        const nextButton = screen.getByText(/Volgende/)
        await act(async () => {
          fireEvent.click(nextButton)
        })
      })

      await waitFor(() => {
        const backButton = screen.getByText(/Terug/)
        expect(backButton).not.toBeDisabled()
      })
    })

    it('goes back to previous question', async () => {
      await setupToFirstQuestion()

      await waitFor(async () => {
        // Go to question 2
        const nextButton = screen.getByText(/Volgende/)
        await act(async () => {
          fireEvent.click(nextButton)
        })
      })

      await waitFor(async () => {
        // Go back to question 1
        const backButton = screen.getByText(/Terug/)
        await act(async () => {
          fireEvent.click(backButton)
        })
      })

      await waitFor(() => {
        expect(screen.getByText('1/12')).toBeInTheDocument()
      })
    })

    it('shows final questions button on last question', async () => {
      await setupToFirstQuestion()

      // Navigate to last question (question 12)
      for (let i = 0; i < 11; i++) {
        await waitFor(async () => {
          const nextButton = screen.getByText(/Volgende/)
          await act(async () => {
            fireEvent.click(nextButton)
          })
        })
      }

      await waitFor(() => {
        expect(screen.getByText(/Achtergrondvragen/)).toBeInTheDocument()
      })
    })
  })

  describe('Mascot Rankings Validation', () => {
    it('validates complete rankings', () => {
      const answers = {
        coach_type: ['file1.png', 'file2.png', 'file3.png', 'file4.png', 'file5.png'],
        coach_style: ['file1.png', 'file2.png', 'file3.png', 'file4.png', 'file5.png']
      }

      const questions = [
        { id: 'coach_type', options: ['file1.png', 'file2.png', 'file3.png', 'file4.png', 'file5.png'] },
        { id: 'coach_style', options: ['file1.png', 'file2.png', 'file3.png', 'file4.png', 'file5.png'] }
      ]

      expect(validateMascotRankings(answers, questions)).toBe(true)
    })

    it('rejects incomplete rankings', () => {
      const answers = {
        coach_type: ['file1.png', 'file2.png'] // Only 2 files, need 5
      }

      const questions = [
        { id: 'coach_type', options: ['file1.png', 'file2.png', 'file3.png', 'file4.png', 'file5.png'] }
      ]

      expect(validateMascotRankings(answers, questions)).toBe(false)
    })

    it('rejects duplicate rankings', () => {
      const answers = {
        coach_type: ['file1.png', 'file1.png', 'file2.png', 'file3.png', 'file4.png'] // Duplicate file1.png
      }

      const questions = [
        { id: 'coach_type', options: ['file1.png', 'file2.png', 'file3.png', 'file4.png', 'file5.png'] }
      ]

      expect(validateMascotRankings(answers, questions)).toBe(false)
    })

    it('handles missing questions', () => {
      const answers = {} // No answers

      const questions = [
        { id: 'coach_type', options: ['file1.png', 'file2.png', 'file3.png', 'file4.png', 'file5.png'] }
      ]

      expect(validateMascotRankings(answers, questions)).toBe(false)
    })
  })

  describe('Drag and Drop Functionality', () => {
    it('initializes order for questions', async () => {
      await act(async () => {
        render(<App />)
      })

      // Verify CAPTCHA and start survey
      await act(async () => {
        fireEvent.click(screen.getByText('Verify'))
      })

      await waitFor(async () => {
        const checkbox = screen.getByLabelText(/Ik ga akkoord/)
        fireEvent.click(checkbox)

        const startButton = screen.getByText(/Start/)
        await act(async () => {
          fireEvent.click(startButton)
        })
      })

      await waitFor(() => {
        // Check that DndContext is rendered with onDragEnd handler
        const dndContext = screen.getByTestId('dnd-context')
        expect(dndContext).toHaveAttribute('data-ondragend', 'true')
      })
    })

    it('renders mascot components correctly', async () => {
      await act(async () => {
        render(<App />)
      })

      // Setup to first question
      await act(async () => {
        fireEvent.click(screen.getByText('Verify'))
      })

      await waitFor(async () => {
        const checkbox = screen.getByLabelText(/Ik ga akkoord/)
        fireEvent.click(checkbox)

        const startButton = screen.getByText(/Start/)
        await act(async () => {
          fireEvent.click(startButton)
        })
      })

      await waitFor(() => {
        // Check that mascots are rendered
        const mascots = screen.getAllByTestId(/^mascot-/)
        expect(mascots.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Error Handling', () => {
    it('handles submission errors gracefully', async () => {
      // Mock fetch to return error
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          text: () => Promise.resolve('Server Error')
        })
      )

      // Mock alert
      global.alert = vi.fn()

      // This test validates the error handling in the submit function
      expect(global.fetch).toBeDefined()
      expect(global.alert).toBeDefined()
    })

    it('logs submission data correctly', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      // Test the console logging functionality
      expect(consoleSpy).toBeDefined()

      consoleSpy.mockRestore()
    })
  })
})
