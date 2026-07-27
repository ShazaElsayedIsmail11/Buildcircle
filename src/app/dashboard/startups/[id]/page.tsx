import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function StartupPage({
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

  if (!startup) {
    notFound()
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{startup.name}</h1>
          <p className="text-text-muted text-sm">{startup.industry}</p>
        </div>

        <Link
          href={`/dashboard/missions/new?startup=${startup.id}`}
          className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium"
        >
          + Post a mission
        </Link>
      </div>

      <div className="bg-bg-surface border-border rounded-xl border p-6">
        <p className="text-text-primary text-sm leading-relaxed">
          {startup.description}
        </p>

        {startup.website && (
          <a
            href={startup.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-text mt-4 inline-block text-sm"
          >
            {startup.website} ↗
          </a>
        )}
      </div>
    </div>
  )
}