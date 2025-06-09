import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { isEnvVariableTrue } from './env'

let fpPromise = null

// Initialize the agent
const getFingerprint = async () => {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load()
  }
  const fp = await fpPromise
  const result = await fp.get()
  return result.visitorId
}

// Check if user has submitted
export const hasUserSubmitted = async () => {
  // In development mode with submission check disabled, always return false
  const disableCheck = isEnvVariableTrue(import.meta.env.VITE_DISABLE_SUBMISSION_CHECK)
  if (disableCheck) {
    return false
  }
  const fingerprint = await getFingerprint()
  const submissions = JSON.parse(window.localStorage.getItem('surveySubmissions') || '{}')
  return !!submissions[fingerprint]
}

// Mark survey as submitted
export const markAsSubmitted = async () => {
  const fingerprint = await getFingerprint()
  const submissions = JSON.parse(window.localStorage.getItem('surveySubmissions') || '{}')
  submissions[fingerprint] = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  }
  window.localStorage.setItem('surveySubmissions', JSON.stringify(submissions))
}
