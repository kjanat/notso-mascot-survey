import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
let EnvironmentCheck

let container

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  container.remove()
  container = null
})

async function renderWithEnv (env) {
  vi.resetModules()
  Object.assign(process.env, env)
  ;({ default: EnvironmentCheck } = await import('../components/EnvironmentCheck'))
  act(() => {
    createRoot(container).render(<EnvironmentCheck />)
  })
}

describe('EnvironmentCheck', () => {
  it('shows info banner when submission check disabled', async () => {
    await renderWithEnv({
      VITE_SHEET_DB_API: 'api',
      VITE_RECAPTCHA_SITE_KEY: 'key',
      VITE_DISABLE_SUBMISSION_CHECK: 'true',
      VITE_DISABLE_CAPTCHA: 'false'
    })

    const text = container.textContent
    expect(text).toContain('Submission check disabled')
    expect(text).toContain('VITE_DISABLE_SUBMISSION_CHECK: true')
    expect(text).toContain('VITE_DISABLE_CAPTCHA: false')
  })

  it('shows info banner when captcha disabled', async () => {
    await renderWithEnv({
      VITE_SHEET_DB_API: 'api',
      VITE_RECAPTCHA_SITE_KEY: 'key',
      VITE_DISABLE_SUBMISSION_CHECK: 'false',
      VITE_DISABLE_CAPTCHA: 'true'
    })

    const text = container.textContent
    expect(text).toContain('CAPTCHA disabled')
    expect(text).toContain('VITE_DISABLE_SUBMISSION_CHECK: false')
    expect(text).toContain('VITE_DISABLE_CAPTCHA: true')
  })

  it('shows combined info when both flags disabled', async () => {
    await renderWithEnv({
      VITE_SHEET_DB_API: 'api',
      VITE_RECAPTCHA_SITE_KEY: 'key',
      VITE_DISABLE_SUBMISSION_CHECK: 'true',
      VITE_DISABLE_CAPTCHA: 'true'
    })

    const text = container.textContent
    expect(text).toContain('Submission check disabled')
    expect(text).toContain('CAPTCHA disabled')
    expect(text).toContain('VITE_DISABLE_SUBMISSION_CHECK: true')
    expect(text).toContain('VITE_DISABLE_CAPTCHA: true')
  })
})
