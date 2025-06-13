import React, { act } from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createRoot } from 'react-dom/client'

let container
let infoSpy
let warnSpy

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  infoSpy.mockRestore()
  warnSpy.mockRestore()
  container.remove()
  container = null
})

async function renderWithEnv (env) {
  vi.resetModules()
  
  // Mock import.meta.env instead of process.env
  const originalEnv = import.meta.env
  Object.defineProperty(import.meta, 'env', {
    value: { ...originalEnv, ...env },
    writable: true
  })
  
  const { default: EnvironmentCheck } = await import(
    '../components/EnvironmentCheck'
  )
  
  act(() => {
    createRoot(container).render(<EnvironmentCheck />)
  })
  
  // Restore original env
  Object.defineProperty(import.meta, 'env', {
    value: originalEnv,
    writable: true
  })
}

describe('EnvironmentCheck', () => {
  it('logs info when submission check disabled', async () => {
    await renderWithEnv({
      VITE_SHEET_DB_API: 'api',
      VITE_RECAPTCHA_SITE_KEY: 'key',
      VITE_DISABLE_SUBMISSION_CHECK: 'true',
      VITE_DISABLE_CAPTCHA: 'false'
    })

    expect(infoSpy.mock.calls.join(' ')).toContain('submission check')
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('logs info when captcha disabled', async () => {
    await renderWithEnv({
      VITE_SHEET_DB_API: 'api',
      VITE_RECAPTCHA_SITE_KEY: 'key',
      VITE_DISABLE_SUBMISSION_CHECK: 'false',
      VITE_DISABLE_CAPTCHA: 'true'
    })

    expect(infoSpy.mock.calls.join(' ')).toContain('CAPTCHA')
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('logs combined info when both flags disabled', async () => {
    await renderWithEnv({
      VITE_SHEET_DB_API: 'api',
      VITE_RECAPTCHA_SITE_KEY: 'key',
      VITE_DISABLE_SUBMISSION_CHECK: 'true',
      VITE_DISABLE_CAPTCHA: 'true'
    })

    const output = infoSpy.mock.calls.join(' ')
    expect(output).toContain('submission check')
    expect(output).toContain('CAPTCHA')
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('logs warning when required environment variables are missing', async () => {
    // Use vi.stubEnv to properly mock Vite environment variables
    vi.stubEnv('VITE_SHEET_DB_API', undefined)
    vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', undefined)
    vi.stubEnv('VITE_DISABLE_SUBMISSION_CHECK', 'false')
    vi.stubEnv('VITE_DISABLE_CAPTCHA', 'false')

    vi.resetModules()
    const { default: EnvironmentCheck } = await import(
      '../components/EnvironmentCheck'
    )

    act(() => {
      createRoot(container).render(<EnvironmentCheck />)
    })

    // Check if warn was called
    expect(warnSpy).toHaveBeenCalled()
    const warnCalls = warnSpy.mock.calls.flat().join(' ')
    expect(warnCalls).toContain('missing variables')

    vi.unstubAllEnvs()
  })

  it('only logs once on multiple renders due to useRef guard', async () => {
    vi.resetModules()

    // Mock import.meta.env
    const originalEnv = import.meta.env
    Object.defineProperty(import.meta, 'env', {
      value: {
        ...originalEnv,
        VITE_SHEET_DB_API: 'api',
        VITE_RECAPTCHA_SITE_KEY: 'key',
        VITE_DISABLE_SUBMISSION_CHECK: 'true',
        VITE_DISABLE_CAPTCHA: 'false'
      },
      writable: true
    })

    const { default: EnvironmentCheck } = await import(
      '../components/EnvironmentCheck'
    )

    // Create root once and re-render same component instance
    const root = createRoot(container)

    act(() => {
      root.render(<EnvironmentCheck />)
    })

    const initialCallCount = infoSpy.mock.calls.length

    // Re-render the SAME component instance (which should trigger useEffect again but be blocked by hasLogged.current)
    act(() => {
      root.render(<EnvironmentCheck />)
    })

    // Should not have additional calls due to hasLogged.current guard
    expect(infoSpy.mock.calls.length).toBe(initialCallCount)

    // Restore original env
    Object.defineProperty(import.meta, 'env', {
      value: originalEnv,
      writable: true
    })
  })
})
