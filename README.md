# Netflix Content Analytics Dashboard

A data journalism-inspired interactive dashboard exploring Netflix's global content library. Built as a portfolio submission for Netflix's Visualization Engineer internship.

![Netflix Analytics](https://img.shields.io/badge/Netflix-Analytics-E50914?style=for-the-badge&logo=netflix&logoColor=white)

## The Story

**800 Titles. 40+ Countries. One Data Story.**

This dashboard tells the story of Netflix's content strategy through seven narrative chapters — from explosive growth patterns to geographic diversity, genre bets, and the creative networks behind the catalog. Every visualization is designed to communicate an insight, not just display data.

## Key Insights

- **Content Explosion**: Netflix's library grew exponentially from 2015-2022, with movies outpacing TV shows 2:1
- **Global By Design**: The US and India each contribute ~25% of content, but the true story is breadth — 40+ countries represented
- **Drama Dominates**: International dramas and movies are the backbone of the catalog
- **Mature Audience Focus**: ~30% of content is rated TV-MA/R, creating a family-content gap that competitors exploit
- **Strategic Timing**: Content releases peak in December/January and July, aligning with high-viewership periods

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + Vite | UI framework and build tool |
| Styling | Tailwind CSS | Utility-first CSS with Netflix dark theme |
| Charts | Recharts | Area, bar, donut, and heatmap charts |
| D3 Visualizations | D3.js v7 | Choropleth map and force-directed network graph |
| Animations | Framer Motion | Scroll-reveal entrances and micro-interactions |
| Backend | Node.js + Express | REST API serving chart data |
| Database | SQLite (better-sqlite3) | Relational data with junction tables |
| Data | 800-title synthetic dataset | Modeled after Netflix's content catalog |

## Architecture

```
netflix-analytics-dashboard/
├── server/                   # Express backend
│   ├── data/                 # CSV dataset
│   ├── db/                   # SQLite database (generated)
│   ├── routes/api.js         # 10 REST API endpoints
│   ├── scripts/seed.js       # Database seeder
│   └── index.js              # Express server
├── src/                      # React frontend
│   ├── components/
│   │   ├── charts/           # 7 visualization components
│   │   ├── layout/           # Navbar, Footer, ChapterHeader
│   │   └── ui/               # ChartContainer, FilterBar, StatCard, etc.
│   ├── hooks/                # useApi, useScrollReveal
│   ├── services/api.js       # API client layer
│   └── utils/formatters.js   # Color scales, formatting helpers
├── index.html
├── tailwind.config.js
└── vite.config.js
```

## Design Decisions

### Data Storytelling
Each chapter opens with a 1-2 sentence editorial insight above the visualization — explaining the "so what" before the reader sees the chart. The narrative flows from macro (growth) to micro (people), building understanding progressively.

### Visual Design
- **Netflix dark theme** (#141414 background) with intentional red accents (#E50914) to highlight key data points
- **Typography hierarchy**: Playfair Display (serif) for editorial headlines, Inter (sans) for body, JetBrains Mono for data values
- **Color as meaning**: Red = emphasis/highlight, orange = secondary category, green = family-friendly ratings. No rainbow charts.

### Chart Form Selection
- **Area chart** for growth: Shows both trajectory shape and cumulative volume
- **Choropleth** for geography: The only chart form that gives spatial context to country-level data
- **Donut** for genres: Emphasizes part-to-whole relationships with interactive drill-down
- **Horizontal bars** for people: Natural for comparing named entities with readable labels
- **Heatmap** for seasonality: Two-dimensional patterns (month × year) are impossible to show in any other form
- **Force-directed graph** for networks: Reveals clustering and collaboration patterns organically

## Running Locally

### Prerequisites
- Node.js 18+
- npm 9+

### Setup

```bash
# Install dependencies
npm install

# Seed the database from CSV
npm run seed

# Start the backend API (port 3001)
npm run server

# In another terminal, start the frontend (port 5173)
npm run dev

# Or run both simultaneously
npm run dev:all
```

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/stats` | Overview statistics |
| `GET /api/growth` | Content additions over time |
| `GET /api/countries` | Geographic distribution |
| `GET /api/genres` | Genre breakdown |
| `GET /api/ratings` | Content rating distribution |
| `GET /api/directors` | Top directors with filmographies |
| `GET /api/actors` | Top actors with filmographies |
| `GET /api/heatmap` | Monthly release patterns |
| `GET /api/network` | Actor/director collaboration graph |
| `GET /api/filters` | Available filter values |

## Built By

**Krish Patel** — [GitHub](https://github.com/krishpatel)
