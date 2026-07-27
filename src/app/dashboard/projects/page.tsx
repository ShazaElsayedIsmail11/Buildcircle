import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import { EmptyState } from '@/app/EmptyState'
export default async function MyProjects() {
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

  const { data: squadEntries } = await supabase
    .from('squad_members')
    .select('squad_id')
    .eq('builder_id', user?.id)

  const squadIds = squadEntries?.map((s) => s.squad_id) || []

  const { data: projects } =
    squadIds.length > 0
      ? await supabase
          .from('projects')
          .select('*, missions(title, startups(name))')
          .in('squad_id', squadIds)
          .order('created_at', { ascending: false })
      : { data: [] }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">My projects</h1>
      <p className="text-text-muted mb-6 text-sm">
        Projects you&apos;re currently working on.
      </p>

     {(!projects || projects.length === 0) && (
        <EmptyState
          icon="📁"
          title="You're not part of any project yet"
          subtitle="Apply to a mission to get started."
        />
      )}
      <div className="grid gap-4">
        {projects?.map((project: any) => (
          <Link
            key={project.id}
            href={`/dashboard/projects/${project.id}`}
            className="bg-bg-surface border border-border rounded-xl p-5 hover:border-accent hover:-translate-y-0.5 transition block"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-medium">{project.missions?.title}</h2>
              <span className="bg-bg-main border border-border text-text-muted text-xs px-2 py-1 rounded-md capitalize">
                {project.status}
              </span>
            </div>
            <p className="text-text-muted text-sm">{project.missions?.startups?.name}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}