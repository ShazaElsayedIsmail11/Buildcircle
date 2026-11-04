import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import { EmptyState } from '@/app/EmptyState'

export default async function ExploreStartups() {
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

  const { data: startups } = await supabase
    .from('startups')
    .select('*, missions(id)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Explore startups</h1>
      <p className="text-text-muted mb-6 text-sm">
        Discover startups building on buildcircle.
      </p>

      {(!startups || startups.length === 0) && (
        <EmptyState
          icon="🚀"
          title="No startups yet"
          subtitle="Check back soon."
        />
      )}

      <div className="grid gap-4">
        {startups?.map((startup) => (
          <Link
            key={startup.id}
            href={`/startup/${startup.id}`}
            className="bg-bg-surface border border-border rounded-xl p-5 hover:border-accent hover:-translate-y-0.5 transition block"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-medium">{startup.name}</h2>
              <span className="text-text-muted text-xs">
                {startup.missions?.length || 0} mission(s)
              </span>
            </div>
            <p className="text-text-muted text-sm">{startup.industry}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}