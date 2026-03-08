import React from 'react';
import { motion } from 'framer-motion';
import StatCard from '../ui/StatCard';
import { useApi } from '../../hooks/useApi';
import { api } from '../../services/api';
import LoadingSkeleton from '../ui/LoadingSkeleton';

export default function HeroSection() {
  const { data: stats, loading } = useApi(api.getStats);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-netflix-red/10 via-netflix-black to-netflix-black" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-netflix-red/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        {/* Overline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-netflix-red/10 border border-netflix-red/20 text-netflix-red text-xs font-mono uppercase tracking-[0.2em]">
            Data Visualization Case Study
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-netflix-white leading-tight mb-6"
        >
          800 Titles.{' '}
          <span className="text-gradient-red">40+ Countries.</span>
          <br />
          One Data Story.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="font-display italic text-lg sm:text-xl text-netflix-light-gray max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          An interactive exploration of Netflix's content library — how it grew,
          where it comes from, and what it reveals about the platform's global strategy.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto"
        >
          {loading ? (
            <div className="flex gap-4 w-full max-w-xl">
              {[1, 2, 3, 4].map(i => (
                <LoadingSkeleton key={i} variant="stat" />
              ))}
            </div>
          ) : stats ? (
            <>
              <StatCard value={stats.total} label="Total Titles" delay={0.1} />
              <StatCard value={stats.movies} label="Movies" delay={0.2} />
              <StatCard value={stats.tvShows} label="TV Shows" delay={0.3} />
              <StatCard value={stats.countryCount} label="Countries" delay={0.4} />
            </>
          ) : null}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-netflix-gray font-mono tracking-wider">SCROLL TO EXPLORE</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-netflix-gray">
              <path d="M10 4 L10 16 M4 10 L10 16 L16 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
