import React, { useEffect } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

const CaptchaVerification = ({ onVerify }) => {
  useEffect(() => {
    // If CAPTCHA is disabled, automatically verify
    if (import.meta.env.VITE_DISABLE_CAPTCHA === 'true') {
      onVerify(true)
    }
  }, [onVerify])

  // If CAPTCHA is disabled, don't render the component
  if (import.meta.env.VITE_DISABLE_CAPTCHA === 'true') {
    return null
  }

  const handleCaptchaVerify = (token) => {
    if (token) {
      onVerify(true)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center p-4'>
      <h2 className='text-xl mb-4'>{window.location.hostname.includes('nl') ? 'Verifieer dat je een mens bent' : 'Please verify that you\'re human'}</h2>
      <ReCAPTCHA
        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
        onChange={handleCaptchaVerify}
      />
    </div>
  )
}

export default CaptchaVerification
