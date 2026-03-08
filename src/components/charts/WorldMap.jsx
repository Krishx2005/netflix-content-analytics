import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import ChartContainer from '../ui/ChartContainer';
import { useApi } from '../../hooks/useApi';
import { api } from '../../services/api';

// Country name mapping for matching dataset countries to GeoJSON names
const COUNTRY_NAME_MAP = {
  'United States': 'United States of America',
  'South Korea': 'Korea',
  'United Kingdom': 'United Kingdom',
  'Czech Republic': 'Czechia',
};

export default function WorldMap() {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });
  const { data, loading, error, refetch } = useApi(api.getCountries);
  const [geoData, setGeoData] = useState(null);

  // Load world GeoJSON
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(res => res.json())
      .then(topology => {
        const countries = feature(topology, topology.objects.countries);
        setGeoData(countries);
      })
      .catch(() => {
        // Fallback: try alternative URL
        fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json')
          .then(res => res.json())
          .then(topology => {
            const countries = feature(topology, topology.objects.countries);
            setGeoData(countries);
          });
      });
  }, []);

  // Responsive sizing
  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (!container) return;
    const observer = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setDimensions({ width: Math.max(300, width), height: Math.max(200, width * 0.55) });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Render map
  useEffect(() => {
    if (!geoData || !data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Build country -> count lookup
    const countryMap = new Map();
    for (const row of data) {
      const mapped = COUNTRY_NAME_MAP[row.country] || row.country;
      countryMap.set(mapped, row);
      countryMap.set(row.country, row);
    }

    const maxCount = Math.max(...data.map(d => d.count));
    const colorScale = d3.scaleSequential()
      .domain([0, maxCount])
      .interpolator(d3.interpolate('#1a1a1a', '#E50914'));

    const projection = d3.geoNaturalEarth1()
      .fitSize([width - 20, height - 20], geoData)
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    const tooltip = d3.select(tooltipRef.current);

    // Draw countries
    svg.append('g')
      .selectAll('path')
      .data(geoData.features)
      .join('path')
      .attr('d', pathGenerator)
      .attr('fill', d => {
        const name = d.properties.name;
        const entry = countryMap.get(name);
        return entry ? colorScale(entry.count) : '#222';
      })
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .style('cursor', d => countryMap.get(d.properties.name) ? 'pointer' : 'default')
      .on('mouseenter', (event, d) => {
        const name = d.properties.name;
        const entry = countryMap.get(name);
        if (!entry) return;
        d3.select(event.target).attr('stroke', '#E50914').attr('stroke-width', 2);
        tooltip
          .style('opacity', 1)
          .html(`
            <div class="font-mono text-sm font-bold text-netflix-white">${entry.country}</div>
            <div class="text-sm text-netflix-light-gray mt-1">
              <div>${entry.count} titles</div>
              <div>${entry.movies} movies / ${entry.tvShows} TV shows</div>
            </div>
          `);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', (event.offsetX + 15) + 'px')
          .style('top', (event.offsetY - 10) + 'px');
      })
      .on('mouseleave', (event) => {
        d3.select(event.target).attr('stroke', '#333').attr('stroke-width', 0.5);
        tooltip.style('opacity', 0);
      });

    // Legend
    const legendWidth = 200;
    const legendHeight = 10;
    const legend = svg.append('g')
      .attr('transform', `translate(${width - legendWidth - 30}, ${height - 30})`);

    const legendScale = d3.scaleLinear().domain([0, maxCount]).range([0, legendWidth]);

    const legendGradient = svg.append('defs').append('linearGradient')
      .attr('id', 'map-legend-gradient');
    legendGradient.append('stop').attr('offset', '0%').attr('stop-color', '#1a1a1a');
    legendGradient.append('stop').attr('offset', '100%').attr('stop-color', '#E50914');

    legend.append('rect')
      .attr('width', legendWidth).attr('height', legendHeight)
      .attr('rx', 3)
      .style('fill', 'url(#map-legend-gradient)');

    legend.append('text').attr('y', -4).attr('fill', '#808080')
      .attr('font-size', 10).attr('font-family', 'JetBrains Mono').text('0');
    legend.append('text').attr('x', legendWidth).attr('y', -4)
      .attr('text-anchor', 'end').attr('fill', '#808080')
      .attr('font-size', 10).attr('font-family', 'JetBrains Mono').text(maxCount);

  }, [geoData, data, dimensions]);

  const mapLoading = loading || !geoData;

  return (
    <ChartContainer
      chapter={3}
      title="Content Without Borders"
      subtitle="The United States and India dominate Netflix's library, together accounting for nearly half of all content. But the platform's true strength lies in its geographic breadth — content from 40+ countries, making it the world's most diverse streaming library."
      loading={mapLoading}
      error={error}
      onRetry={refetch}
    >
      <div className="relative w-full overflow-hidden rounded-lg">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="w-full h-auto"
        />
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none bg-netflix-black/95 border border-white/10 rounded-lg p-3 shadow-xl opacity-0 transition-opacity z-10"
          style={{ maxWidth: 220 }}
        />
      </div>

      {/* Top countries bar */}
      {data && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {data.slice(0, 5).map((c, i) => (
            <div key={c.country} className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-lg font-bold font-mono text-netflix-white">{c.count}</div>
              <div className="text-xs text-netflix-light-gray truncate">{c.country}</div>
            </div>
          ))}
        </div>
      )}
    </ChartContainer>
  );
}
