# Satellite Tracker

A simple web app to track satellites on an interactive map. It fetches TLEs from [Celestrak](https://celestrak.org/) and propagates positions in the browser with [`satellite.js`](https://github.com/shashwatak/satellite-js). The map is rendered with Leaflet.

- Live (after push to `main`): https://coco11211.github.io/satelitetracker

## Local dev

```bash
npm install
npm run dev
# open the URL Vite prints (http://localhost:5173)
```

## Notes

- Large groups can be heavy; a few satellites are selected by default.
- Data comes directly from Celestrak; outages or rate limits can occur.
- Positions depend on TLE recency.

## Deploy

- Pushing to `main` triggers GitHub Actions to build and deploy to GitHub Pages.
- Vite is configured with `base: '/satelitetracker/'` for correct asset paths.