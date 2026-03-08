import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import ChartContainer from '../ui/ChartContainer';
import { useApi } from '../../hooks/useApi';
import { api } from '../../services/api';
import { getRatingColor, CHART_COLORS } from '../../utils/formatters';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-netflix-black/95 border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-netflix-white font-mono text-sm font-bold mb-1">{d.rating}</p>
      <p className="text-sm text-netflix-light-gray">Total: <span className="text-white font-bold">{d.count}</span></p>
      <p className="text-sm text-netflix-light-gray">Movies: {d.movies} | TV: {d.tvShows}</p>
    </div>
  );
}

// Rating maturity order
const RATING_ORDER = ['TV-Y', 'TV-Y7', 'G', 'TV-G', 'PG', 'TV-PG', 'PG-13', 'TV-14', 'R', 'TV-MA', 'NR', 'UR'];

export default function RatingChart({ filters }) {
  const { data, loading, error, refetch } = useApi(api.getRatings);

  const sortedData = React.useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const ai = RATING_ORDER.indexOf(a.rating);
      const bi = RATING_ORDER.indexOf(b.rating);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [data]);

  return (
    <ChartContainer
      chapter={5}
      title="A Mature Audience Strategy"
      subtitle="Nearly a third of Netflix's library carries a TV-MA or R rating — a clear signal that the platform skews toward adult audiences. Family-friendly content makes up less than 10% of the catalog, an area where competitors like Disney+ have a distinct advantage."
      loading={loading}
      error={error}
      onRetry={refetch}
    >
      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={sortedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="rating"
            tick={{ fill: CHART_COLORS.text, fontSize: 12, fontFamily: 'JetBrains Mono' }}
            stroke={CHART_COLORS.grid}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tick={{ fill: CHART_COLORS.text, fontSize: 12, fontFamily: 'JetBrains Mono' }}
            stroke={CHART_COLORS.grid}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1200}>
            {sortedData.map((entry) => (
              <Cell key={entry.rating} fill={getRatingColor(entry.rating)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Maturity scale */}
      <div className="mt-6 flex items-center justify-center gap-1">
        <span className="text-xs text-netflix-gray font-mono mr-2">Family</span>
        <div className="flex gap-0.5">
          {['#22c55e', '#22c55e', '#eab308', '#eab308', '#f97316', '#E50914'].map((c, i) => (
            <div key={i} className="w-8 h-2 rounded-sm" style={{ backgroundColor: c, opacity: 0.7 }} />
          ))}
        </div>
        <span className="text-xs text-netflix-gray font-mono ml-2">Mature</span>
      </div>
    </ChartContainer>
  );
}
