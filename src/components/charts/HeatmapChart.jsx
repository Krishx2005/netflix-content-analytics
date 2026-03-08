import React, { useMemo } from 'react';
import ChartContainer from '../ui/ChartContainer';
import { useApi } from '../../hooks/useApi';
import { api } from '../../services/api';
import { getMonthName } from '../../utils/formatters';
import { motion } from 'framer-motion';

export default function HeatmapChart() {
  const { data, loading, error, refetch } = useApi(api.getHeatmap);

  const { grid, years, maxCount } = useMemo(() => {
    if (!data) return { grid: [], years: [], maxCount: 0 };

    const yearSet = new Set();
    const gridMap = new Map();
    let maxC = 0;

    for (const row of data) {
      yearSet.add(row.year);
      const key = `${row.year}-${row.month}`;
      gridMap.set(key, row.count);
      if (row.count > maxC) maxC = row.count;
    }

    const sortedYears = Array.from(yearSet).sort((a, b) => a - b);
    const gridData = [];

    for (let m = 1; m <= 12; m++) {
      for (const y of sortedYears) {
        const key = `${y}-${m}`;
        gridData.push({
          year: y,
          month: m,
          count: gridMap.get(key) || 0,
        });
      }
    }

    return { grid: gridData, years: sortedYears, maxCount: maxC };
  }, [data]);

  function getColor(count) {
    if (count === 0) return '#1a1a1a';
    const intensity = count / maxCount;
    if (intensity < 0.25) return '#3d0c10';
    if (intensity < 0.5) return '#6b1018';
    if (intensity < 0.75) return '#a0131d';
    return '#E50914';
  }

  const cellSize = Math.min(50, Math.max(28, 700 / years.length));
  const gap = 3;

  return (
    <ChartContainer
      title="When Does Netflix Release?"
      subtitle="Release patterns reveal a clear seasonal strategy — content drops peak in December and January, aligning with holiday viewership. July sees another spike as summer audiences seek new entertainment, while spring months are notably quieter."
      loading={loading}
      error={error}
      onRetry={refetch}
    >
      <div className="overflow-x-auto">
        <div className="inline-block min-w-[500px]">
          {/* Year labels */}
          <div className="flex mb-1" style={{ marginLeft: 42 }}>
            {years.map(y => (
              <div
                key={y}
                className="text-xs text-netflix-gray font-mono text-center"
                style={{ width: cellSize + gap }}
              >
                {y.toString().slice(-2)}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {Array.from({ length: 12 }, (_, m) => m + 1).map(month => (
            <div key={month} className="flex items-center">
              <div className="w-10 text-xs text-netflix-gray font-mono text-right pr-2">
                {getMonthName(month)}
              </div>
              <div className="flex" style={{ gap }}>
                {years.map((year, yi) => {
                  const cell = grid.find(c => c.year === year && c.month === month);
                  const count = cell?.count || 0;
                  return (
                    <motion.div
                      key={`${year}-${month}`}
                      initial={{ opacity: 0, scale: 0.3 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (month * years.length + yi) * 0.008, duration: 0.3 }}
                      className="rounded-sm cursor-pointer transition-all hover:ring-1 hover:ring-white/30 group relative"
                      style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: getColor(count),
                      }}
                      title={`${getMonthName(month)} ${year}: ${count} titles`}
                    >
                      {count > 0 && cellSize >= 32 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white/60 group-hover:text-white/90">
                          {count}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-end mt-4 gap-2">
            <span className="text-xs text-netflix-gray font-mono">Less</span>
            {['#1a1a1a', '#3d0c10', '#6b1018', '#a0131d', '#E50914'].map((c, i) => (
              <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: c }} />
            ))}
            <span className="text-xs text-netflix-gray font-mono">More</span>
          </div>
        </div>
      </div>
    </ChartContainer>
  );
}
