export function CardSkeleton() {
  return (
    <div className="bg-bg-surface border border-border rounded-xl p-5 animate-pulse">
      <div className="h-3 bg-bg-main rounded w-1/4 mb-3" />
      <div className="h-4 bg-bg-main rounded w-3/4 mb-2" />
      <div className="h-3 bg-bg-main rounded w-1/2" />
    </div>
  )
}