// src/components/shared/Skeletons.jsx

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card">
          <div className="skeleton h-4 w-2/3 rounded-full mb-3" />
          <div className="skeleton h-8 w-1/2 rounded-full mb-2" />
          <div className="skeleton h-3 w-3/4 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-3 px-4">
          <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-1/3 rounded-full" />
            <div className="skeleton h-3 w-1/4 rounded-full" />
          </div>
          <div className="skeleton h-3 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SlotSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card space-y-3">
          <div className="skeleton h-4 w-1/2 rounded-full" />
          <div className="skeleton h-3 w-1/3 rounded-full" />
          <div className="skeleton h-3 w-2/3 rounded-full" />
          <div className="skeleton h-10 w-full rounded-2xl mt-2" />
        </div>
      ))}
    </div>
  );
}

export function InlineSkeleton({ width = 'w-24', height = 'h-4' }) {
  return <div className={`skeleton ${width} ${height} rounded-full`} />;
}
