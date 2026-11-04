import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import { EmptyState } from '@/app/EmptyState'

export default async function SavedMissions() {
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

  const { data: { user } } = await supabase.auth.getUser()

  const { data: saved } = await supabase
    .from('saved_missions')
    .select('*, missions(id, title, is_paid, budget, startups(name))')
    .eq('builder_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Saved missions</h1>

      {(!saved || saved.length === 0) && (
        <EmptyState icon="🔖" title="No saved missions" subtitle="Save missions you're interested in to find them here later." />
      )}

      <div className="grid gap-4">
        {saved?.map((s) => (
          <Link
            key={s.id}
            href={`/dashboard/missions/${s.missions?.id}`}
            className="bg-bg-surface border border-border rounded-xl p-5 hover:border-accent hover:-translate-y-0.5 transition block"
          >
            <h2 className="text-base font-medium mb-1">{s.missions?.title}</h2>
            <p className="text-text-muted text-sm">{s.missions?.startups?.name}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}