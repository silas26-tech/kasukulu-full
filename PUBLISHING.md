# Publishing Guide for Kasukulu

Kasukulu is built as a full-stack Node.js + Vite application supporting real-time Gemini Live voice AI classes, Express backend API routes, and Firestore integration.

---

## 1. Quick Local Build & Preview Test
Before publishing or deploying anywhere, verify your production build locally:
```bash
npm run build
npm run preview
```
This builds the static frontend into `/dist` and tests the production bundle.

---

## 2. Deploying to Firebase Hosting (with Cloud Functions / Cloud Run)
Because Kasukulu uses an Express backend (`server.ts`) for Gemini Live WebSockets and AI tutoring endpoints (`/api/*`), you can deploy it to **Google Cloud Run** or **Firebase App Hosting**:

1. **Google Cloud Run (Recommended for full-stack Node.js)**:
   - Connect your repository to Google Cloud Build or Cloud Run.
   - Set environment variables in Cloud Run:
     - `GEMINI_API_KEY`: Your Gemini API key from Google AI Studio.
   - Cloud Run will automatically build using `npm run build` and run using `npm start` (`node server.ts`).

2. **Firebase Hosting (Static Frontend + Hosting)**:
   - If deploying solely as static hosting, run `npm run build`. The static files in `/dist` can be hosted on Firebase Hosting or any static host (Vercel, Netlify), noting that real-time Gemini Live WebSocket proxy (`/live`) requires the Node.js backend.

---

## 3. Publishing to Google Play Store (as a Trusted Web Activity / PWA)
Since Kasukulu is a responsive Progressive Web App (PWA):
1. **PWA Wrapper**: You can wrap your deployed HTTPS URL in a **Trusted Web Activity (TWA)** using tools like Bubblewrap or PWABuilder.
2. **100% Free Compliance**: Kasukulu has no paid subscription paywalls or in-app billing services required, making review and approval smooth for educational public access on Google Play.
3. **Microphone & Audio Permissions**: Ensure `microphone` permission is enabled in `metadata.json` and Android Manifest (for TWA/PWA).

---

## 4. Required Environment Variables (.env)
Make sure the following secret is configured in your production environment (e.g., Cloud Run Secrets / `.env`):
- `GEMINI_API_KEY=your_gemini_api_key_here`
