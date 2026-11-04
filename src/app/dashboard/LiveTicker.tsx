import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export default async function LiveTicker() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: missions } = await supabase
    .from('missions')
    .select('id, title, startups(name)')
    .order('created_at', { ascending: false })
    .limit(4)

  const { data: startups } = await supabase
    .from('startups')
    .select('id, name')
    .order('created_at', { ascending: false })
    .limit(4)

  const items = [
...(missions || []).map(
  (m) => `🎯 ${m.startups?.[0]?.name ?? 'A startup'} posted "${m.title}"`
),    ...(startups || []).map((s) => `🚀 ${s.name} joined buildcircle`),
  ]

  if (items.length === 0) return null

  const looped = [...items, ...items]

  return (
<div className="bg-bg-surface border border-border rounded-lg px-4 py-2 mb-6 overflow-hidden w-full max-w-full">
          <div className="flex gap-8 whitespace-nowrap ticker-track w-max">
        {looped.map((text, i) => (
          <span key={i} className="text-text-muted text-xs">
            {text}
          </span>
        ))}
      </div>
    </div>
  )
}