import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function FilterDropdown({ label, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-netflix-gray text-xs font-mono uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="bg-netflix-card border border-white/10 rounded-lg px-3 py-2 text-sm
                   text-netflix-white appearance-none cursor-pointer
                   focus:outline-none focus:border-netflix-red/50 transition-colors
                   min-w-[130px]"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterPill({ label, value, onRemove }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="inline-flex items-center gap-1.5 bg-netflix-red/20 text-netflix-red
                 border border-netflix-red/30 rounded-full px-3 py-1 text-xs font-medium"
    >
      <span className="text-netflix-light-gray">{label}:</span> {value}
      <button
        onClick={onRemove}
        className="ml-1 hover:text-white transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        &times;
      </button>
    </motion.span>
  );
}

export default function FilterBar({ filters, activeFilters, onFilterChange }) {
  const filterOptions = filters || {};

  const activeFilterEntries = Object.entries(activeFilters || {}).filter(
    ([, value]) => value !== '' && value !== undefined && value !== null
  );

  const filterLabels = {
    type: 'Type',
    genre: 'Genre',
    country: 'Country',
    yearStart: 'From Year',
    yearEnd: 'To Year',
  };

  return (
    <div className="sticky top-[64px] z-40 bg-netflix-black/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-end gap-4">
          <FilterDropdown
            label="Type"
            value={activeFilters?.type}
            options={['Movie', 'TV Show']}
            onChange={(v) => onFilterChange('type', v)}
          />
          <FilterDropdown
            label="Genre"
            value={activeFilters?.genre}
            options={filterOptions.genres || []}
            onChange={(v) => onFilterChange('genre', v)}
          />
          <FilterDropdown
            label="Country"
            value={activeFilters?.country}
            options={filterOptions.countries || []}
            onChange={(v) => onFilterChange('country', v)}
          />
          <FilterDropdown
            label="From Year"
            value={activeFilters?.yearStart}
            options={(filterOptions.years || []).map(String)}
            onChange={(v) => onFilterChange('yearStart', v)}
          />
          <FilterDropdown
            label="To Year"
            value={activeFilters?.yearEnd}
            options={(filterOptions.years || []).map(String)}
            onChange={(v) => onFilterChange('yearEnd', v)}
          />

          {activeFilterEntries.length > 0 && (
            <button
              onClick={() => {
                Object.keys(activeFilters).forEach((key) =>
                  onFilterChange(key, '')
                );
              }}
              className="text-netflix-gray hover:text-netflix-red text-xs font-mono
                         uppercase tracking-wider transition-colors pb-2"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Active filter pills */}
        <AnimatePresence>
          {activeFilterEntries.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-wrap gap-2 mt-3"
            >
              {activeFilterEntries.map(([key, value]) => (
                <FilterPill
                  key={key}
                  label={filterLabels[key] || key}
                  value={value}
                  onRemove={() => onFilterChange(key, '')}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
