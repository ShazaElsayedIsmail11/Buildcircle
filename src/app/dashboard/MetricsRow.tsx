type Metric = { emoji: string; label: string; value: string | number; accent?: boolean }

export default function MetricsRow({ metrics }: { metrics: Metric[] }) {
  return (
    <div
      className="grid border border-border rounded-xl overflow-hidden mb-4"
      style={{ gridTemplateColumns: `repeat(${metrics.length}, 1fr)` }}
    >
      {metrics.map((m, i) => (
        <div
          key={m.label}
          className={`p-4 ${i !== metrics.length - 1 ? 'border-r border-border' : ''} ${
            m.accent ? 'bg-accent-bg' : ''
          }`}
        >
          <p className={`text-xs mb-1.5 ${m.accent ? 'text-accent-text' : 'text-text-muted'}`}>
            {m.emoji} {m.label}
          </p>
          <p className={`text-2xl font-semibold ${m.accent ? 'text-accent-text' : 'text-text-primary'}`}>
            {m.value}
          </p>
        </div>
      ))}
    </div>
  )
}