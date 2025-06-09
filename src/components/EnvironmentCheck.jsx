import React from 'react'

const EnvironmentCheck = () => {
  const missingVars = []
  const requiredVars = [
    { key: 'VITE_SHEET_DB_API', name: 'SheetDB API Endpoint' },
    { key: 'VITE_RECAPTCHA_SITE_KEY', name: 'reCAPTCHA Site Key' }
  ]

  const disableSubmission = import.meta.env.VITE_DISABLE_SUBMISSION_CHECK === 'true'
  const disableCaptcha = import.meta.env.VITE_DISABLE_CAPTCHA === 'true'
  const isDutch = window.location.hostname.includes('nl')

  // Check each required variable
  requiredVars.forEach(({ key, name }) => {
    if (!import.meta.env[key]) {
      missingVars.push(name)
    }
  })

  if (missingVars.length === 0 && !disableSubmission && !disableCaptcha) {
    return null
  }

  return (
    <div className='space-y-2 mb-4'>
      {missingVars.length > 0 && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative' role='alert'>
          <strong className='font-bold'>⚠️ {isDutch ? 'Waarschuwing' : 'Warning'}: </strong>
          <span className='block sm:inline'>
            {isDutch ? (
              <>
                De volgende omgevingsvariabelen ontbreken. De enquête zal niet werken zonder deze:
                <ul className='list-disc list-inside mt-2'>
                  {missingVars.map(name => <li key={name}>{name}</li>)}
                </ul>
              </>
            ) : (
              <>
                The following environment variables are missing. The survey will not work without them:
                <ul className='list-disc list-inside mt-2'>
                  {missingVars.map(name => <li key={name}>{name}</li>)}
                </ul>
              </>
            )}
          </span>
        </div>
      )}

      {(disableSubmission || disableCaptcha) && (
        <div className='bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative' role='alert'>
          <strong className='font-bold'>ℹ️ {isDutch ? 'Informatie' : 'Info'}: </strong>
          <span className='block sm:inline'>
            {disableSubmission && (
              <>{isDutch ? 'Inzendingcontrole uitgeschakeld' : 'Submission check disabled'}{disableCaptcha ? '; ' : ''}</>
            )}
            {disableCaptcha && (
              <>{isDutch ? 'CAPTCHA uitgeschakeld' : 'CAPTCHA disabled'}</>
            )}
          </span>
        </div>
      )}

      <div className='bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded relative' role='alert'>
        <span className='block sm:inline text-sm'>
          VITE_DISABLE_SUBMISSION_CHECK: {String(import.meta.env.VITE_DISABLE_SUBMISSION_CHECK)}<br />
          VITE_DISABLE_CAPTCHA: {String(import.meta.env.VITE_DISABLE_CAPTCHA)}
        </span>
      </div>
    </div>
  )
}

export default EnvironmentCheck
