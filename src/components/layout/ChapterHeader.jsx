import React from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function ChapterHeader({ number, title }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8"
    >
      <div className="flex items-center gap-4 mb-4">
        <span className="text-6xl sm:text-8xl font-display font-bold text-netflix-red/20">
          {String(number).padStart(2, '0')}
        </span>
        <div>
          <div className="w-12 h-[3px] bg-netflix-red rounded-full mb-3" />
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-netflix-white">
            {title}
          </h2>
        </div>
      </div>
    </motion.div>
  );
}
