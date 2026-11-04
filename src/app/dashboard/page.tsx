import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import DashboardTabs from './DashboardTabs'
import LiveTicker from './LiveTicker'
import MetricsRow from './MetricsRow'
import TrendChart from './TrendChart'
import ActiveWorkList from './ActiveWorkList'

import { groupByDay } from '@/lib/chartData'

type Metric = {
  emoji: string
  label: string
  value: string | number
  accent?: boolean
}

type ActiveItem = {
  id: string
  title: string
  subtitle: string
}

type ChartItem = {
  date: string
  count: number
}

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

  const isHunter = profile?.role === 'hunter'

  let metrics: Metric[] = []
  let activeItems: ActiveItem[] = []
  let chartData: ChartItem[] = []
  let chartLabel = ''
  let hasStartup = true

  if (isHunter) {
    const { data: startups } = await supabase
      .from('startups')
      .select('id')
      .eq('hunter_id', user?.id)

    hasStartup = Boolean(startups?.length)

    if (hasStartup) {
      const { data: openMissions } = await supabase
        .from('missions')
        .select('id, startups!inner(hunter_id)')
        .eq('startups.hunter_id', user?.id)
        .eq('status', 'open')

      const { data: allMissions } = await supabase
        .from('missions')
        .select('id, created_at, startups!inner(hunter_id)')
        .eq('startups.hunter_id', user?.id)

      const { data: activeProjects } = await supabase
        .from('projects')
        .select(
          'id, missions!inner(title, startups!inner(hunter_id, name))'
        )
        .eq('missions.startups.hunter_id', user?.id)
        .eq('status', 'active')
        .limit(5)

      metrics = [
        {
          emoji: '🚀',
          label: 'Startups',
          value: startups?.length || 0,
        },
        {
          emoji: '🎯',
          label: 'Open missions',
          value: openMissions?.length || 0,
        },
        {
          emoji: '📁',
          label: 'Total missions',
          value: allMissions?.length || 0,
        },
      ]

      activeItems = (activeProjects || []).map((project: any) => ({
        id: project.id,
        title: project.missions?.title || 'Untitled',
        subtitle: project.missions?.startups?.name || '',
      }))

      chartData = groupByDay(
        (allMissions || [])
          .map((mission) => mission.created_at)
          .filter((date): date is string => Boolean(date))
      )

      chartLabel = 'Missions posted (last 7 days)'
    }
  } else {
    const { data: applications } = await supabase
      .from('applications')
      .select('id, applied_at, status')
      .eq('builder_id', user?.id)

    const { data: squadEntries } = await supabase
      .from('squad_members')
      .select('squad_id')
      .eq('builder_id', user?.id)

    const squadIds = squadEntries?.map((entry) => entry.squad_id) || []

    let activeProjects: any[] = []

    if (squadIds.length > 0) {
      const { data } = await supabase
        .from('projects')
        .select('id, missions(title, startups(name))')
        .in('squad_id', squadIds)
        .eq('status', 'active')
        .limit(5)

      activeProjects = data || []
    }

    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('builder_id', user?.id)

    const avgRating =
      reviews && reviews.length > 0
        ? (
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          ).toFixed(1)
        : null

    const acceptedCount = (applications || []).filter(
      (application) => application.status === 'accepted'
    ).length

    metrics = [
      {
        emoji: '📨',
        label: 'Applications',
        value: applications?.length || 0,
      },
      {
        emoji: '✓',
        label: 'Accepted',
        value: acceptedCount,
      },
      {
        emoji: '⭐',
        label: 'Rating',
        value: avgRating || '—',
        accent: Boolean(avgRating),
      },
    ]

    activeItems = activeProjects.map((project: any) => ({
      id: project.id,
      title: project.missions?.title || 'Untitled',
      subtitle: project.missions?.startups?.name || '',
    }))

    chartData = groupByDay(
      (applications || [])
        .map((application) => application.applied_at)
        .filter((date): date is string => Boolean(date))
    )
console.log('Chart data:', chartData)
    chartLabel = 'Applications sent (last 7 days)'
  }

  if (isHunter && !hasStartup) {
    return (
      <div>
        <LiveTicker />

        <h1 className="mb-1 text-2xl font-semibold">Welcome back</h1>

        <p className="mb-6 text-text-muted">
          Let&apos;s get your first startup set up.
        </p>

        <Link
          href="/dashboard/startups/new"
          className="inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-bg-main"
        >
          + Create your first startup
        </Link>
      </div>
    )
  }

  return (
    <div>
      <LiveTicker />

      <div className="mb-5">
        <h1 className="mb-1 text-2xl font-semibold">Welcome back</h1>

        <p className="text-sm text-text-muted">
          Here&apos;s what&apos;s happening today.
        </p>
      </div>

      <DashboardTabs>
        {{
          overview: (
            <>
              <MetricsRow metrics={metrics} />

              <TrendChart data={chartData} label={chartLabel} />

              <ActiveWorkList
                items={activeItems}
                title={isHunter ? 'Active projects' : 'Your active work'}
              />
            </>
          ),

          projects: (
            <ActiveWorkList
              items={activeItems}
              title={isHunter ? 'Active projects' : 'Your active work'}
            />
          ),

          missions: (
            <div className="rounded-xl border border-border p-8 text-center">
              <p className="text-sm text-text-muted">
                {isHunter ? (
                  <Link href="/dashboard/missions" className="text-accent-text">
                    View all missions →
                  </Link>
                ) : (
                  <Link href="/dashboard/explore" className="text-accent-text">
                    Explore missions →
                  </Link>
                )}
              </p>
            </div>
          ),
        }}
      </DashboardTabs>
    </div>
  )
}