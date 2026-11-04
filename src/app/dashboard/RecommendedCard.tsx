import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'

export default async function RecommendedCard({ userId, role }: { userId: string; role: string }) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  if (role === 'builder') {
    const { data: builderProfile } = await supabase
      .from('builder_profiles')
      .select('skills')
      .eq('user_id', userId)
      .maybeSingle()

    const skills = builderProfile?.skills || []

    let missions: { id: string; title: string }[] = []

    if (skills.length > 0) {
      const { data } = await supabase
        .from('missions')
        .select('id, title')
        .eq('status', 'open')
        .overlaps('required_skills', skills)
        .limit(3)

      missions = data || []
    }

    return (
      <div className="bg-bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium mb-3">Recommended for you</h3>

        {missions.length === 0 && (
          <p className="text-text-muted text-xs">
            Add skills to your profile to get matched with missions.
          </p>
        )}

        <div className="space-y-2">
          {missions.map((m) => (
            <Link
              key={m.id}
              href={`/dashboard/missions/${m.id}`}
              className="block text-sm text-text-primary hover:text-accent-text transition"
            >
              {m.title}
            </Link>
          ))}
        </div>
      </div>
    )
  }

  const { data: builders } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('role', 'builder')
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-medium mb-3">New builders</h3>

      {(!builders || builders.length === 0) && (
        <p className="text-text-muted text-xs">No new builders yet.</p>
      )}

      <div className="space-y-2">
        {builders?.map((b) => (
          <Link
            key={b.id}
            href={`/builder/${b.id}`}
            className="block text-sm text-text-primary hover:text-accent-text transition"
          >
            {b.full_name}
          </Link>
        ))}
      </div>
    </div>
  )
}