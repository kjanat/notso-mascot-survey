import { useEffect, useRef } from 'react'
import { isEnvVariableTrue } from '../utils/env'

const EnvironmentCheck = () => {
  const hasLogged = useRef(false)
  const requiredVars = [
    { key: 'VITE_SHEET_DB_API', name: 'SheetDB API Endpoint' },
    { key: 'VITE_RECAPTCHA_SITE_KEY', name: 'reCAPTCHA Site Key' }
  ]

  useEffect(() => {
    if (hasLogged.current) return
    hasLogged.current = true

    const missingVars = requiredVars
      .filter(({ key }) => !import.meta.env[key])
      .map((v) => v.name)

    const disableSubmission =
      import.meta.env.VITE_DISABLE_SUBMISSION_CHECK === 'true'
    const disableCaptcha = import.meta.env.VITE_DISABLE_CAPTCHA === 'true'

    const disabledFeatures = []
    if (disableSubmission) disabledFeatures.push('submission check')
    if (disableCaptcha) disabledFeatures.push('CAPTCHA')

    if (missingVars.length > 0) {
      console.warn(
        `EnvironmentCheck: missing variables -> ${missingVars.join(', ')}`
      )
    }

    if (disabledFeatures.length > 0) {
      console.info(
        `EnvironmentCheck: disabled features -> ${disabledFeatures.join(', ')}`
      )
    }

    if (missingVars.length > 0 || disabledFeatures.length > 0) {
      console.info(
        `EnvironmentCheck flags: VITE_DISABLE_SUBMISSION_CHECK=${String(import.meta.env.VITE_DISABLE_SUBMISSION_CHECK)}, VITE_DISABLE_CAPTCHA=${String(import.meta.env.VITE_DISABLE_CAPTCHA)}`
      )
    }
  }, [])

  // Nothing is rendered; diagnostics are logged to the console
  return null
}

export default EnvironmentCheck
