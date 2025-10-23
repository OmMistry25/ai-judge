import React from 'react';

interface StateHandlerProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  children: React.ReactNode;
  loadingSkeleton?: React.ReactNode;
}

export const StateHandler: React.FC<StateHandlerProps> = ({
  loading = false,
  error = null,
  empty = false,
  emptyMessage = 'No data available',
  emptyIcon = '📄',
  emptyAction,
  children,
  loadingSkeleton
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {loadingSkeleton || (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-4xl mb-3">❌</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (empty) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-gray-600 text-4xl mb-3">{emptyIcon}</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data</h3>
        <p className="text-gray-700 mb-4">{emptyMessage}</p>
        {emptyAction && (
          <button
            onClick={emptyAction.onClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {emptyAction.label}
          </button>
        )}
      </div>
    );
  }

  // Default: render children
  return <>{children}</>;
};

// Specialized loading skeletons for different components
export const TableLoadingSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 6 
}) => (
  <div className="animate-pulse">
    <div className="bg-gray-200 h-10 rounded mb-4"></div>
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          {[...Array(columns)].map((_, j) => (
            <div key={j} className="h-4 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const CardLoadingSkeleton: React.FC<{ cards?: number }> = ({ cards = 3 }) => (
  <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-4">
    {[...Array(cards)].map((_, i) => (
      <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
    ))}
  </div>
);

export const ListLoadingSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="animate-pulse space-y-3">
    {[...Array(items)].map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded flex-1"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    ))}
  </div>
);
