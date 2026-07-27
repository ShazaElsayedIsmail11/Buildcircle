import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import { EmptyState } from '@/app/EmptyState'
export default async function ExploreMissions() {
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

  const { data: missions } = await supabase
    .from('missions')
    .select('*, startups(name, industry)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Explore missions</h1>
      <p className="text-text-muted mb-6 text-sm">
        Find a mission that matches your skills.
      </p>

      {(!missions || missions.length === 0) && (
        <EmptyState
          icon="🔍"
          title="No missions available right now"
          subtitle="Check back soon, or explore the community while you wait."
        />
      )}

      <div className="grid gap-4">
        {missions?.map((mission) => (
          <Link
            key={mission.id}
            href={`/dashboard/missions/${mission.id}`}
className="bg-bg-surface border border-border rounded-xl p-5 hover:border-accent hover:-translate-y-0.5 transition block"          >
            <div className="flex items-center gap-2 mb-2">
              {mission.is_paid && (
                <span className="bg-accent-bg text-accent-text text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Paid
                </span>
              )}
              <span className="text-text-muted text-xs">
                {mission.startups?.name} · {mission.startups?.industry}
              </span>
            </div>
            <h2 className="text-base font-medium mb-1">{mission.title}</h2>
            <p className="text-text-muted text-sm mb-3 line-clamp-2">
              {mission.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {mission.required_skills?.map((skill: string) => (
                <span
                  key={skill}
                  className="bg-bg-main border border-border text-text-muted text-xs px-2 py-1 rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}