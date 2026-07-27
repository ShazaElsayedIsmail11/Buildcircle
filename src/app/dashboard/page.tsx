import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'

export default async function DashboardHome() {
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

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (profile?.role === 'hunter') {
    const { data: startups } = await supabase
      .from('startups')
      .select('id')
      .eq('hunter_id', user?.id)

    const { data: openMissions } = await supabase
      .from('missions')
      .select('id, startups!inner(hunter_id)')
      .eq('startups.hunter_id', user?.id)
      .eq('status', 'open')

    if (!startups || startups.length === 0) {
      return (
        <div>
          <h1 className="text-2xl font-semibold mb-1">Welcome back 👋</h1>
          <p className="text-text-muted mb-6">Let&apos;s get your first startup set up.</p>
          <Link
            href="/dashboard/startups/new"
            className="inline-block bg-accent text-bg-main rounded-lg px-5 py-2.5 text-sm font-medium"
          >
            + Create your first startup
          </Link>
        </div>
      )
    }

    return (
      <div>
        <h1 className="text-2xl font-semibold mb-1">Welcome back 👋</h1>
        <p className="text-text-muted mb-6">Here&apos;s what&apos;s happening today.</p>

        <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
          <div className="bg-bg-surface border border-border rounded-xl p-4">
            <p className="text-2xl font-semibold">{startups.length}</p>
            <p className="text-text-muted text-xs">Startups</p>
          </div>
          <div className="bg-bg-surface border border-border rounded-xl p-4">
            <p className="text-2xl font-semibold">{openMissions?.length || 0}</p>
            <p className="text-text-muted text-xs">Open missions</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/startups"
            className="bg-bg-surface border border-border rounded-lg px-4 py-2 text-sm font-medium"
          >
            View startups
          </Link>
          <Link
            href="/dashboard/missions"
            className="bg-bg-surface border border-border rounded-lg px-4 py-2 text-sm font-medium"
          >
            View missions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Welcome back 👋</h1>
      <p className="text-text-muted mb-6">Here&apos;s what&apos;s happening today.</p>
      <Link
        href="/dashboard/explore"
        className="inline-block bg-accent text-bg-main rounded-lg px-5 py-2.5 text-sm font-medium"
      >
        Explore missions
      </Link>
    </div>
  )
}