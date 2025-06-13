import React, { act } from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createRoot } from 'react-dom/client'
let EnvironmentCheck

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
  Object.assign(process.env, env)
  ;({ default: EnvironmentCheck } = await import(
    '../components/EnvironmentCheck'
  ))
  act(() => {
    createRoot(container).render(<EnvironmentCheck />)
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
})
