import React, { useEffect } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { isEnvVariableTrue } from '../utils/env'

const CaptchaVerification = ({ onVerify, prompt }) => {
  useEffect(() => {
    // If CAPTCHA is disabled, automatically verify
    if (isEnvVariableTrue(import.meta.env.VITE_DISABLE_CAPTCHA)) {
      onVerify(true)
    }
  }, [onVerify])

  // If CAPTCHA is disabled, don't render the component
  if (isEnvVariableTrue(import.meta.env.VITE_DISABLE_CAPTCHA)) {
    return null
  }

  const handleCaptchaVerify = (token) => {
    if (token) {
      onVerify(true)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center p-4'>
      <h2 className='text-xl mb-4'>{prompt}</h2>
      <div 
        role="region" 
        aria-label="CAPTCHA verification"
        className="captcha-container"
      >
        <ReCAPTCHA
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          onChange={handleCaptchaVerify}
        />
      </div>
    </div>
  )
}

export default CaptchaVerification
