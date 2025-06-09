import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@fingerprintjs/fingerprintjs', () => ({
  default: {
    load: () => Promise.resolve({
      get: () => Promise.resolve({ visitorId: 'abc' })
    })
  }
}))

beforeEach(() => {
  window.localStorage.clear()
})

async function loadTracker (env) {
  vi.resetModules()
  Object.assign(process.env, env)
  return await import('../utils/submissionTracker')
}

describe('hasUserSubmitted with disabled check', () => {
  it('returns false when env var is string', async () => {
    window.localStorage.setItem('surveySubmissions', JSON.stringify({
      abc: { timestamp: 'now', userAgent: 'UA' }
    }))
    const { hasUserSubmitted } = await loadTracker({ VITE_DISABLE_SUBMISSION_CHECK: 'true' })
    expect(await hasUserSubmitted()).toBe(false)
  })

  it('returns false when env var is boolean', async () => {
    window.localStorage.setItem('surveySubmissions', JSON.stringify({
      abc: { timestamp: 'now', userAgent: 'UA' }
    }))
    const { hasUserSubmitted } = await loadTracker({ VITE_DISABLE_SUBMISSION_CHECK: true })
    expect(await hasUserSubmitted()).toBe(false)
  })
})
