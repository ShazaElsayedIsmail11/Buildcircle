import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'

export default async function MyMissions() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: missions } = await supabase
    .from('missions')
    .select('*, startups!inner(name, hunter_id), applications(id)')
    .eq('startups.hunter_id', user?.id)
    .order('created_at', { ascending: false })

    const { data: firstStartup } = await supabase
    .from('startups')
    .select('id')
    .eq('hunter_id', user?.id)
    .limit(1)
    .maybeSingle()
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold">My missions</h1>
        {firstStartup && (
          <Link
            href={`/dashboard/missions/new?startup=${firstStartup.id}`}
            className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium"
          >
            + New mission
          </Link>
        )}
      </div>
      <p className="text-text-muted mb-6 text-sm">
        All missions you&apos;ve posted across your startups.
      </p>

      {(!missions || missions.length === 0) && (
        <div className="bg-bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">
            You haven&apos;t posted any missions yet.
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {missions?.map((mission: any) => (
          <Link
            key={mission.id}
            href={`/dashboard/missions/${mission.id}`}
className="bg-bg-surface border border-border rounded-xl p-5 hover:border-accent hover:-translate-y-0.5 transition block"          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-muted text-xs">{mission.startups?.name}</span>
              <span className="bg-bg-main border border-border text-text-muted text-xs px-2 py-1 rounded-md capitalize">
                {mission.status}
              </span>
            </div>
            <h2 className="text-base font-medium mb-1">{mission.title}</h2>
            <p className="text-text-muted text-xs">
              {mission.applications?.length || 0} applicant(s)
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}