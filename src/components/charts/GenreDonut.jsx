import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import ChartContainer from '../ui/ChartContainer';
import { useApi } from '../../hooks/useApi';
import { api } from '../../services/api';

const COLORS = [
  '#E50914', '#e87c03', '#46d369', '#2196F3', '#9C27B0',
  '#FF5722', '#00BCD4', '#4CAF50', '#FFC107', '#795548',
  '#607D8B', '#F44336', '#3F51B5', '#009688', '#CDDC39',
];

function renderActiveShape(props) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;

  return (
    <g>
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#e5e5e5" fontSize={16} fontFamily="Inter" fontWeight={600}>
        {payload.genre}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#b3b3b3" fontSize={13} fontFamily="JetBrains Mono">
        {value} titles ({(percent * 100).toFixed(1)}%)
      </text>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx} cy={cy}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.6}
      />
    </g>
  );
}

export default function GenreDonut({ filters }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [showType, setShowType] = useState('all');
  const { data, loading, error, refetch } = useApi(
    api.getGenres,
    { type: filters.type || undefined }
  );

  const chartData = useMemo(() => {
    if (!data) return [];
    return data
      .map(g => ({
        ...g,
        displayCount: showType === 'movies' ? g.movies
          : showType === 'tv' ? g.tvShows
          : g.count
      }))
      .filter(g => g.displayCount > 0)
      .slice(0, 12);
  }, [data, showType]);

  return (
    <ChartContainer
      chapter={4}
      title="What Netflix Bets On"
      subtitle="International Movies and Dramas make up the lion's share of Netflix's catalog — a deliberate strategy to appeal to global audiences. The platform's genre mix reveals a preference for drama-driven storytelling over pure action spectacle."
      loading={loading}
      error={error}
      onRetry={refetch}
    >
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all', label: 'All' },
          { key: 'movies', label: 'Movies' },
          { key: 'tv', label: 'TV Shows' },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => setShowType(opt.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
              showType === opt.key
                ? 'bg-netflix-red text-white'
                : 'bg-white/5 text-netflix-light-gray hover:bg-white/10'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="w-full lg:w-1/2" style={{ height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="78%"
                dataKey="displayCount"
                nameKey="genre"
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                animationDuration={1200}
                animationBegin={200}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.genre}
                    fill={COLORS[index % COLORS.length]}
                    stroke="transparent"
                    style={{ cursor: 'pointer', outline: 'none' }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend list */}
        <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {chartData.map((genre, i) => (
            <div
              key={genre.genre}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors cursor-pointer ${
                activeIndex === i ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm text-netflix-white truncate">{genre.genre}</div>
                <div className="text-xs text-netflix-gray font-mono">{genre.displayCount}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartContainer>
  );
}
