# Spotify Streaming History Viewer

A browser-only viewer for your Spotify *Extended Streaming History* export.
Drop the JSON files Spotify mails you in and get a dashboard of your
listening habits — top artists, tracks and albums, year/hour/weekday
breakdowns, platform and country usage, skip and shuffle rates, and more.

Everything runs locally in your browser. Nothing is uploaded.

## Features

- Drag-and-drop loader for one or many `Streaming_History_*.json` files
- Per-file toggles so you can include/exclude individual years on the fly
- Top artists, tracks and albums — sortable by total time *or* play count,
  each showing the first time it appeared in your history
- Total **and** average listening per hour-of-day and per weekday, in any
  IANA time zone
- Year filter and overall date range
- Platform and country breakdowns (country codes resolved to localized names)
- 12 UI languages (EN, TR, ES, FR, DE, PT, IT, RU, ZH, JA, AR, HI) with
  RTL support for Arabic; language choice is remembered across visits
- Step-by-step help page explaining how to request your data from Spotify
- Mobile-friendly responsive layout with a sticky top bar

## Getting your data

Open the in-app **How does it work?** page, or follow Spotify's flow:

1. Go to <https://www.spotify.com/account/privacy/>
2. Scroll to "Download your data" and tick **Extended streaming history**
3. Confirm the email from Spotify
4. When Spotify emails the download link (usually a few days, up to 30),
   download the ZIP, extract it, and drop the `Streaming_History_*.json`
   files into the viewer

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Tech

Vue 3 (Composition API + `<script setup>`), Vite, vue-router, vue-i18n.
No backend, no analytics, no external chart library — the charts are
plain CSS bars.
