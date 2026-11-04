import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export default async function AdminOverview() {
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

  const { count: usersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: startupsCount } = await supabase
    .from('startups')
    .select('*', { count: 'exact', head: true })

  const { count: missionsCount } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true })

  const { count: projectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Platform overview</h1>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-bg-surface border border-border rounded-xl p-5">
          <p className="text-3xl font-semibold">{usersCount || 0}</p>
          <p className="text-text-muted text-xs mt-1">Total users</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-5">
          <p className="text-3xl font-semibold">{startupsCount || 0}</p>
          <p className="text-text-muted text-xs mt-1">Startups</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-5">
          <p className="text-3xl font-semibold">{missionsCount || 0}</p>
          <p className="text-text-muted text-xs mt-1">Missions</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-5">
          <p className="text-3xl font-semibold text-accent-text">{projectsCount || 0}</p>
          <p className="text-text-muted text-xs mt-1">Active projects</p>
        </div>
      </div>
    </div>
  )
}