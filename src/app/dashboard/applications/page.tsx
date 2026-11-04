import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import { EmptyState } from '@/app/EmptyState'
export default async function MyApplications() {
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

  const { data: applications } = await supabase
    .from('applications')
    .select('*, missions(id, title, startups(name))')
    .eq('builder_id', user?.id)
    .order('applied_at', { ascending: false })

  const missionIds = applications?.map((a) => a.missions?.id).filter(Boolean) || []

  const { data: projects } = missionIds.length > 0
    ? await supabase.from('projects').select('id, mission_id').in('mission_id', missionIds)
    : { data: [] }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">My applications</h1>
      <p className="text-text-muted mb-6 text-sm">
        Missions you&apos;ve applied to.
      </p>
{(!applications || applications.length === 0) && (
        <EmptyState
          icon="📋"
          title="You haven't applied to any missions yet"
          subtitle="Browse open missions and find one that fits your skills."
        />
      )}
      <div className="grid gap-4">
        {applications?.map((app: any) => (
          <div
            key={app.id}
            className="bg-bg-surface border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-medium">{app.missions?.title}</h2>
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${
                  app.status === 'accepted'
                    ? 'bg-accent-bg text-accent-text'
                    : app.status === 'rejected'
                    ? 'bg-red-950 text-red-400'
                    : 'bg-bg-main border border-border text-text-muted'
                }`}
              >
                {app.status}
              </span>
            </div>
            <p className="text-text-muted text-sm mb-3">{app.missions?.startups?.name}</p>

            {app.status === 'accepted' &&
              (() => {
                const project = projects?.find((p) => p.mission_id === app.missions?.id)
                return project ? (
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="text-accent-text text-xs font-medium"
                  >
                    Open project room →
                  </Link>
                ) : null
              })()}
          </div>
        ))}
      </div>
    </div>
  )
}