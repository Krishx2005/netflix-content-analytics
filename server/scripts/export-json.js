// Pre-builds all API data as static JSON for Vercel deployment
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '..', 'db', 'netflix.db');
const OUT_DIR = join(__dirname, '..', '..', 'public', 'data');

if (!existsSync(DB_PATH)) {
  console.error('Database not found. Run `npm run seed` first.');
  process.exit(1);
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const db = new Database(DB_PATH, { readonly: true });

function write(name, data) {
  writeFileSync(join(OUT_DIR, `${name}.json`), JSON.stringify(data));
  console.log(`  Exported ${name}.json`);
}

console.log('Exporting API data as static JSON...\n');

// Stats
const total = db.prepare('SELECT COUNT(*) as count FROM titles').get().count;
const movies = db.prepare("SELECT COUNT(*) as count FROM titles WHERE type = 'Movie'").get().count;
const tvShows = db.prepare("SELECT COUNT(*) as count FROM titles WHERE type = 'TV Show'").get().count;
const yearRange = db.prepare('SELECT MIN(release_year) as min, MAX(release_year) as max FROM titles').get();
const countryCount = db.prepare('SELECT COUNT(*) as count FROM countries').get().count;
const genreCount = db.prepare('SELECT COUNT(*) as count FROM genres').get().count;
write('stats', { total, movies, tvShows, yearRange, countryCount, genreCount });

// Growth
const growthRows = db.prepare(`
  SELECT CAST(substr(date_added,1,4) AS INTEGER) as year,
         CAST(substr(date_added,6,2) AS INTEGER) as month,
         SUM(CASE WHEN type='Movie' THEN 1 ELSE 0 END) as movies,
         SUM(CASE WHEN type='TV Show' THEN 1 ELSE 0 END) as tvShows,
         COUNT(*) as total
  FROM titles WHERE date_added IS NOT NULL AND date_added != ''
  GROUP BY year, month ORDER BY year, month
`).all();
let cum = 0;
write('growth', growthRows.map(r => { cum += r.total; return { ...r, cumulative: cum }; }));

// Countries
write('countries', db.prepare(`
  SELECT c.name as country, COUNT(DISTINCT tc.title_id) as count,
         SUM(CASE WHEN t.type='Movie' THEN 1 ELSE 0 END) as movies,
         SUM(CASE WHEN t.type='TV Show' THEN 1 ELSE 0 END) as tvShows
  FROM countries c JOIN title_countries tc ON tc.country_id=c.id
  JOIN titles t ON t.id=tc.title_id GROUP BY c.id ORDER BY count DESC
`).all());

// Genres
write('genres', db.prepare(`
  SELECT g.name as genre, COUNT(DISTINCT tg.title_id) as count,
         SUM(CASE WHEN t.type='Movie' THEN 1 ELSE 0 END) as movies,
         SUM(CASE WHEN t.type='TV Show' THEN 1 ELSE 0 END) as tvShows
  FROM genres g JOIN title_genres tg ON tg.genre_id=g.id
  JOIN titles t ON t.id=tg.title_id GROUP BY g.id ORDER BY count DESC
`).all());

// Ratings
write('ratings', db.prepare(`
  SELECT rating, COUNT(*) as count,
         SUM(CASE WHEN type='Movie' THEN 1 ELSE 0 END) as movies,
         SUM(CASE WHEN type='TV Show' THEN 1 ELSE 0 END) as tvShows
  FROM titles WHERE rating IS NOT NULL AND rating != ''
  GROUP BY rating ORDER BY count DESC
`).all());

// Directors
const directors = db.prepare(`
  SELECT director as name, COUNT(*) as count FROM titles
  WHERE director IS NOT NULL AND director != ''
  GROUP BY director ORDER BY count DESC LIMIT 15
`).all();
const getDirTitles = db.prepare('SELECT title, release_year as year, type FROM titles WHERE director=? ORDER BY release_year DESC');
write('directors', directors.map(d => ({ ...d, titles: getDirTitles.all(d.name) })));

// Actors
const actors = db.prepare(`
  SELECT a.name, COUNT(DISTINCT tc.title_id) as count
  FROM actors a JOIN title_cast tc ON tc.actor_id=a.id
  GROUP BY a.id ORDER BY count DESC LIMIT 15
`).all();
const getActTitles = db.prepare(`
  SELECT t.title, t.release_year as year, t.type FROM titles t
  JOIN title_cast tc ON tc.title_id=t.id JOIN actors a ON a.id=tc.actor_id
  WHERE a.name=? ORDER BY t.release_year DESC
`);
write('actors', actors.map(a => ({ ...a, titles: getActTitles.all(a.name) })));

// Heatmap
write('heatmap', db.prepare(`
  SELECT CAST(substr(date_added,1,4) AS INTEGER) as year,
         CAST(substr(date_added,6,2) AS INTEGER) as month, COUNT(*) as count
  FROM titles WHERE date_added IS NOT NULL AND date_added != ''
  GROUP BY year, month ORDER BY year, month
`).all());

// Network (simplified - same logic as API route)
const frequentActors = db.prepare(`
  SELECT a.id, a.name, COUNT(DISTINCT tc.title_id) as count
  FROM actors a JOIN title_cast tc ON tc.actor_id=a.id
  GROUP BY a.id HAVING count >= 3
`).all();
const frequentDirectors = db.prepare(`
  SELECT director as name, COUNT(*) as count FROM titles
  WHERE director IS NOT NULL AND director != ''
  GROUP BY director HAVING count >= 3
`).all();
const nodes = [];
const nodeMap = new Map();
for (const a of frequentActors) {
  const id = `actor-${a.id}`;
  nodes.push({ id, name: a.name, type: 'actor', count: a.count });
  nodeMap.set(a.name, id);
}
for (const d of frequentDirectors) {
  const id = `director-${d.name}`;
  nodes.push({ id, name: d.name, type: 'director', count: d.count });
  nodeMap.set(`dir:${d.name}`, id);
}
const actorTitles = frequentActors.length > 0
  ? db.prepare(`SELECT tc.title_id, a.name FROM title_cast tc JOIN actors a ON a.id=tc.actor_id WHERE a.id IN (${frequentActors.map(()=>'?').join(',')})`).all(...frequentActors.map(a=>a.id))
  : [];
const titleToActors = new Map();
for (const r of actorTitles) {
  if (!titleToActors.has(r.title_id)) titleToActors.set(r.title_id, []);
  titleToActors.get(r.title_id).push(r.name);
}
const linkMap = new Map();
const getTitleName = db.prepare('SELECT title FROM titles WHERE id=?');
for (const [tid, names] of titleToActors) {
  if (names.length < 2) continue;
  const t = getTitleName.get(tid);
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const key = [names[i], names[j]].sort().join('|||');
      if (!linkMap.has(key)) linkMap.set(key, { names: [names[i], names[j]], weight: 0, titles: [] });
      const l = linkMap.get(key);
      l.weight++;
      if (t) l.titles.push(t.title);
    }
  }
}
const links = [];
for (const [, l] of linkMap) {
  if (l.weight < 2) continue;
  const s = nodeMap.get(l.names[0]);
  const t = nodeMap.get(l.names[1]);
  if (s && t) links.push({ source: s, target: t, weight: l.weight, titles: l.titles });
}
links.sort((a, b) => b.weight - a.weight);
const topLinks = links.slice(0, 100);
const usedIds = new Set();
topLinks.forEach(l => { usedIds.add(l.source); usedIds.add(l.target); });
write('network', { nodes: nodes.filter(n => usedIds.has(n.id)), links: topLinks });

// Filters
write('filters', {
  types: db.prepare("SELECT DISTINCT type FROM titles ORDER BY type").all().map(r => r.type),
  genres: db.prepare("SELECT name FROM genres ORDER BY name").all().map(r => r.name),
  countries: db.prepare("SELECT name FROM countries ORDER BY name").all().map(r => r.name),
  ratings: db.prepare("SELECT DISTINCT rating FROM titles WHERE rating IS NOT NULL AND rating != '' ORDER BY rating").all().map(r => r.rating),
  years: db.prepare("SELECT DISTINCT release_year FROM titles WHERE release_year IS NOT NULL ORDER BY release_year DESC").all().map(r => r.release_year),
});

db.close();
console.log('\nDone! Static JSON files written to public/data/');
