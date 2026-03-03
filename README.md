# JP Filmes

JP Filmes is a production-grade, legal-first streaming platform built with Next.js 14, serving only public domain films from Internet Archive.

## Legal Compliance

- 100% public domain catalog sourced from [Internet Archive](https://archive.org)
- No piracy logic, no illegal scraping, no copyrighted hosting
- Transparent legal page at `/legal`

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- TailwindCSS
- Video.js + HLS.js
- Firebase Realtime Database (watch party sync + chat)
- Vercel-ready deployment

## Local Development

```bash
npm install
npm run dev
```

Production commands:

```bash
npm run build
npm run start
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill values:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Firebase Setup Guide

1. Create a Firebase project.
2. Enable **Realtime Database** in locked mode.
3. Add a web app and copy the SDK keys.
4. Put keys in `.env.local`.
5. Configure rules (MVP anonymous access with basic constraints):

```json
{
  "rules": {
    "watchParty": {
      "$roomId": {
        ".read": "$roomId.matches(/^[a-zA-Z0-9_-]{3,60}$/)",
        "sync": {
          ".write": "newData.hasChildren(['playing','currentTime','updatedAt'])"
        },
        "chat": {
          ".write": "newData.hasChildren(['nickname','text','timestamp'])"
        }
      }
    }
  }
}
```

## Vercel Deployment

1. Push this repo to GitHub.
2. Import project in Vercel.
3. Add all `NEXT_PUBLIC_FIREBASE_*` environment variables.
4. Deploy with default Next.js settings.
5. Confirm `/`, `/movie/[slug]`, `/watch/[roomId]`, `/legal`, `/sitemap.xml`, and `/robots.txt` work.

## Security Overview

- Security headers in `next.config.js` (CSP, HSTS, Referrer-Policy, X-Content-Type-Options, Permissions-Policy)
- Edge middleware rate limiting and route-aware framing policy
- Basic input validation and sanitization for chat and room IDs
- HTTPS-only deployment recommended via Vercel

## Scalability Notes

- Static-first movie catalog from local JSON (easy CMS migration later)
- Dynamic imports for Video.js to reduce bundle size
- Realtime features isolated to Firebase (serverless, scalable)
- Next/Image lazy-loading for poster performance
- App Router enables code splitting and optimized rendering
