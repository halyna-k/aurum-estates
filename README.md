# Aurum Estates

A website template for a UK lettings agency, with an AI assistant that answers general renting
questions and collects enquiries for a human agent. The demo agency, Aurum Estates, is fictional.

## Status

Chat, lead triage and the website are working. Lead storage in Google Sheets, email notifications and viewing bookings are not connected yet.

## Stack

Next.js, React, TypeScript, Tailwind CSS, Groq, Google Sheets and Calendar, Resend.

## Getting started

```bash
npm ci
cp .env.example .env.local
npm run dev
```

## Environment variables

| Name                           | Purpose                                                     |
| ------------------------------ | ----------------------------------------------------------- |
| `GROQ_API_KEY`                 | Groq API key for the assistant                              |
| `SITE_URL`                     | Public site URL, used for metadata                          |
| `RESEND_API_KEY`               | Resend API key for lead emails                              |
| `RESEND_FROM_EMAIL`            | Sender address of system emails (domain verified in Resend) |
| `LEAD_NOTIFY_EMAIL`            | Address(es) that receive new leads, comma-separated         |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account the sheet and calendar are shared with     |
| `GOOGLE_PRIVATE_KEY`           | Private key of that service account                         |
| `GOOGLE_SHEETS_ID`             | ID of the leads spreadsheet                                 |
| `GOOGLE_CALENDAR_ID`           | Calendar used for viewings                                  |

Share the sheet and the calendar with the service account email.

## Scripts

`dev`, `build`, `start`, `lint`, `typecheck`, `format`

## Project structure

- `src/agency/` – everything specific to one agency: details, properties, services, fonts, theme
- `src/app/` – pages and API routes
- `src/components/` – UI, sections, chat
- `src/lib/chat/` – prompt, validation and limits for the assistant
- `src/lib/leads/` – lead building, triage, storage and notifications
- `src/types/` – shared types

## Adding a new agency

Clone the repository and change only `src/agency/*`, `public/images/*` and `.env.local`.

## Image credits

Property photos: Unsplash (photographer names and links to be added).

## Notes

The demo is fictional. The assistant gives general information only, not legal advice.
