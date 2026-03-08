import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-netflix-black border-t border-white/5 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-netflix-white font-display text-lg">
              Built by <span className="text-netflix-red font-semibold">Krish Patel</span>
            </p>
            <p className="text-netflix-gray text-sm mt-1">
              Data sourced from Netflix titles dataset
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/krishpatel"
              target="_blank"
              rel="noopener noreferrer"
              className="text-netflix-light-gray hover:text-netflix-white transition-colors
                         text-sm font-mono"
            >
              GitHub
            </a>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-white/5 text-center">
          <p className="text-netflix-gray text-xs font-mono">
            &copy; {new Date().getFullYear()} Netflix Analytics Dashboard
          </p>
        </div>
      </div>
    </footer>
  );
}
