import { readFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { parse } from 'csv-parse/sync';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CSV_PATH = join(__dirname, '..', 'data', 'netflix_titles.csv');
const DB_DIR = join(__dirname, '..', 'db');
const DB_PATH = join(DB_DIR, 'netflix.db');

// Ensure db directory exists
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

// Parse "Month Day, Year" into ISO date string
function parseDate(dateStr) {
  if (!dateStr || !dateStr.trim()) return null;
  const d = new Date(dateStr.trim());
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Split comma-separated values, trim whitespace, filter blanks
function splitField(value) {
  if (!value || !value.trim()) return [];
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

console.log('Reading CSV...');
const csvData = readFileSync(CSV_PATH, 'utf-8');
const records = parse(csvData, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  relax_column_count: true,
});
console.log(`Parsed ${records.length} records from CSV.`);

// Remove old DB if it exists
if (existsSync(DB_PATH)) {
  console.log('Removing existing database...');
  try { unlinkSync(DB_PATH); } catch {}
  try { unlinkSync(DB_PATH + '-wal'); } catch {}
  try { unlinkSync(DB_PATH + '-shm'); } catch {}
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('Creating tables...');

db.exec(`
  CREATE TABLE IF NOT EXISTS titles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    show_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    director TEXT,
    cast_members TEXT,
    country TEXT,
    date_added TEXT,
    release_year INTEGER,
    rating TEXT,
    duration TEXT,
    listed_in TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS countries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS actors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS title_genres (
    title_id INTEGER NOT NULL REFERENCES titles(id),
    genre_id INTEGER NOT NULL REFERENCES genres(id),
    PRIMARY KEY (title_id, genre_id)
  );

  CREATE TABLE IF NOT EXISTS title_countries (
    title_id INTEGER NOT NULL REFERENCES titles(id),
    country_id INTEGER NOT NULL REFERENCES countries(id),
    PRIMARY KEY (title_id, country_id)
  );

  CREATE TABLE IF NOT EXISTS title_cast (
    title_id INTEGER NOT NULL REFERENCES titles(id),
    actor_id INTEGER NOT NULL REFERENCES actors(id),
    PRIMARY KEY (title_id, actor_id)
  );
`);

// Prepare insert statements
const insertTitle = db.prepare(`
  INSERT INTO titles (show_id, type, title, director, cast_members, country, date_added, release_year, rating, duration, listed_in, description)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertGenre = db.prepare(`INSERT OR IGNORE INTO genres (name) VALUES (?)`);
const insertCountry = db.prepare(`INSERT OR IGNORE INTO countries (name) VALUES (?)`);
const insertActor = db.prepare(`INSERT OR IGNORE INTO actors (name) VALUES (?)`);

const getGenreId = db.prepare(`SELECT id FROM genres WHERE name = ?`);
const getCountryId = db.prepare(`SELECT id FROM countries WHERE name = ?`);
const getActorId = db.prepare(`SELECT id FROM actors WHERE name = ?`);

const insertTitleGenre = db.prepare(`INSERT OR IGNORE INTO title_genres (title_id, genre_id) VALUES (?, ?)`);
const insertTitleCountry = db.prepare(`INSERT OR IGNORE INTO title_countries (title_id, country_id) VALUES (?, ?)`);
const insertTitleCast = db.prepare(`INSERT OR IGNORE INTO title_cast (title_id, actor_id) VALUES (?, ?)`);

console.log('Inserting data...');

const insertAll = db.transaction(() => {
  for (const row of records) {
    const dateAdded = parseDate(row.date_added);
    const releaseYear = row.release_year ? parseInt(row.release_year, 10) : null;

    const info = insertTitle.run(
      row.show_id,
      row.type,
      row.title,
      row.director || null,
      row.cast || null,
      row.country || null,
      dateAdded,
      releaseYear,
      row.rating || null,
      row.duration || null,
      row.listed_in || null,
      row.description || null
    );
    const titleId = info.lastInsertRowid;

    // Genres
    for (const genre of splitField(row.listed_in)) {
      insertGenre.run(genre);
      const genreRow = getGenreId.get(genre);
      insertTitleGenre.run(titleId, genreRow.id);
    }

    // Countries
    for (const country of splitField(row.country)) {
      insertCountry.run(country);
      const countryRow = getCountryId.get(country);
      insertTitleCountry.run(titleId, countryRow.id);
    }

    // Cast
    for (const actor of splitField(row.cast)) {
      insertActor.run(actor);
      const actorRow = getActorId.get(actor);
      insertTitleCast.run(titleId, actorRow.id);
    }
  }
});

try {
  insertAll();
  console.log('Data inserted successfully.');
} catch (err) {
  console.error('Error inserting data:', err.message);
  process.exit(1);
}

console.log('Creating indexes...');
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_titles_type ON titles(type);
  CREATE INDEX IF NOT EXISTS idx_titles_release_year ON titles(release_year);
  CREATE INDEX IF NOT EXISTS idx_titles_rating ON titles(rating);
  CREATE INDEX IF NOT EXISTS idx_titles_date_added ON titles(date_added);
  CREATE INDEX IF NOT EXISTS idx_titles_director ON titles(director);
  CREATE INDEX IF NOT EXISTS idx_title_genres_genre ON title_genres(genre_id);
  CREATE INDEX IF NOT EXISTS idx_title_genres_title ON title_genres(title_id);
  CREATE INDEX IF NOT EXISTS idx_title_countries_country ON title_countries(country_id);
  CREATE INDEX IF NOT EXISTS idx_title_countries_title ON title_countries(title_id);
  CREATE INDEX IF NOT EXISTS idx_title_cast_actor ON title_cast(actor_id);
  CREATE INDEX IF NOT EXISTS idx_title_cast_title ON title_cast(title_id);
`);

// Print summary
const totalTitles = db.prepare('SELECT COUNT(*) as c FROM titles').get().c;
const totalGenres = db.prepare('SELECT COUNT(*) as c FROM genres').get().c;
const totalCountries = db.prepare('SELECT COUNT(*) as c FROM countries').get().c;
const totalActors = db.prepare('SELECT COUNT(*) as c FROM actors').get().c;

console.log(`\nSeed complete:`);
console.log(`  Titles:    ${totalTitles}`);
console.log(`  Genres:    ${totalGenres}`);
console.log(`  Countries: ${totalCountries}`);
console.log(`  Actors:    ${totalActors}`);

db.close();
