// Use VITE_API_URL if set (production pointing to Render backend),
// otherwise fall back to local proxy in development.
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

async function fetchApi(endpoint, params = {}) {
  const url = new URL(`${API_BASE}${endpoint}`, window.location.origin);

  // If API_BASE is an absolute URL (Render), use it directly
  const isAbsolute = API_BASE.startsWith('http');
  const fetchUrl = isAbsolute
    ? new URL(`${API_BASE}${endpoint}`)
    : url;

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      fetchUrl.searchParams.set(key, value);
    }
  });

  const response = await fetch(fetchUrl.toString());
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
