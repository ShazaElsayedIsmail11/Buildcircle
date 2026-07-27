import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'

export default async function MyStartups() {
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

  const { data: startups } = await supabase
    .from('startups')
    .select('*')
    .eq('hunter_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">My startups</h1>
          <p className="text-text-muted text-sm">Startups you&apos;ve created.</p>
        </div>
        <Link
          href="/dashboard/startups/new"
          className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium"
        >
          + New startup
        </Link>
      </div>

      {(!startups || startups.length === 0) && (
        <div className="bg-bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">You haven&apos;t created any startups yet.</p>
        </div>
      )}

      <div className="grid gap-4">
        {startups?.map((startup) => (
          <Link
            key={startup.id}
            href={`/dashboard/startups/${startup.id}`}
className="bg-bg-surface border border-border rounded-xl p-5 hover:border-accent hover:-translate-y-0.5 transition block"          >
            <h2 className="text-base font-medium mb-1">{startup.name}</h2>
            <p className="text-text-muted text-sm">{startup.industry}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}