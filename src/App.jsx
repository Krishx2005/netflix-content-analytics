import React, { useState, useCallback } from 'react';
import Navbar from './components/layout/Navbar';
import ChapterHeader from './components/layout/ChapterHeader';
import Footer from './components/layout/Footer';
import FilterBar from './components/ui/FilterBar';
import HeroSection from './components/charts/HeroSection';
import GrowthChart from './components/charts/GrowthChart';
import WorldMap from './components/charts/WorldMap';
import GenreDonut from './components/charts/GenreDonut';
import RatingChart from './components/charts/RatingChart';
import PeopleChart from './components/charts/PeopleChart';
import HeatmapChart from './components/charts/HeatmapChart';
import NetworkGraph from './components/charts/NetworkGraph';
import Takeaways from './components/charts/Takeaways';
import { useApi } from './hooks/useApi';
import { api } from './services/api';

export default function App() {
  const [activeFilters, setActiveFilters] = useState({
    type: '',
    genre: '',
    country: '',
    yearStart: '',
    yearEnd: '',
  });

  const { data: filterOptions } = useApi(api.getFilters);

  const handleFilterChange = useCallback((key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      <FilterBar
        filters={filterOptions || {}}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />

      <main>
        {/* Chapter 1: Hero */}
        <section id="hero">
          <HeroSection />
        </section>

        {/* Chapter 2: Growth */}
        <section id="growth" className="py-8">
          <GrowthChart filters={activeFilters} />
        </section>

        {/* Chapter 3: Geography */}
        <section id="geography" className="py-8">
          <WorldMap />
        </section>

        {/* Chapter 4: Genre */}
        <section id="genre" className="py-8">
          <GenreDonut filters={activeFilters} />
        </section>

        {/* Chapter 5: Ratings */}
        <section id="ratings" className="py-8">
          <RatingChart filters={activeFilters} />
        </section>

        {/* Chapter 6: People */}
        <section id="people" className="py-8">
          <PeopleChart filters={activeFilters} />
          <HeatmapChart />
          <NetworkGraph />
        </section>

        {/* Chapter 7: Takeaways */}
        <section id="takeaways" className="py-8">
          <Takeaways />
        </section>
      </main>

      <Footer />
    </div>
  );
}
