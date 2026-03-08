import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import ChartContainer from '../ui/ChartContainer';
import { useApi } from '../../hooks/useApi';
import { api } from '../../services/api';
import { CHART_COLORS } from '../../utils/formatters';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-netflix-black/95 border border-white/10 rounded-lg p-3 shadow-xl max-w-xs">
      <p className="text-netflix-white font-bold mb-1">{d.name}</p>
      <p className="text-sm text-netflix-light-gray mb-2">{d.count} titles</p>
      {d.titles?.slice(0, 5).map((t, i) => (
        <p key={i} className="text-xs text-netflix-gray">
          {t.title} ({t.year})
        </p>
      ))}
      {d.titles?.length > 5 && (
        <p className="text-xs text-netflix-gray mt-1">+{d.titles.length - 5} more</p>
      )}
    </div>
  );
}

export default function PeopleChart({ filters }) {
  const [activeTab, setActiveTab] = useState('directors');
  const { data: directors, loading: loadingDir, error: errorDir, refetch: refetchDir } = useApi(
    api.getDirectors, { limit: 12 }
  );
  const { data: actors, loading: loadingAct, error: errorAct, refetch: refetchAct } = useApi(
    api.getActors, { limit: 12 }
  );

  const isDirectors = activeTab === 'directors';
  const data = isDirectors ? directors : actors;
  const loading = isDirectors ? loadingDir : loadingAct;
  const error = isDirectors ? errorDir : errorAct;
  const refetch = isDirectors ? refetchDir : refetchAct;

  const chartData = (data || []).slice().reverse();

  return (
    <ChartContainer
      chapter={6}
      title="The Faces Behind the Catalog"
      subtitle="A handful of prolific directors and actors dominate Netflix's library. These repeat collaborators form the creative backbone of the platform, often specializing in international content that fuels Netflix's global strategy."
      loading={loading}
      error={error}
      onRetry={refetch}
    >
      <div className="flex gap-2 mb-6">
        {['directors', 'actors'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === tab
                ? 'bg-netflix-red text-white'
                : 'bg-white/5 text-netflix-light-gray hover:bg-white/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={Math.max(380, chartData.length * 36)}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
          <XAxis
            type="number"
            tick={{ fill: CHART_COLORS.text, fontSize: 12, fontFamily: 'JetBrains Mono' }}
            stroke={CHART_COLORS.grid}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: CHART_COLORS.text, fontSize: 11, fontFamily: 'Inter' }}
            width={130}
            stroke="transparent"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar
            dataKey="count"
            radius={[0, 6, 6, 0]}
            animationDuration={1200}
            barSize={24}
          >
            {chartData.map((entry, i) => (
              <Cell
                key={entry.name}
                fill={i >= chartData.length - 3 ? CHART_COLORS.primary : `rgba(229, 9, 20, ${0.3 + (i / chartData.length) * 0.7})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
