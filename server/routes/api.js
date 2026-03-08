import { Router } from 'express';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '..', 'db', 'netflix.db');

const db = new Database(DB_PATH, { readonly: true });
db.pragma('journal_mode = WAL');

const router = Router();

// ─── GET /api/stats ──────────────────────────────────────────────────────────
router.get('/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM titles').get().count;
  const movies = db.prepare("SELECT COUNT(*) as count FROM titles WHERE type = 'Movie'").get().count;
  const tvShows = db.prepare("SELECT COUNT(*) as count FROM titles WHERE type = 'TV Show'").get().count;
  const yearRange = db.prepare('SELECT MIN(release_year) as min, MAX(release_year) as max FROM titles').get();
  const countryCount = db.prepare('SELECT COUNT(*) as count FROM countries').get().count;
  const genreCount = db.prepare('SELECT COUNT(*) as count FROM genres').get().count;

  res.json({
    total,
    movies,
    tvShows,
    yearRange: { min: yearRange.min, max: yearRange.max },
    countryCount,
    genreCount,
  });
});

// ─── GET /api/growth ─────────────────────────────────────────────────────────
router.get('/growth', (req, res) => {
  const { type } = req.query;

  let whereClause = "WHERE date_added IS NOT NULL AND date_added != ''";
  const params = [];
  if (type) {
    whereClause += ' AND type = ?';
    params.push(type);
  }

  const rows = db.prepare(`
    SELECT
      CAST(substr(date_added, 1, 4) AS INTEGER) as year,
      CAST(substr(date_added, 6, 2) AS INTEGER) as month,
      SUM(CASE WHEN type = 'Movie' THEN 1 ELSE 0 END) as movies,
      SUM(CASE WHEN type = 'TV Show' THEN 1 ELSE 0 END) as tvShows,
      COUNT(*) as total
    FROM titles
    ${whereClause}
    GROUP BY year, month
    ORDER BY year, month
  `).all(...params);

  let cumulative = 0;
  const result = rows.map(r => {
    cumulative += r.total;
    return { ...r, cumulative };
  });

  res.json(result);
});

// ─── GET /api/countries ──────────────────────────────────────────────────────
router.get('/countries', (req, res) => {
  const rows = db.prepare(`
    SELECT
      c.name as country,
      COUNT(DISTINCT tc.title_id) as count,
      SUM(CASE WHEN t.type = 'Movie' THEN 1 ELSE 0 END) as movies,
      SUM(CASE WHEN t.type = 'TV Show' THEN 1 ELSE 0 END) as tvShows
    FROM countries c
    JOIN title_countries tc ON tc.country_id = c.id
    JOIN titles t ON t.id = tc.title_id
    GROUP BY c.id
    ORDER BY count DESC
  `).all();

  res.json(rows);
});

// ─── GET /api/genres ─────────────────────────────────────────────────────────
router.get('/genres', (req, res) => {
  const { type } = req.query;

  let whereClause = '';
  const params = [];
  if (type) {
    whereClause = 'WHERE t.type = ?';
    params.push(type);
  }

  const rows = db.prepare(`
    SELECT
      g.name as genre,
      COUNT(DISTINCT tg.title_id) as count,
      SUM(CASE WHEN t.type = 'Movie' THEN 1 ELSE 0 END) as movies,
      SUM(CASE WHEN t.type = 'TV Show' THEN 1 ELSE 0 END) as tvShows
    FROM genres g
    JOIN title_genres tg ON tg.genre_id = g.id
    JOIN titles t ON t.id = tg.title_id
    ${whereClause}
    GROUP BY g.id
    ORDER BY count DESC
  `).all(...params);

  res.json(rows);
});

// ─── GET /api/ratings ────────────────────────────────────────────────────────
router.get('/ratings', (req, res) => {
  const rows = db.prepare(`
    SELECT
      rating,
      COUNT(*) as count,
      SUM(CASE WHEN type = 'Movie' THEN 1 ELSE 0 END) as movies,
      SUM(CASE WHEN type = 'TV Show' THEN 1 ELSE 0 END) as tvShows
    FROM titles
    WHERE rating IS NOT NULL AND rating != ''
    GROUP BY rating
    ORDER BY count DESC
  `).all();

  res.json(rows);
});

