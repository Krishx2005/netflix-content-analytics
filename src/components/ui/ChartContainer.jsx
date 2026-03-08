import React from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import LoadingSkeleton from './LoadingSkeleton';
import ErrorState from './ErrorState';

export default function ChartContainer({
  title,
  subtitle,
  children,
  loading,
  error,
  onRetry,
  chapter,
}) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="bg-netflix-card/50 backdrop-blur-sm rounded-2xl border border-white/5 p-6 sm:p-8">

        <div className="mb-6">
          {chapter && (
            <span className="text-netflix-red font-mono text-xs tracking-widest uppercase mb-2 block">
              Chapter {chapter}
            </span>
          )}
          {title && (
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-netflix-white mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-netflix-light-gray font-display italic text-base sm:text-lg leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>


        {loading ? (
          <LoadingSkeleton variant="chart" />
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
}
