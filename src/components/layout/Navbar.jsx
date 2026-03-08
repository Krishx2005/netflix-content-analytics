import React, { useState, useEffect } from 'react';

const chapters = [
  { id: 'hero', label: 'Intro' },
  { id: 'growth', label: 'Growth' },
  { id: 'geography', label: 'Geography' },
  { id: 'genre', label: 'Genre' },
  { id: 'ratings', label: 'Ratings' },
  { id: 'people', label: 'People' },
  { id: 'takeaways', label: 'Takeaways' },
];

export default function Navbar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-netflix-black/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-netflix-red font-bold text-xl tracking-wider">
              NETFLIX ANALYTICS
            </h1>
            <p className="text-netflix-gray text-[10px] font-display italic tracking-wide -mt-1">
              A Data Story
            </p>
          </div>

          {/* Chapter navigation */}
          <div className="hidden md:flex items-center gap-1">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => scrollToSection(chapter.id)}
                className="px-3 py-1.5 text-xs font-mono text-netflix-light-gray
                           hover:text-netflix-white hover:bg-white/5 rounded
                           transition-colors duration-200 uppercase tracking-wider"
              >
                {chapter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll progress indicator */}
      <div className="h-[2px] bg-transparent">
        <div
          className="h-full bg-netflix-red transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </nav>
  );
}
