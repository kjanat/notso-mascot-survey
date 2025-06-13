import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('@fingerprintjs/fingerprintjs', () => ({
  default: {
    load: () =>
      Promise.resolve({
        get: () => Promise.resolve({ visitorId: 'abc' })
      })
  }
}))

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

async function loadTracker (env) {
  vi.resetModules()
  // Properly stub each environment variable
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value)
  }
  return await import('../utils/submissionTracker')
}

describe('hasUserSubmitted with disabled check', () => {
  it('returns false when env var is string', async () => {
    window.localStorage.setItem(
      'surveySubmissions',
      JSON.stringify({
        abc: { timestamp: 'now', userAgent: 'UA' }
      })
    )
    const { hasUserSubmitted } = await loadTracker({
      VITE_DISABLE_SUBMISSION_CHECK: 'true'
    })
    expect(await hasUserSubmitted()).toBe(false)
  })

  it('returns false when env var is boolean', async () => {
    window.localStorage.setItem(
      'surveySubmissions',
      JSON.stringify({
        abc: { timestamp: 'now', userAgent: 'UA' }
      })
    )
    const { hasUserSubmitted } = await loadTracker({
      VITE_DISABLE_SUBMISSION_CHECK: true
    })
    expect(await hasUserSubmitted()).toBe(false)
  })
})

describe('hasUserSubmitted with enabled check', () => {
  it('returns false when no submissions exist', async () => {
    const { hasUserSubmitted } = await loadTracker({
      VITE_DISABLE_SUBMISSION_CHECK: 'false'
    })
    expect(await hasUserSubmitted()).toBe(false)
  })

  it('returns false when fingerprint not in submissions', async () => {
    window.localStorage.setItem(
      'surveySubmissions',
      JSON.stringify({
        'other-fingerprint': { timestamp: 'now', userAgent: 'UA' }
      })
    )
    const { hasUserSubmitted } = await loadTracker({
      VITE_DISABLE_SUBMISSION_CHECK: 'false'
    })
    expect(await hasUserSubmitted()).toBe(false)
  })

  it('returns true when fingerprint exists in submissions', async () => {
    // Set up localStorage with the fingerprint that the mock will return
    window.localStorage.setItem(
      'surveySubmissions',
      JSON.stringify({
        abc: { timestamp: 'now', userAgent: 'UA' }
      })
    )
    
    const { hasUserSubmitted } = await loadTracker({
      VITE_DISABLE_SUBMISSION_CHECK: 'false'
    })
    
    const result = await hasUserSubmitted()
    expect(result).toBe(true)
  })
})

describe('markAsSubmitted', () => {
  it('creates new submission entry when none exists', async () => {
    const { markAsSubmitted } = await loadTracker({
      VITE_DISABLE_SUBMISSION_CHECK: 'false'
    })
    
    await markAsSubmitted()
    
    const submissions = JSON.parse(window.localStorage.getItem('surveySubmissions'))
    expect(submissions).toHaveProperty('abc')
    expect(submissions.abc).toHaveProperty('timestamp')
    expect(submissions.abc).toHaveProperty('userAgent')
  })

  it('adds to existing submissions', async () => {
    window.localStorage.setItem(
      'surveySubmissions',
      JSON.stringify({
        'existing-fingerprint': { timestamp: 'old', userAgent: 'Old UA' }
      })
    )
    
    const { markAsSubmitted } = await loadTracker({
      VITE_DISABLE_SUBMISSION_CHECK: 'false'
    })
    
    await markAsSubmitted()
    
    const submissions = JSON.parse(window.localStorage.getItem('surveySubmissions'))
    expect(submissions).toHaveProperty('existing-fingerprint')
    expect(submissions).toHaveProperty('abc')
  })

  it('overwrites existing submission for same fingerprint', async () => {
    window.localStorage.setItem(
      'surveySubmissions',
      JSON.stringify({
        abc: { timestamp: 'old', userAgent: 'Old UA' }
      })
    )
    
    const { markAsSubmitted } = await loadTracker({
      VITE_DISABLE_SUBMISSION_CHECK: 'false'
    })
    
    await markAsSubmitted()
    
    const submissions = JSON.parse(window.localStorage.getItem('surveySubmissions'))
    expect(submissions.abc.timestamp).not.toBe('old')
    expect(submissions.abc.userAgent).toBeDefined()
  })
})
