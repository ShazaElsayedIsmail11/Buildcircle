import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'

export default async function Groups() {
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

  const { data: groups } = await supabase
    .from('groups')
    .select('*, posts(id)')
    .order('name', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Groups</h1>
      <p className="text-text-muted mb-6 text-sm">
        Join the conversation in topics that matter to you.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {groups?.map((g: any) => (
          <Link
            key={g.id}
            href={`/dashboard/groups/${g.id}`}
            className="bg-bg-surface border border-border rounded-xl p-5 hover:border-accent hover:-translate-y-0.5 transition block"
          >
            <div className="text-2xl mb-2">{g.icon}</div>
            <h2 className="text-base font-medium mb-1">{g.name}</h2>
            <p className="text-text-muted text-sm mb-2">{g.description}</p>
            <p className="text-text-muted text-xs">{g.posts?.length || 0} posts</p>
          </Link>
        ))}
      </div>
    </div>
  )
}