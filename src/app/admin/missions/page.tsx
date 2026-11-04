import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import FeatureToggle from './FeatureToggle'

export default async function AdminMissions() {
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

const { data: missions } = await supabase
    .from('missions')
    .select('*, startups(name), applications(id)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Missions ({missions?.length || 0})</h1>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-surface">
              <th className="text-left px-4 py-3 text-text-muted font-medium">Title</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Startup</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Applicants</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Quality</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Status</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Featured</th>
            </tr>
          </thead>
          <tbody>
            {missions?.map((m: any) => {
              const descriptionLength = m.description?.length || 0
              const hasGoodDescription = descriptionLength > 100
              const hasBudget = m.is_paid && m.budget > 0
              const applicantCount = m.applications?.length || 0

              const qualityScore =
                (hasGoodDescription ? 1 : 0) + (hasBudget ? 1 : 0) + (applicantCount > 0 ? 1 : 0)

              return (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{m.title}</td>
                  <td className="px-4 py-3 text-text-muted">{m.startups?.name}</td>
                  <td className="px-4 py-3 text-text-muted">{applicantCount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        qualityScore >= 3
                          ? 'bg-accent-bg text-accent-text'
                          : qualityScore >= 1
                          ? 'bg-bg-main border border-border text-text-muted'
                          : 'bg-red-950 text-red-400'
                      }`}
                    >
                      {qualityScore}/3
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted capitalize">{m.status}</td>
                  <td className="px-4 py-3">
                    <FeatureToggle missionId={m.id} initiallyFeatured={m.is_featured} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}