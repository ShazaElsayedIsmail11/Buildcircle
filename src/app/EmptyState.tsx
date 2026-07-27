export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: string
  title: string
  subtitle: string
}) {
  return (
    <div className="bg-bg-surface border border-border rounded-xl p-10 text-center">
      <div className="text-3xl mb-3">{icon}</div>
      <p className="text-text-primary text-sm font-medium mb-1">{title}</p>
      <p className="text-text-muted text-xs">{subtitle}</p>
    </div>
  )
}