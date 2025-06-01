import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const CaptchaVerification = ({ onVerify }) => {
  const handleCaptchaVerify = (token) => {
    if (token) {
      onVerify(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-xl mb-4">Please verify that you're human</h2>      <ReCAPTCHA
        sitekey="6LdKH1IrAAAAAMptjLHyVbIopGwStWWnNGu7CmwC"
        onChange={handleCaptchaVerify}
      />
    </div>
  );
};

export default CaptchaVerification;
