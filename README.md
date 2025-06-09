# Mascot Survey

This project is a simple web survey that lets participants rank mascots. It is built with Vite and React.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and adjust the values:
   - `VITE_SHEET_DB_API` – SheetDB API endpoint used to store results.
   - `VITE_RECAPTCHA_SITE_KEY` – reCAPTCHA site key.
   - `VITE_DISABLE_SUBMISSION_CHECK` – set to `true` during development to allow multiple submissions.
   - `VITE_DISABLE_CAPTCHA` – set to `true` to disable CAPTCHA locally.

   **Note:** Environment variables are read when the dev server starts. Restart or rebuild after making changes.

3. Run the development server:
   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   ```

## Running Tests

```
npm test
```

