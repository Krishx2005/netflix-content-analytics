export function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function getMonthName(monthNum) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthNum - 1] || '';
}

export function getRatingColor(rating) {
  const colors = {
    'TV-MA': '#E50914',
    'R': '#E50914',
    'TV-14': '#f97316',
    'PG-13': '#f97316',
    'TV-PG': '#eab308',
    'PG': '#eab308',
    'TV-Y7': '#22c55e',
    'TV-Y': '#22c55e',
    'TV-G': '#22c55e',
    'G': '#22c55e',
    'NR': '#808080',
    'UR': '#808080',
  };
  return colors[rating] || '#808080';
}

export const NETFLIX_COLORS = [
  '#E50914', '#B81D24', '#F5F5F1', '#808080',
  '#e87c03', '#f5a623', '#46d369', '#2196F3',
  '#9C27B0', '#FF5722', '#00BCD4', '#4CAF50'
];

export const CHART_COLORS = {
  primary: '#E50914',
  secondary: '#e87c03',
  tertiary: '#46d369',
  quaternary: '#2196F3',
  movie: '#E50914',
  tvShow: '#e87c03',
  grid: '#333333',
  text: '#b3b3b3',
  background: '#1a1a1a',
};
