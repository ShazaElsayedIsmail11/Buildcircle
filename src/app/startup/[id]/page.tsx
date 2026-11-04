import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function PublicStartupProfile({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  const { data: startup } = await supabase
    .from('startups')
    .select('*')
    .eq('id', id)
    .single()

  if (!startup) notFound()

  const { data: missions } = await supabase
    .from('missions')
    .select('*')
    .eq('startup_id', id)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-bg-main text-text-primary px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-1">{startup.name}</h1>
        <p className="text-text-muted text-sm mb-6">{startup.industry}</p>

        <div className="bg-bg-surface border border-border rounded-xl p-6 mb-8">
          <p className="text-text-primary text-sm leading-relaxed">
            {startup.description}
          </p>
          {startup.website && (
            <a
              href={startup.website}
              target="_blank"
              className="text-accent-text text-sm mt-4 inline-block"
            >
              {startup.website} ↗
            </a>
          )}
        </div>

        <h2 className="text-lg font-semibold mb-3">Open missions</h2>

        {(!missions || missions.length === 0) && (
          <div className="bg-bg-surface border border-border rounded-xl p-6 text-center">
            <p className="text-text-muted text-sm">No open missions right now.</p>
          </div>
        )}

        <div className="grid gap-3">
          {missions?.map((mission) => (
            <Link
              key={mission.id}
              href={`/dashboard/missions/${mission.id}`}
              className="bg-bg-surface border border-border rounded-xl p-4 hover:border-accent transition block"
            >
              <p className="text-sm font-medium">{mission.title}</p>
              {mission.is_paid && (
                <span className="text-accent-text text-xs">Paid</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}