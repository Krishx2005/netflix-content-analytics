import React from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const takeaways = [
  {
    number: '01',
    title: 'Content Explosion',
    text: 'Netflix added content at an exponential rate from 2015-2022, with the most aggressive growth in 2019-2021. This surge reflects the streaming wars era, where content volume became a competitive weapon.',
  },
  {
    number: '02',
    title: 'Global By Design',
    text: 'While the US and India lead in content volume, Netflix sources from 40+ countries. This isn\'t accidental — it\'s a deliberate strategy to make every subscriber feel the library was built for them.',
  },
  {
    number: '03',
    title: 'Drama Dominates',
    text: 'International movies, dramas, and comedies make up the bulk of the catalog. Netflix bets big on narrative-driven content that travels well across cultures, rather than spectacle-heavy blockbusters.',
  },
  {
    number: '04',
    title: 'Mature Audience Focus',
    text: 'With ~30% of content rated TV-MA or R, Netflix clearly targets adult viewers. This creates an opportunity gap in family content that competitors have successfully exploited.',
  },
  {
    number: '05',
    title: 'Strategic Release Timing',
    text: 'Content releases peak in Q4 (holiday season) and July (summer), revealing a calculated approach to maximizing viewership during high-engagement periods.',
  },
];

function TakeawayCard({ item, index }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="flex gap-6 p-6 rounded-xl bg-netflix-card/30 border border-white/5 hover:border-netflix-red/20 transition-colors group"
    >
      <div className="text-3xl font-display font-bold text-netflix-red/40 group-hover:text-netflix-red transition-colors flex-shrink-0">
        {item.number}
      </div>
      <div>
        <h3 className="text-lg font-display font-bold text-netflix-white mb-2">
          {item.title}
        </h3>
        <p className="text-sm text-netflix-light-gray leading-relaxed">
          {item.text}
        </p>
      </div>
    </motion.div>
  );
}

export default function Takeaways() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-12"
      >
        <span className="text-netflix-red font-mono text-xs tracking-widest uppercase mb-3 block">
          Chapter 7
        </span>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-netflix-white mb-4">
          Key Takeaways
        </h2>
        <p className="font-display italic text-netflix-light-gray text-lg max-w-2xl mx-auto">
          Five insights that define Netflix's content strategy — and reveal where
          the streaming giant is placing its biggest bets.
        </p>
      </motion.div>

      <div className="space-y-4">
        {takeaways.map((item, i) => (
          <TakeawayCard key={item.number} item={item} index={i} />
        ))}
      </div>


      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
        className="mt-16 text-center border-t border-white/5 pt-12"
      >
        <p className="font-display italic text-netflix-light-gray text-base max-w-xl mx-auto">
          "Data tells a story if you know how to listen. Netflix's catalog isn't
          just a list of shows — it's a map of global entertainment strategy."
        </p>
      </motion.div>
    </div>
  );
}
