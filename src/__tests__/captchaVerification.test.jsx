import React, { act } from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createRoot } from 'react-dom/client'

// Mock the react-google-recaptcha component
vi.mock('react-google-recaptcha', () => ({
  default: ({ onChange, sitekey }) => (
    <div data-testid="recaptcha-mock" data-sitekey={sitekey}>
      <button onClick={() => onChange('test-token')}>Complete CAPTCHA</button>
    </div>
  )
}))

let container
let CaptchaVerification

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  container.remove()
  container = null
})

async function renderWithEnv(env) {
  vi.resetModules()
  Object.assign(process.env, env)
  ;({ default: CaptchaVerification } = await import('../components/CaptchaVerification'))
}

describe('CaptchaVerification', () => {
  it('auto-verifies when CAPTCHA is disabled', async () => {
    const onVerify = vi.fn()
    
    await renderWithEnv({
      VITE_DISABLE_CAPTCHA: 'true',
      VITE_RECAPTCHA_SITE_KEY: 'test-key'
    })

    act(() => {
      createRoot(container).render(
        <CaptchaVerification onVerify={onVerify} prompt="Test prompt" />
      )
    })

    // Should auto-verify when disabled
    expect(onVerify).toHaveBeenCalledWith(true)
  })

  it('renders nothing when CAPTCHA is disabled', async () => {
    const onVerify = vi.fn()
    
    await renderWithEnv({
      VITE_DISABLE_CAPTCHA: 'true',
      VITE_RECAPTCHA_SITE_KEY: 'test-key'
    })

    act(() => {
      createRoot(container).render(
        <CaptchaVerification onVerify={onVerify} prompt="Test prompt" />
      )
    })

    expect(container.innerHTML).toBe('')
  })

  it('renders CAPTCHA component when enabled', async () => {
    const onVerify = vi.fn()
    
    await renderWithEnv({
      VITE_DISABLE_CAPTCHA: 'false',
      VITE_RECAPTCHA_SITE_KEY: 'test-site-key'
    })

    act(() => {
      createRoot(container).render(
        <CaptchaVerification onVerify={onVerify} prompt="Verify you are human" />
      )
    })

    expect(container.textContent).toContain('Verify you are human')
    expect(container.querySelector('[data-testid="recaptcha-mock"]')).toBeTruthy()
    expect(container.querySelector('[data-sitekey="test-site-key"]')).toBeTruthy()
  })

  it('calls onVerify when CAPTCHA is completed', async () => {
    const onVerify = vi.fn()
    
    await renderWithEnv({
      VITE_DISABLE_CAPTCHA: 'false',
      VITE_RECAPTCHA_SITE_KEY: 'test-site-key'
    })

    act(() => {
      createRoot(container).render(
        <CaptchaVerification onVerify={onVerify} prompt="Verify you are human" />
      )
    })

    const captchaButton = container.querySelector('button')
    
    act(() => {
      captchaButton.click()
    })

    expect(onVerify).toHaveBeenCalledWith(true)
  })

  it('has proper accessibility attributes', async () => {
    const onVerify = vi.fn()
    
    await renderWithEnv({
      VITE_DISABLE_CAPTCHA: 'false',
      VITE_RECAPTCHA_SITE_KEY: 'test-site-key'
    })

    act(() => {
      createRoot(container).render(
        <CaptchaVerification onVerify={onVerify} prompt="Verify you are human" />
      )
    })

    const captchaContainer = container.querySelector('[role="region"]')
    expect(captchaContainer).toBeTruthy()
    expect(captchaContainer.getAttribute('aria-label')).toBe('CAPTCHA verification')
  })
})
