import FingerprintJS from '@fingerprintjs/fingerprintjs'

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
  if (import.meta.env.VITE_DISABLE_SUBMISSION_CHECK === 'true') {
    return false
  }
  const fingerprint = await getFingerprint()
  const submissions = JSON.parse(localStorage.getItem('surveySubmissions') || '{}')
  return !!submissions[fingerprint]
}

// Mark survey as submitted
export const markAsSubmitted = async () => {
  const fingerprint = await getFingerprint()
  const submissions = JSON.parse(localStorage.getItem('surveySubmissions') || '{}')
  submissions[fingerprint] = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  }
  localStorage.setItem('surveySubmissions', JSON.stringify(submissions))
}
