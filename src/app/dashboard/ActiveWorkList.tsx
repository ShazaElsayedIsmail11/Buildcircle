import Link from 'next/link'

type Item = { id: string; title: string; subtitle: string }

export default function ActiveWorkList({
  items,
  title,
}: {
  items: Item[]
  title: string
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <p className="text-text-muted text-xs px-4 py-3 border-b border-border">{title}</p>

      {items.length === 0 && (
        <p className="text-text-muted text-xs px-4 py-6 text-center">Nothing here yet.</p>
      )}

      {items.map((item, i) => (
        <Link
          key={item.id}
          href={`/dashboard/projects/${item.id}`}
          className={`flex items-center justify-between px-4 py-3 hover:bg-bg-surface transition ${
            i !== items.length - 1 ? 'border-b border-border' : ''
          }`}
        >
          <span className="text-sm text-text-primary">{item.title}</span>
          <span className="text-text-muted text-xs">{item.subtitle}</span>
        </Link>
      ))}
    </div>
  )
}