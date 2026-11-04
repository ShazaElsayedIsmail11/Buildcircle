import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export default async function AdminStartups() {
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

  const { data: startups } = await supabase
    .from('startups')
    .select('*, users(full_name, email), missions(id)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Startups ({startups?.length || 0})</h1>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-surface">
              <th className="text-left px-4 py-3 text-text-muted font-medium">Name</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Owner</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Industry</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Missions</th>
            </tr>
          </thead>
          <tbody>
            {startups?.map((s: any) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3 text-text-muted">{s.users?.full_name}</td>
                <td className="px-4 py-3 text-text-muted">{s.industry}</td>
                <td className="px-4 py-3">{s.missions?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}