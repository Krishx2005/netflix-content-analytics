const IS_PROD = import.meta.env.PROD;
const API_BASE = '/api';
const DATA_BASE = '/data';

async function fetchApi(endpoint, params = {}) {
  if (IS_PROD) {
    // In production, fetch pre-built static JSON
    const name = endpoint.replace('/', '');
    const response = await fetch(`${DATA_BASE}/${name}.json`);
    if (!response.ok) throw new Error(`Failed to load ${name} data`);
    return response.json();
  }

  // In development, use the Express API
  const url = new URL(endpoint, window.location.origin);
  url.pathname = `${API_BASE}${endpoint}`;
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.pathname + url.search);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  getStats: () => fetchApi('/stats'),
  getGrowth: (params) => fetchApi('/growth', params),
  getCountries: () => fetchApi('/countries'),
  getGenres: (params) => fetchApi('/genres', params),
  getRatings: (params) => fetchApi('/ratings', params),
  getDirectors: (params) => fetchApi('/directors', params),
  getActors: (params) => fetchApi('/actors', params),
  getHeatmap: () => fetchApi('/heatmap'),
  getNetwork: () => fetchApi('/network'),
  getContent: (params) => fetchApi('/content', params),
  getFilters: () => fetchApi('/filters'),
};
