# Mascot Survey

This project is a Vite + React application for gathering feedback about the TU Delft library mascot. The survey stores responses via a SheetDB API and uses Google reCAPTCHA to prevent spam.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Run the development server**
   ```bash
   npm run dev
   ```
3. **Build for production**
   ```bash
   npm run build
   ```

## Environment Variables

Copy `.env.example` to `.env` and provide values for the variables listed below:

- `VITE_SHEET_DB_API` – URL of the SheetDB API endpoint used to store survey results.
- `VITE_RECAPTCHA_SITE_KEY` – Google reCAPTCHA site key used to verify submissions.
- `VITE_DISABLE_SUBMISSION_CHECK` – Set to `false` when you want to enable the one‑time submission check that prevents multiple answers from the same browser.
- `VITE_DISABLE_CAPTCHA` – Set to `true` to disable the CAPTCHA locally.

Environment variables are read when the server starts. After changing a variable, restart the dev server or rebuild the project for the new values to take effect.
