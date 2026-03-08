import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Seed for reproducibility
let seed = 42;
function random() {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}
function randInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function pickN(arr, n) {
  const shuffled = arr.slice().sort(() => random() - 0.5);
  return shuffled.slice(0, n);
}
function weightedPick(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

// --- Directors (60) ---
const directors = [
  "James Chen", "Sofia Alvarez", "Raj Patel", "Marie Dubois", "Takeshi Yamamoto",
  "Elena Rossi", "David Kim", "Amara Okafor", "Carlos Mendez", "Ingrid Larsson",
  "Yuki Tanaka", "Priya Sharma", "Lucas Fernandez", "Hana Park", "Omar Hassan",
  "Nina Petrova", "Gabriel Santos", "Fatima Al-Rashid", "Thomas Weber", "Aiko Nakamura",
  "Roberto Vega", "Chloe Martin", "Sanjay Gupta", "Lena Fischer", "Diego Morales",
  "Anya Volkov", "Marcus Johnson", "Mei Lin", "Alejandro Cruz", "Sarah O'Brien",
  "Vikram Singh", "Isabelle Laurent", "Kenji Watanabe", "Nadia Benali", "Patrick Sullivan",
  "Zara Ahmed", "Henrik Andersen", "Lucia Romero", "Arjun Reddy", "Eva Lindqvist",
  "Rafael Torres", "Yuna Kim", "Michael Okonkwo", "Clara Hoffman", "Daisuke Ito",
  "Amina Diallo", "Stefan Mueller", "Rosa Gutierrez", "Kofi Mensah", "Astrid Johansson",
  "Paulo Costa", "Ji-Yeon Lee", "Nathaniel Brooks", "Simone Bianchi", "Ravi Kapoor",
  "Freya Nielsen", "Victor Popov", "Carmen Silva", "Tariq Mahmoud", "Elise Moreau"
];

// Make some directors prolific (appear more often)
const directorWeights = directors.map((d, i) => {
  if (i < 5) return 8;   // top 5 directors appear ~8x more
  if (i < 15) return 4;  // next 10 appear ~4x more
  if (i < 30) return 2;  // next 15 appear ~2x more
  return 1;
});

// --- Actors (120) ---
const actors = [
  "Emma Rodriguez", "Liam Nakamura", "Priya Desai", "Chris O'Malley", "Yuki Sato",
  "Aisha Johnson", "Marco Bianchi", "Soo-Jin Park", "David Okafor", "Isabella Santos",
  "Raj Mehta", "Sophie Laurent", "Kenji Mori", "Fatima Hassan", "Lucas Andersson",
  "Amara Williams", "Carlos Gutierrez", "Mei Chen", "Thomas Fischer", "Zara Khan",
  "Gabriel Torres", "Nina Petrova", "Alejandro Reyes", "Chloe Dubois", "Vikram Sharma",
  "Elena Popova", "Marcus Campbell", "Hana Yoshida", "Omar Diallo", "Ingrid Berg",
  "Sanjay Patel", "Rosa Fernandez", "Daisuke Ito", "Nadia Ali", "Patrick Murphy",
  "Yuna Lee", "Roberto Mendez", "Anya Sokolova", "Michael Adeyemi", "Clara Weber",
  "Arjun Singh", "Lucia Morales", "Henrik Larsen", "Simone Costa", "Kofi Asante",
  "Eva Lindberg", "Rafael Silva", "Ji-Hye Kim", "Nathaniel Foster", "Astrid Nilsen",
  "Paulo Oliveira", "Freya Hansen", "Victor Kozlov", "Carmen Vega", "Tariq Rahman",
  "Elise Moreau", "Stefan Richter", "Amina Traore", "Ravi Kapoor", "Sarah Mitchell",
  "Diego Cruz", "Lena Mueller", "Takeshi Honda", "Isabelle Martin", "Kwame Owusu",
  "Maja Johansson", "Felix Hoffman", "Priyanka Reddy", "Daniel Brooks", "Yoko Tanaka",
  "Ahmed El-Sayed", "Valentina Rossi", "James Park", "Olga Ivanova", "Samuel Obi",
  "Anna Schmidt", "Luis Herrera", "Mina Aoki", "Christopher Lee", "Fatou Sow",
  "Erik Svensson", "Gabriela Ramos", "Hiroshi Yamada", "Leila Benoit", "Ryan O'Connor",
  "Sunita Rao", "Pierre Lefevre", "Chiara Colombo", "Jamal Washington", "Katarina Novak",
  "Andres Vargas", "Sakura Kimura", "Benjamin Hayes", "Zainab Osman", "Matteo Ricci",
  "Helga Braun", "Ryu Watanabe", "Adaeze Nwosu", "Oscar Lindgren", "Layla Hadid",
  "Tomas Novotny", "Deepika Iyer", "Sean Fitzgerald", "Mi-Young Choi", "Antonio Perez",
  "Karin Eriksson", "Emeka Eze", "Julia Schneider", "Haruto Suzuki", "Amelia Wright",
  "Ivan Petrov", "Camila Rojas", "Leo Magnusson", "Anika Das", "William Chen",
  "Blessing Okafor", "Marie Jorgensen", "Raul Castillo", "Yumiko Hayashi", "Grace Mensah"
];

// Make some actors prolific
const actorWeights = actors.map((a, i) => {
  if (i < 8) return 10;
  if (i < 20) return 5;
  if (i < 40) return 3;
  return 1;
});

function pickWeightedActor() {
  return weightedPick(actors, actorWeights);
}

// --- Countries ---
const countries = [
  { name: "United States", weight: 25 },
  { name: "India", weight: 25 },
  { name: "United Kingdom", weight: 10 },
  { name: "South Korea", weight: 5 },
  { name: "Japan", weight: 4 },
  { name: "Canada", weight: 3 },
  { name: "France", weight: 3 },
  { name: "Spain", weight: 3 },
  { name: "Germany", weight: 2.5 },
  { name: "Brazil", weight: 2.5 },
  { name: "Nigeria", weight: 2 },
  { name: "Mexico", weight: 2 },
  { name: "Australia", weight: 1.5 },
  { name: "Turkey", weight: 1.5 },
  { name: "Thailand", weight: 1 },
  { name: "Argentina", weight: 1 },
  { name: "Colombia", weight: 1 },
  { name: "Philippines", weight: 0.8 },
  { name: "Italy", weight: 0.8 },
  { name: "Egypt", weight: 0.7 },
  { name: "Indonesia", weight: 0.7 },
  { name: "Sweden", weight: 0.5 },
  { name: "Norway", weight: 0.4 },
  { name: "Denmark", weight: 0.4 },
  { name: "Poland", weight: 0.4 },
  { name: "China", weight: 0.4 },
  { name: "Taiwan", weight: 0.3 },
  { name: "South Africa", weight: 0.3 },
  { name: "Israel", weight: 0.3 },
  { name: "Belgium", weight: 0.2 },
  { name: "Netherlands", weight: 0.2 },
  { name: "Singapore", weight: 0.2 },
  { name: "Malaysia", weight: 0.2 },
  { name: "Ghana", weight: 0.2 },
  { name: "Kenya", weight: 0.2 },
  { name: "Czech Republic", weight: 0.15 },
  { name: "Portugal", weight: 0.15 },
  { name: "Chile", weight: 0.15 },
  { name: "Peru", weight: 0.1 },
  { name: "New Zealand", weight: 0.1 },
  { name: "Ireland", weight: 0.1 },
  { name: "Romania", weight: 0.1 },
  { name: "Vietnam", weight: 0.1 },
  { name: "Pakistan", weight: 0.1 },
  { name: "Bangladesh", weight: 0.1 },
];
const countryNames = countries.map(c => c.name);
const countryWeights = countries.map(c => c.weight);

// --- Genres ---
const movieGenres = [
  "International Movies", "Dramas", "Comedies", "Action & Adventure",
  "Documentaries", "Children & Family Movies", "Horror Movies",
  "Romantic Movies", "Sci-Fi & Fantasy", "Thrillers",
  "Stand-Up Comedy", "Anime Features"
];
const tvGenres = [
  "International TV Shows", "Crime TV Shows", "TV Dramas",
  "TV Comedies", "Reality TV", "Docuseries", "Kids' TV", "Korean TV Shows"
];

// --- Ratings ---
const movieRatings = ["R", "PG-13", "PG", "TV-MA", "TV-14", "TV-PG"];
const movieRatingWeights = [15, 15, 8, 25, 20, 10];
const tvRatings = ["TV-MA", "TV-14", "TV-PG", "TV-Y", "TV-Y7"];
const tvRatingWeights = [35, 30, 18, 5, 4];

// --- Title generation ---
const adjectives = [
  "Dark", "Silent", "Lost", "Broken", "Hidden", "Last", "First", "Endless",
  "Frozen", "Wild", "Burning", "Crimson", "Golden", "Silver", "Bitter",
  "Sweet", "Savage", "Sacred", "Fallen", "Rising", "Twisted", "Shattered",
  "Hollow", "Fading", "Eternal", "Midnight", "Scarlet", "Iron", "Glass",
  "Velvet", "Neon", "Pale", "Bright", "Deep", "Lonely", "Restless",
  "Wicked", "Gentle", "Fierce", "Strange", "Ancient", "Modern", "Digital",
  "Urban", "Rural", "Coastal", "Northern", "Southern", "Eastern", "Western"
];
const nouns = [
  "Heart", "Shadow", "Storm", "River", "Dream", "Truth", "Secret",
  "Promise", "Memory", "Journey", "Kingdom", "Empire", "Garden", "Bridge",
  "Mirror", "Flame", "Ocean", "Mountain", "Forest", "Desert", "City",
  "Village", "House", "Door", "Road", "Path", "Light", "Darkness",
  "Thunder", "Rain", "Snow", "Wind", "Fire", "Earth", "Sky", "Star",
  "Moon", "Sun", "Dawn", "Dusk", "Night", "Day", "Season", "Year",
  "World", "Soul", "Mind", "Spirit", "Voice", "Song"
];
const titlePatterns = [
  () => `The ${pick(adjectives)} ${pick(nouns)}`,
  () => `${pick(adjectives)} ${pick(nouns)}s`,
  () => `${pick(nouns)} of ${pick(nouns)}s`,
  () => `The ${pick(nouns)} ${pick(nouns)}`,
  () => `${pick(adjectives)} ${pick(nouns)} ${pick(nouns)}`,
  () => `A ${pick(adjectives)} ${pick(nouns)}`,
  () => `${pick(nouns)}s and ${pick(nouns)}s`,
  () => `The Last ${pick(nouns)}`,
  () => `Beyond the ${pick(nouns)}`,
  () => `${pick(nouns)} in the ${pick(adjectives)} ${pick(nouns)}`,
  () => `${pick(adjectives)}`,
  () => `${pick(nouns)}`,
  () => `${pick(nouns)} ${pick(nouns)}`,
  () => `My ${pick(adjectives)} ${pick(nouns)}`,
  () => `The ${pick(nouns)} Diaries`,
  () => `Project ${pick(nouns)}`,
  () => `Operation ${pick(adjectives)} ${pick(nouns)}`,
  () => `${pick(adjectives)} Waters`,
  () => `When ${pick(nouns)}s Fall`,
  () => `Into the ${pick(nouns)}`,
];

const usedTitles = new Set();
function generateTitle() {
  let attempts = 0;
  while (attempts < 100) {
    const title = pick(titlePatterns)();
    if (!usedTitles.has(title)) {
      usedTitles.add(title);
      return title;
    }
    attempts++;
  }
  // Fallback: append a number
  const base = pick(titlePatterns)();
  const unique = `${base} ${randInt(2, 99)}`;
  usedTitles.add(unique);
  return unique;
}

// --- Description templates ---
const descTemplates = [
  (type) => `A ${pick(["young", "determined", "troubled", "brilliant", "reluctant"])} ${pick(["detective", "teacher", "doctor", "artist", "journalist", "lawyer", "scientist", "chef", "musician", "entrepreneur"])} ${pick(["must confront", "discovers", "struggles with", "is drawn into", "navigates"])} ${pick(["a dark secret", "an unexpected truth", "a dangerous conspiracy", "a life-changing opportunity", "a mysterious past"])} in this ${pick(["gripping", "heartfelt", "intense", "compelling", "riveting"])} ${type === "Movie" ? "film" : "series"}.`,
  (type) => `When ${pick(["a family reunion", "a chance encounter", "a sudden tragedy", "an old letter", "a strange discovery"])} ${pick(["upends everything", "changes their lives", "reveals hidden truths", "forces difficult choices", "brings old wounds to light"])}, ${pick(["two strangers", "a group of friends", "estranged siblings", "unlikely allies", "a small community"])} must ${pick(["find common ground", "fight for survival", "uncover the truth", "rebuild their lives", "face their fears"])}.`,
  (type) => `In ${pick(["a bustling city", "a remote village", "a war-torn country", "a prestigious academy", "a quiet suburb", "a futuristic world"])}, ${pick(["an unlikely hero", "a seasoned professional", "a curious outsider", "a former champion", "a misunderstood loner"])} ${pick(["embarks on", "is thrust into", "reluctantly joins", "leads"])} ${pick(["a quest for justice", "an adventure of a lifetime", "a dangerous mission", "a journey of self-discovery", "a race against time"])}.`,
  (type) => `This ${pick(["award-winning", "critically acclaimed", "thought-provoking", "visually stunning", "emotionally charged"])} ${type === "Movie" ? "film" : "series"} ${pick(["explores", "examines", "delves into", "sheds light on", "chronicles"])} ${pick(["the complexities of modern love", "the bonds of family", "the pursuit of dreams", "the weight of tradition", "the cost of ambition", "life in a changing world"])}.`,
  (type) => `${pick(["After years abroad", "Following a devastating loss", "With nothing left to lose", "Armed with a dangerous secret", "Haunted by the past"])}, ${pick(["a woman", "a man", "a teenager", "a retired agent", "a single parent"])} ${pick(["returns home to", "travels to", "escapes to", "arrives in"])} ${pick(["confront unfinished business", "start a new life", "solve an old mystery", "protect loved ones", "seek redemption"])}.`,
  (type) => `${pick(["Friendship", "Love", "Loyalty", "Ambition", "Courage"])} is tested when ${pick(["secrets surface", "danger strikes", "worlds collide", "alliances shift", "the stakes are raised"])} in this ${pick(["captivating", "suspenseful", "touching", "darkly comic", "poignant"])} ${type === "Movie" ? "drama" : "series"}.`,
];

// --- Date generation with growth and seasonal patterns ---
function generateDateAdded() {
  // Exponential-ish growth: more titles in later years
  const yearWeights = {
    2015: 3, 2016: 5, 2017: 8, 2018: 12, 2019: 18,
    2020: 22, 2021: 28, 2022: 32, 2023: 20
  };
  const years = Object.keys(yearWeights).map(Number);
  const weights = Object.values(yearWeights);
  const year = weightedPick(years, weights);

  // Seasonal pattern: peaks in Dec, Jan, Jul
  const monthWeights = [12, 10, 7, 7, 6, 8, 11, 8, 8, 9, 10, 14]; // Jan-Dec
  const monthIndex = weightedPick([0,1,2,3,4,5,6,7,8,9,10,11], monthWeights);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const day = randInt(1, daysInMonth[monthIndex]);

  return `${monthNames[monthIndex]} ${day}, ${year}`;
}

function generateReleaseYear(dateAdded) {
  const addedYear = parseInt(dateAdded.split(', ')[1]);
  // Most titles released same year or 1-2 years before added
  // Some older titles
  const ageWeights = [30, 25, 15, 8, 5, 4, 3, 2, 1, 1, 1, 1, 1, 1, 0.5, 0.5];
  const age = weightedPick(
    Array.from({length: 16}, (_, i) => i),
    ageWeights
  );
  const releaseYear = Math.max(1990, addedYear - age);
  return releaseYear;
}

// --- CSV escaping ---
function csvField(value) {
  if (value === null || value === undefined || value === '') return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// --- Main generation ---
function generateRows(count) {
  const rows = [];

  for (let i = 1; i <= count; i++) {
    const showId = `s${i}`;
    const isMovie = random() < 0.70;
    const type = isMovie ? "Movie" : "TV Show";
    const title = generateTitle();

    // Director: ~15% chance of empty for movies, ~25% for TV
    let director = '';
    if (random() > (isMovie ? 0.15 : 0.25)) {
      director = weightedPick(directors, directorWeights);
    }

    // Cast: 2-5 actors
    const numActors = randInt(2, 5);
    const castSet = new Set();
    while (castSet.size < numActors) {
      castSet.add(pickWeightedActor());
    }
    const cast = Array.from(castSet).join(', ');

    // Country
    const numCountries = random() < 0.85 ? 1 : randInt(2, 3);
    const countrySet = new Set();
    while (countrySet.size < numCountries) {
      countrySet.add(weightedPick(countryNames, countryWeights));
    }
    const country = Array.from(countrySet).join(', ');

    const dateAdded = generateDateAdded();
    const releaseYear = generateReleaseYear(dateAdded);

    // Rating
    let rating;
    if (isMovie) {
      rating = weightedPick(movieRatings, movieRatingWeights);
    } else {
      rating = weightedPick(tvRatings, tvRatingWeights);
    }

    // Duration
    let duration;
    if (isMovie) {
      // Normal-ish distribution around 100 min
      const base = 100;
      const offset = Math.round((random() + random() + random() - 1.5) * 50);
      duration = `${Math.max(70, Math.min(210, base + offset))} min`;
    } else {
      const seasons = weightedPick(
        [1, 2, 3, 4, 5, 6, 7, 8],
        [40, 25, 12, 8, 5, 4, 3, 3]
      );
      duration = seasons === 1 ? "1 Season" : `${seasons} Seasons`;
    }

    // Genres
    const numGenres = weightedPick([1, 2, 3], [20, 50, 30]);
    const genrePool = isMovie ? movieGenres : tvGenres;
    const genreSet = new Set();
    // If country is non-English, likely "International"
    const isInternational = !["United States", "United Kingdom", "Canada", "Australia", "New Zealand", "Ireland"].some(c => country.includes(c));
    if (isInternational && random() < 0.6) {
      genreSet.add(isMovie ? "International Movies" : "International TV Shows");
    }
    if (country.includes("South Korea") && !isMovie && random() < 0.7) {
      genreSet.add("Korean TV Shows");
    }
    while (genreSet.size < numGenres) {
      genreSet.add(pick(genrePool));
    }
    const listedIn = Array.from(genreSet).join(', ');

    // Description
    const description = pick(descTemplates)(type);

    rows.push([
      showId, type, title, director, cast, country, dateAdded,
      releaseYear, rating, duration, listedIn, description
    ].map(csvField).join(','));
  }

  return rows;
}

// Generate
const TOTAL_ROWS = 800;
console.log(`Generating ${TOTAL_ROWS} Netflix titles...`);

const header = 'show_id,type,title,director,cast,country,date_added,release_year,rating,duration,listed_in,description';
const rows = generateRows(TOTAL_ROWS);
const csv = [header, ...rows].join('\n');

const outputPath = path.join(__dirname, '..', 'data', 'netflix_titles.csv');
fs.writeFileSync(outputPath, csv, 'utf8');

console.log(`CSV written to ${outputPath}`);
console.log(`Total rows: ${rows.length}`);

// Print some stats
const lines = rows.map(r => {
  // Quick parse to get type
  const match = r.match(/^s\d+,(Movie|TV Show),/);
  return match ? match[1] : 'Unknown';
});
const movies = lines.filter(t => t === 'Movie').length;
const tvShows = lines.filter(t => t === 'TV Show').length;
console.log(`Movies: ${movies} (${(movies/rows.length*100).toFixed(1)}%)`);
console.log(`TV Shows: ${tvShows} (${(tvShows/rows.length*100).toFixed(1)}%)`);
