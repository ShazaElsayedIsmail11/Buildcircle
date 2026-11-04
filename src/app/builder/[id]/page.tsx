import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'
import { calculateBadges } from '@/lib/badges'
import MessageButton from './MessageButton'
export default async function BuilderProfile({
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

  const { data: profile } = await supabase
    .from('users')
    .select('*, builder_profiles(*)')
    .eq('id', id)
    .eq('role', 'builder')
    .single()

  if (!profile) notFound()

  const { data: proofOfWork } = await supabase
    .from('proof_of_work')
    .select('*')
    .eq('builder_id', id)
    .order('created_at', { ascending: false })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('builder_id', id)

  const avgRating =
    reviews && reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null
const completedProjectsCount = proofOfWork?.length || 0
  const badges = calculateBadges(
    completedProjectsCount,
    avgRating ? Number(avgRating) : null
  )
  const builderProfile = Array.isArray(profile.builder_profiles)
    ? profile.builder_profiles[0]
    : profile.builder_profiles

  return (
    <div className="min-h-screen bg-bg-main text-text-primary px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-semibold">{profile.full_name}</h1>
            <p className="text-text-muted text-sm">{profile.bio}</p>
            <MessageButton builderId={profile.id} />
          </div>
          {avgRating && (
            <div className="text-right">
              <p className="text-2xl font-semibold text-accent-text">{avgRating}</p>
              <p className="text-text-muted text-xs">
                {reviews?.length} review{reviews?.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
<div className="flex gap-2 mb-6">
          {badges.map((badge) => (
            <span
              key={badge.label}
              className="bg-bg-surface border border-border text-text-primary text-xs font-medium px-3 py-1 rounded-full"
            >
              {badge.emoji} {badge.label}
            </span>
          ))}
        </div>
        {builderProfile?.skills && builderProfile.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {builderProfile.skills.map((skill: string) => (
              <span
                key={skill}
                className="bg-bg-surface border border-border text-text-muted text-xs px-2 py-1 rounded-md"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {builderProfile?.github_url && (
          
           <a href={builderProfile.github_url}
            target="_blank"
            className="text-accent-text text-sm mb-6 inline-block"
          >
            {builderProfile.github_url} ↗
          </a>
        )}

        <h2 className="text-lg font-semibold mb-3 mt-8">Proof of work</h2>

        {(!proofOfWork || proofOfWork.length === 0) && (
          <div className="bg-bg-surface border border-border rounded-xl p-6 text-center">
            <p className="text-text-muted text-sm">No completed projects yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {proofOfWork?.map((item) => (
            <div
              key={item.id}
              className="bg-bg-surface border border-border rounded-xl p-5"
            >
              <p className="text-xs text-text-muted mb-1">{item.startup_name}</p>
              <h3 className="text-sm font-medium mb-2">{item.mission_title}</h3>
              {item.review_summary && (
                <p className="text-text-muted text-sm italic">
                  &ldquo;{item.review_summary}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}