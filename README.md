# Kisan AI Assistant

A voice-enabled, location-aware AI platform for Indian farmers.

## Architecture

- **Frontend**: React 19 + Tailwind CSS (Vite)
- **Backend**: Node.js + Express
- **Database**: SQLite (via `better-sqlite3`) - easily migratable to PostgreSQL
- **AI**: Google Gemini API (`gemini-2.5-flash-lite-latest`)
- **Voice**: Web Speech API (STT) + SpeechSynthesis (TTS)

## Folder Structure

```
/
├── server.ts           # Express server & API routes
├── kisan.db            # SQLite database (auto-created)
├── src/
│   ├── components/     # Reusable UI components (VoiceInput, etc.)
│   ├── context/        # State management (UserContext)
│   ├── pages/          # Application pages (Dashboard, Chat, etc.)
│   ├── App.tsx         # Main router
│   └── index.css       # Tailwind & custom styles
```

## Features

1.  **Smart Onboarding**: Captures location, land size, crops, and language preference.
2.  **Scheme Finder**: Matches farmers with eligible government schemes.
3.  **Crop Advisory**: AI-powered chat for disease diagnosis and farming advice.
4.  **Mandi Prices**: Location-based market price information (Mock data for MVP).
5.  **Voice Interface**: Supports voice input for accessibility.

## Deployment Strategy

1.  **Containerization**: Dockerize the application (Node.js runtime).
2.  **Database**: Migrate SQLite to managed PostgreSQL (e.g., AWS RDS, Google Cloud SQL) for production.
3.  **Hosting**: Deploy to Google Cloud Run or AWS App Runner for auto-scaling.
4.  **CDN**: Serve static assets via CDN.

## 90-Day MVP Roadmap

-   **Month 1: Core Foundation**
    -   Refine UI/UX with actual farmer feedback.
    -   Expand Scheme database with real data from government portals.
    -   Implement robust error handling and offline support (PWA).

-   **Month 2: Intelligence & Data**
    -   Integrate real-time Mandi price API (e.g., data.gov.in).
    -   Fine-tune Gemini prompts for regional languages (Hindi, Punjabi, etc.).
    -   Implement image upload for crop disease detection.

-   **Month 3: Scale & Community**
    -   Add user authentication (OTP based).
    -   Launch "Community" feature for peer-to-peer advice.
    -   Pilot with 1000 farmers in a specific district.
