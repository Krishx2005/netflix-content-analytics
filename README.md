# Netflix Content Analytics

Interactive dashboard exploring Netflix's content library — growth patterns, geographic distribution, genres, ratings, and the people behind the catalog. Built as a data storytelling project with 7 narrative chapters.

**Live:** [netflix-content-analytics.vercel.app](https://netflix-content-analytics.vercel.app)

## Tech

- **Frontend:** React 19, Vite, Tailwind CSS, Recharts, D3.js (choropleth + force graph), Framer Motion
- **Backend:** Node.js, Express, SQLite (better-sqlite3)
- **Data:** 800-title synthetic dataset modeled after Netflix's catalog

## Run locally

```bash
npm install
cp .env.example .env
npm run seed        # build the SQLite DB from CSV
npm run dev:all     # starts backend (3001) + frontend (5173)
```

## API

| Endpoint | What it returns |
|----------|----------------|
| `/api/stats` | Overview counts |
| `/api/growth` | Content additions over time |
| `/api/countries` | Geographic distribution |
| `/api/genres` | Genre breakdown |
| `/api/ratings` | Rating distribution |
| `/api/directors` | Top directors + filmographies |
| `/api/actors` | Top actors + filmographies |
| `/api/heatmap` | Monthly release patterns |
| `/api/network` | Actor/director collaboration graph |
| `/api/filters` | Available filter values |

## Deploy

**Backend (Render):** Build `npm install && npm run seed`, start `node server/index.js`. Set `CORS_ORIGIN` to your Vercel URL.

**Frontend (Vercel):** Build command `npm run build:local`. Set `VITE_API_URL` to your Render URL.
