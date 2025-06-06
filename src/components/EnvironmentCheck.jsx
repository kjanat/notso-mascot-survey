import React from 'react';

const EnvironmentCheck = () => {
  const missingVars = [];
  const requiredVars = [
    { key: 'VITE_SHEET_DB_API', name: 'SheetDB API Endpoint' },
    { key: 'VITE_RECAPTCHA_SITE_KEY', name: 'reCAPTCHA Site Key' }
  ];

  // Check each required variable
  requiredVars.forEach(({ key, name }) => {
    if (!import.meta.env[key]) {
      missingVars.push(name);
    }
  });

  if (missingVars.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong className="font-bold">⚠️ Waarschuwing / Warning: </strong>
      <span className="block sm:inline">
        {window.location.hostname.includes('nl') ? (
          <>
            De volgende omgevingsvariabelen ontbreken. De enquête zal niet werken zonder deze:
            <ul className="list-disc list-inside mt-2">
              {missingVars.map(name => <li key={name}>{name}</li>)}
            </ul>
          </>
        ) : (
          <>
            The following environment variables are missing. The survey will not work without them:
            <ul className="list-disc list-inside mt-2">
              {missingVars.map(name => <li key={name}>{name}</li>)}
            </ul>
          </>
        )}
      </span>
    </div>
  );
};

export default EnvironmentCheck;