// ─── GET /api/directors ──────────────────────────────────────────────────────
router.get('/directors', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 15;

  const directors = db.prepare(`
    SELECT
      director as name,
      COUNT(*) as count
    FROM titles
    WHERE director IS NOT NULL AND director != ''
    GROUP BY director
    ORDER BY count DESC
    LIMIT ?
  `).all(limit);

  const getTitles = db.prepare(`
    SELECT title, release_year as year, type
    FROM titles
    WHERE director = ?
    ORDER BY release_year DESC
  `);

  const result = directors.map(d => ({
    ...d,
    titles: getTitles.all(d.name),
  }));

  res.json(result);
});

// ─── GET /api/actors ─────────────────────────────────────────────────────────
router.get('/actors', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 15;

  const actors = db.prepare(`
    SELECT
      a.name,
      COUNT(DISTINCT tc.title_id) as count
    FROM actors a
    JOIN title_cast tc ON tc.actor_id = a.id
    GROUP BY a.id
    ORDER BY count DESC
    LIMIT ?
  `).all(limit);

  const getTitles = db.prepare(`
    SELECT t.title, t.release_year as year, t.type
    FROM titles t
    JOIN title_cast tc ON tc.title_id = t.id
    JOIN actors a ON a.id = tc.actor_id
    WHERE a.name = ?
    ORDER BY t.release_year DESC
  `);

  const result = actors.map(a => ({
    ...a,
    titles: getTitles.all(a.name),
  }));

  res.json(result);
});

// ─── GET /api/heatmap ────────────────────────────────────────────────────────
router.get('/heatmap', (req, res) => {
  const rows = db.prepare(`
    SELECT
      CAST(substr(date_added, 1, 4) AS INTEGER) as year,
      CAST(substr(date_added, 6, 2) AS INTEGER) as month,
      COUNT(*) as count
    FROM titles
    WHERE date_added IS NOT NULL AND date_added != ''
    GROUP BY year, month
    ORDER BY year, month
  `).all();

  res.json(rows);
});

// ─── GET /api/network ────────────────────────────────────────────────────────
router.get('/network', (req, res) => {
  const frequentActors = db.prepare(`
    SELECT a.id, a.name, COUNT(DISTINCT tc.title_id) as count
    FROM actors a
    JOIN title_cast tc ON tc.actor_id = a.id
    GROUP BY a.id
    HAVING count >= 3
  `).all();

  const frequentDirectors = db.prepare(`
    SELECT director as name, COUNT(*) as count
    FROM titles
    WHERE director IS NOT NULL AND director != ''
    GROUP BY director
    HAVING count >= 3
  `).all();

  const nodes = [];
  const nodeMap = new Map();

  for (const actor of frequentActors) {
    const nodeId = `actor-${actor.id}`;
    nodes.push({ id: nodeId, name: actor.name, type: 'actor', count: actor.count });
    nodeMap.set(actor.name, nodeId);
  }

  for (const dir of frequentDirectors) {
    const nodeId = `director-${dir.name}`;
    nodes.push({ id: nodeId, name: dir.name, type: 'director', count: dir.count });
    nodeMap.set(`dir:${dir.name}`, nodeId);
  }

  const actorTitles = db.prepare(`
    SELECT tc.title_id, a.name
    FROM title_cast tc
    JOIN actors a ON a.id = tc.actor_id
    WHERE a.id IN (${frequentActors.map(() => '?').join(',')})
  `).all(...frequentActors.map(a => a.id));

  const titleToActors = new Map();
  for (const row of actorTitles) {
    if (!titleToActors.has(row.title_id)) titleToActors.set(row.title_id, []);
    titleToActors.get(row.title_id).push(row.name);
  }

  const linkMap = new Map();
  const getTitleName = db.prepare('SELECT title FROM titles WHERE id = ?');

  for (const [titleId, actorNames] of titleToActors) {
    if (actorNames.length < 2) continue;
    const titleRow = getTitleName.get(titleId);
    for (let i = 0; i < actorNames.length; i++) {
      for (let j = i + 1; j < actorNames.length; j++) {
        const a = actorNames[i];
        const b = actorNames[j];
        const key = [a, b].sort().join('|||');
        if (!linkMap.has(key)) linkMap.set(key, { names: [a, b], weight: 0, titles: [] });
        const link = linkMap.get(key);
        link.weight++;
        if (titleRow) link.titles.push(titleRow.title);
      }
    }
  }

  for (const dir of frequentDirectors) {
    const dirTitles = db.prepare(`
      SELECT t.id, t.title FROM titles t WHERE t.director = ?
    `).all(dir.name);

    for (const dt of dirTitles) {
      const castInTitle = db.prepare(`
        SELECT a.name FROM actors a
        JOIN title_cast tc ON tc.actor_id = a.id
        WHERE tc.title_id = ? AND a.id IN (${frequentActors.map(() => '?').join(',') || 'NULL'})
      `).all(dt.id, ...frequentActors.map(a => a.id));

      for (const castRow of castInTitle) {
        const key = `dir:${dir.name}|||${castRow.name}`;
        if (!linkMap.has(key)) linkMap.set(key, { dirName: dir.name, actorName: castRow.name, weight: 0, titles: [] });
        const link = linkMap.get(key);
        link.weight++;
        link.titles.push(dt.title);
      }
    }
  }

  // weight >= 2 for actor-actor, >= 1 for director-actor
  const links = [];
  for (const [key, link] of linkMap) {
    if (link.dirName) {
      // Director-actor link
      const sourceId = nodeMap.get(`dir:${link.dirName}`);
      const targetId = nodeMap.get(link.actorName);
      if (sourceId && targetId) {
        links.push({ source: sourceId, target: targetId, weight: link.weight, titles: link.titles });
      }
    } else if (link.weight >= 2) {
      // Actor-actor link
      const sourceId = nodeMap.get(link.names[0]);
      const targetId = nodeMap.get(link.names[1]);
      if (sourceId && targetId) {
        links.push({ source: sourceId, target: targetId, weight: link.weight, titles: link.titles });
      }
    }
  }

  links.sort((a, b) => b.weight - a.weight);
  const topLinks = links.slice(0, 100);

  const usedNodeIds = new Set();
  for (const link of topLinks) {
    usedNodeIds.add(link.source);
    usedNodeIds.add(link.target);
  }
  const filteredNodes = nodes.filter(n => usedNodeIds.has(n.id));

  res.json({ nodes: filteredNodes, links: topLinks });
});

