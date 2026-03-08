import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import ChartContainer from '../ui/ChartContainer';
import { useApi } from '../../hooks/useApi';
import { api } from '../../services/api';

export default function NetworkGraph() {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const { data, loading, error, refetch } = useApi(api.getNetwork);

  // Responsive sizing
  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (!container) return;
    const observer = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setDimensions({ width: Math.max(300, width), height: Math.max(350, Math.min(550, width * 0.65)) });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!data || !data.nodes?.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const tooltip = d3.select(tooltipRef.current);

    // Deep copy data for D3 mutation
    const nodes = data.nodes.map(n => ({ ...n }));
    const links = data.links.map(l => ({ ...l }));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(80).strength(0.3))
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => Math.sqrt(d.count) * 4 + 10));

    // Draw links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#444')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', d => Math.min(4, Math.sqrt(d.weight)));

    // Draw nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    node.append('circle')
      .attr('r', d => Math.sqrt(d.count) * 4 + 5)
      .attr('fill', d => d.type === 'director' ? '#E50914' : '#e87c03')
      .attr('stroke', d => d.type === 'director' ? '#ff4444' : '#ffaa44')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.85);

    node.append('text')
      .text(d => d.name.split(' ').pop())
      .attr('text-anchor', 'middle')
      .attr('dy', d => Math.sqrt(d.count) * 4 + 18)
      .attr('fill', '#b3b3b3')
      .attr('font-size', 9)
      .attr('font-family', 'Inter');

    // Interactions
    node.on('mouseenter', (event, d) => {
      // Highlight connected links
      link
        .attr('stroke-opacity', l =>
          l.source.id === d.id || l.target.id === d.id ? 0.9 : 0.1
        )
        .attr('stroke', l =>
          l.source.id === d.id || l.target.id === d.id ? '#E50914' : '#444'
        );

      // Highlight connected nodes
      const connectedIds = new Set();
      connectedIds.add(d.id);
      links.forEach(l => {
        if (l.source.id === d.id) connectedIds.add(l.target.id);
        if (l.target.id === d.id) connectedIds.add(l.source.id);
      });
      node.selectAll('circle')
        .attr('opacity', n => connectedIds.has(n.id) ? 1 : 0.15);

      // Connected titles
      const connectedLinks = links.filter(l => l.source.id === d.id || l.target.id === d.id);
      const titleSet = new Set();
      connectedLinks.forEach(l => l.titles?.forEach(t => titleSet.add(t)));

      tooltip
        .style('opacity', 1)
        .html(`
          <div class="font-bold text-netflix-white text-sm">${d.name}</div>
          <div class="text-xs text-netflix-light-gray mt-1">
            ${d.type === 'director' ? 'Director' : 'Actor'} &middot; ${d.count} titles
          </div>
          <div class="text-xs text-netflix-gray mt-1">
            ${connectedLinks.length} collaboration${connectedLinks.length !== 1 ? 's' : ''}
          </div>
          ${titleSet.size > 0 ? `<div class="text-xs text-netflix-gray mt-1 border-t border-white/10 pt-1 max-h-20 overflow-hidden">
            ${Array.from(titleSet).slice(0, 4).join(', ')}${titleSet.size > 4 ? '...' : ''}
          </div>` : ''}
        `);
    })
    .on('mousemove', (event) => {
      tooltip
        .style('left', (event.offsetX + 15) + 'px')
        .style('top', (event.offsetY - 10) + 'px');
    })
    .on('mouseleave', () => {
      link.attr('stroke-opacity', 0.4).attr('stroke', '#444');
      node.selectAll('circle').attr('opacity', 0.85);
      tooltip.style('opacity', 0);
    });

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => {
        d.x = Math.max(20, Math.min(width - 20, d.x));
        d.y = Math.max(20, Math.min(height - 20, d.y));
        return `translate(${d.x},${d.y})`;
      });
    });

    return () => simulation.stop();
  }, [data, dimensions]);

  return (
    <ChartContainer
      title="The Collaboration Network"
      subtitle="Behind every great title is a web of creative relationships. This network reveals which actors and directors frequently collaborate — clusters of nodes indicate tight-knit creative teams that produce multiple titles together."
      loading={loading}
      error={error}
      onRetry={refetch}
    >
      {/* Legend */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#E50914]" />
          <span className="text-xs text-netflix-light-gray font-mono">Director</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#e87c03]" />
          <span className="text-xs text-netflix-light-gray font-mono">Actor</span>
        </div>
        <span className="text-xs text-netflix-gray ml-auto">Drag nodes to explore</span>
      </div>

      <div className="relative w-full overflow-hidden rounded-lg bg-netflix-black/30">
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
          style={{ maxWidth: 250 }}
        />
      </div>
    </ChartContainer>
  );
}
