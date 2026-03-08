import React from 'react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-netflix-red text-5xl mb-4">!</div>
      <h3 className="text-netflix-white text-lg font-semibold mb-2">
        Something went wrong
      </h3>
      <p className="text-netflix-light-gray text-sm text-center max-w-md mb-6">
        {message || 'We couldn\u2019t load this data. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-netflix-red hover:bg-netflix-red-dark text-white rounded
                     font-medium text-sm transition-colors duration-200"
        >
          Retry
        </button>
      )}
    </div>
  );
}
