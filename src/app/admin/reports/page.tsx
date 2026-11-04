import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { EmptyState } from '@/app/EmptyState'

export default async function AdminReports() {
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

  const { data: reports } = await supabase
    .from('reports')
    .select('*, users(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Reports ({reports?.length || 0})</h1>

      {(!reports || reports.length === 0) && (
        <EmptyState icon="🚩" title="No reports" subtitle="Reported content will appear here." />
      )}

      <div className="space-y-2">
        {reports?.map((r: any) => (
          <div key={r.id} className="bg-bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium capitalize">{r.target_type} reported</span>
              <span className="text-xs text-text-muted capitalize">{r.status}</span>
            </div>
            <p className="text-text-muted text-sm">{r.reason}</p>
            <p className="text-text-muted text-xs mt-1">By {r.users?.full_name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}