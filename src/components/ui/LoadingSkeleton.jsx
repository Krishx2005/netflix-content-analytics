import React from 'react';

export default function LoadingSkeleton({ variant = 'chart', count = 1 }) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (variant === 'stat') {
    return (
      <div className="flex gap-4 flex-wrap">
        {skeletons.map((i) => (
          <div
            key={i}
            className="bg-netflix-card rounded-lg p-6 flex-1 min-w-[160px] animate-pulse"
          >
            <div className="h-8 w-20 bg-netflix-card-hover rounded mb-3" />
            <div className="h-4 w-24 bg-netflix-card-hover rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className="space-y-3 animate-pulse">
        {skeletons.map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-netflix-card rounded w-full" />
            <div className="h-4 bg-netflix-card rounded w-5/6" />
            <div className="h-4 bg-netflix-card rounded w-4/6" />
          </div>
        ))}
      </div>
    );
  }

  // Default: chart variant
  return (
    <div className="animate-pulse">
      {skeletons.map((i) => (
        <div
          key={i}
          className="bg-netflix-card rounded-xl w-full h-[350px] flex items-end justify-center gap-2 p-8"
        >
          {Array.from({ length: 8 }, (_, j) => (
            <div
              key={j}
              className="bg-netflix-card-hover rounded-t"
              style={{
                width: '8%',
                height: `${30 + Math.random() * 60}%`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
