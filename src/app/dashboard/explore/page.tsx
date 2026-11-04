import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import ExploreFilters from './ExploreFilters'

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

      <ExploreFilters missions={missions || []} />
    </div>
  )
}