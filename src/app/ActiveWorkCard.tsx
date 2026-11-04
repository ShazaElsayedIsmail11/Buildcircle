import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'

export default async function ActiveWorkCard({ userId, role }: { userId: string; role: string }) {
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

  let projects: { id: string; title: string }[] = []

  if (role === 'builder') {
    const { data: squadEntries } = await supabase
      .from('squad_members')
      .select('squad_id')
      .eq('builder_id', userId)

    const squadIds = squadEntries?.map((s) => s.squad_id) || []

    if (squadIds.length > 0) {
      const { data } = await supabase
        .from('projects')
        .select('id, missions(title)')
        .in('squad_id', squadIds)
        .eq('status', 'active')
        .limit(3)

      projects = (data || []).map((p) => ({
        id: p.id,
        title: (p.missions as any)?.title || 'Untitled',
      }))
    }
  } else {
    const { data } = await supabase
      .from('projects')
      .select('id, missions!inner(title, startups!inner(hunter_id))')
      .eq('missions.startups.hunter_id', userId)
      .eq('status', 'active')
      .limit(3)

    projects = (data || []).map((p) => ({
      id: p.id,
      title: (p.missions as any)?.title || 'Untitled',
    }))
  }

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-6">
      <h3 className="text-base font-medium mb-4">Your active work</h3>

      {projects.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-text-muted text-sm">No active projects right now.</p>
        </div>
      )}

      <div className="space-y-1">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/dashboard/projects/${p.id}`}
            className="flex items-center justify-between px-3 py-3 -mx-3 rounded-lg text-sm text-text-primary hover:bg-bg-main transition"
          >
            <span className="truncate">{p.title}</span>
            <span className="text-text-muted">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}