// ─── GET /api/content ────────────────────────────────────────────────────────
router.get('/content', (req, res) => {
  const { search, type, genre, country, rating, page: pageStr, limit: limitStr } = req.query;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(limitStr, 10) || 20));
  const offset = (page - 1) * limit;

  const conditions = [];
  const params = [];

  if (search) {
    conditions.push("(t.title LIKE ? OR t.description LIKE ? OR t.director LIKE ? OR t.cast_members LIKE ?)");
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }
  if (type) {
    conditions.push('t.type = ?');
    params.push(type);
  }
  if (rating) {
    conditions.push('t.rating = ?');
    params.push(rating);
  }

  let joins = '';
  if (genre) {
    joins += ' JOIN title_genres tg ON tg.title_id = t.id JOIN genres g ON g.id = tg.genre_id';
    conditions.push('g.name = ?');
    params.push(genre);
  }
  if (country) {
    joins += ' JOIN title_countries tco ON tco.title_id = t.id JOIN countries co ON co.id = tco.country_id';
    conditions.push('co.name = ?');
    params.push(country);
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  const countRow = db.prepare(`
    SELECT COUNT(DISTINCT t.id) as total FROM titles t ${joins} ${whereClause}
  `).get(...params);

  const rows = db.prepare(`
    SELECT DISTINCT t.id, t.show_id, t.type, t.title, t.director, t.cast_members,
           t.country, t.date_added, t.release_year, t.rating, t.duration,
           t.listed_in, t.description
    FROM titles t ${joins}
    ${whereClause}
    ORDER BY t.date_added DESC, t.id DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  res.json({
    data: rows,
    total: countRow.total,
    page,
    limit,
    totalPages: Math.ceil(countRow.total / limit),
  });
});

// ─── GET /api/filters ────────────────────────────────────────────────────────
router.get('/filters', (req, res) => {
  const types = db.prepare("SELECT DISTINCT type FROM titles ORDER BY type").all().map(r => r.type);
  const genres = db.prepare("SELECT name FROM genres ORDER BY name").all().map(r => r.name);
  const countries = db.prepare("SELECT name FROM countries ORDER BY name").all().map(r => r.name);
  const ratings = db.prepare("SELECT DISTINCT rating FROM titles WHERE rating IS NOT NULL AND rating != '' ORDER BY rating").all().map(r => r.rating);
  const years = db.prepare("SELECT DISTINCT release_year FROM titles WHERE release_year IS NOT NULL ORDER BY release_year DESC").all().map(r => r.release_year);

  res.json({ types, genres, countries, ratings, years });
});

export default router;
