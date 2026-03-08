import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { formatNumber } from '../../utils/formatters';

export default function StatCard({ value, label, delay = 0, suffix = '' }) {
  const { ref, isVisible } = useScrollReveal();
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isVisible || typeof value !== 'number') return;

    const duration = 1500;
    const steps = 40;
    const stepDuration = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      const progress = current / steps;
      // Ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));

      if (current >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="bg-netflix-card rounded-xl border border-white/5 p-6 text-center flex-1 min-w-[140px]"
    >
      <div className="text-3xl sm:text-4xl font-bold text-gradient-red font-mono mb-2">
        {typeof value === 'number' ? formatNumber(displayValue) : value}
        {suffix}
      </div>
      <div className="text-netflix-light-gray text-sm font-sans">
        {label}
      </div>
    </motion.div>
  );
}
