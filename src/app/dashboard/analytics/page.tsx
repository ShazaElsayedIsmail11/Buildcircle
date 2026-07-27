import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import MissionCharts from './MissionCharts'

export default async function Analytics() {
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
    .select('status, is_paid, budget, startups!inner(hunter_id)')
    .eq('startups.hunter_id', user?.id)

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Analytics</h1>
      <p className="text-text-muted mb-6 text-sm">
        Overview of your missions and hiring activity.
      </p>

      <MissionCharts missions={missions || []} />
    </div>
  )
}