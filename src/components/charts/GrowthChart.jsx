import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import ChartContainer from '../ui/ChartContainer';
import { useApi } from '../../hooks/useApi';
import { api } from '../../services/api';
import { CHART_COLORS, getMonthName } from '../../utils/formatters';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-netflix-black/95 border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-netflix-white font-mono text-sm mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function GrowthChart({ filters }) {
  const [viewMode, setViewMode] = useState('cumulative');
  const { data, loading, error, refetch } = useApi(api.getGrowth, { type: filters.type || undefined });

  const chartData = useMemo(() => {
    if (!data) return [];
    // Aggregate by year for cleaner view
    const yearMap = new Map();
    for (const row of data) {
      if (!yearMap.has(row.year)) {
        yearMap.set(row.year, { year: row.year, movies: 0, tvShows: 0, total: 0, cumulative: 0 });
      }
      const y = yearMap.get(row.year);
      y.movies += row.movies;
      y.tvShows += row.tvShows;
      y.total += row.total;
    }
    let cumulative = 0;
    const sorted = Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
    return sorted.map(row => {
      cumulative += row.total;
      return { ...row, cumulative, label: row.year.toString() };
    });
  }, [data]);

  return (
    <ChartContainer
      chapter={2}
      title="The Rise of Streaming Content"
      subtitle="Netflix's library didn't grow gradually — it exploded. From 2015 to 2022, the platform added content at an accelerating pace, with movies consistently outpacing TV shows by nearly 2:1."
      loading={loading}
      error={error}
      onRetry={refetch}
    >
      <div className="flex gap-2 mb-6">
        {['cumulative', 'yearly'].map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
              viewMode === mode
                ? 'bg-netflix-red text-white'
                : 'bg-white/5 text-netflix-light-gray hover:bg-white/10'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="movieGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.movie} stopOpacity={0.4} />
              <stop offset="100%" stopColor={CHART_COLORS.movie} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="tvGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.tvShow} stopOpacity={0.4} />
              <stop offset="100%" stopColor={CHART_COLORS.tvShow} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          <XAxis
            dataKey="label"
            tick={{ fill: CHART_COLORS.text, fontSize: 12, fontFamily: 'JetBrains Mono' }}
            stroke={CHART_COLORS.grid}
          />
          <YAxis
            tick={{ fill: CHART_COLORS.text, fontSize: 12, fontFamily: 'JetBrains Mono' }}
            stroke={CHART_COLORS.grid}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontFamily: 'Inter', fontSize: 12, color: CHART_COLORS.text }}
          />
          {viewMode === 'cumulative' ? (
            <Area
              type="monotone"
              dataKey="cumulative"
              name="Total Titles"
              stroke={CHART_COLORS.primary}
              fill="url(#movieGrad)"
              strokeWidth={2}
              animationDuration={2000}
            />
          ) : (
            <>
              <Area
                type="monotone"
                dataKey="movies"
                name="Movies"
                stroke={CHART_COLORS.movie}
                fill="url(#movieGrad)"
                strokeWidth={2}
                stackId="1"
                animationDuration={1500}
              />
              <Area
                type="monotone"
                dataKey="tvShows"
                name="TV Shows"
                stroke={CHART_COLORS.tvShow}
                fill="url(#tvGrad)"
                strokeWidth={2}
                stackId="1"
                animationDuration={1500}
                animationBegin={300}
              />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
