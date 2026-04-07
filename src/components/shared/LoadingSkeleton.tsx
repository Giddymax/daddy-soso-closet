export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="skeleton h-56 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-24 rounded" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
      <div className="skeleton h-5 w-1/3 rounded" />
      <div className="skeleton h-10 w-1/2 rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
    </div>
  );
}
