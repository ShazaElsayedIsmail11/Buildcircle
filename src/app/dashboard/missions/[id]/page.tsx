import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'
import ApplyButton from './ApplyButton'
import ApplicantsList from './ApplicantsList'
import MissionActions from './MissionActions'
export default async function MissionPage({
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

  const { data: mission } = await supabase
    .from('missions')
    .select('*, startups(name, industry, description, hunter_id)')
    .eq('id', id)
    .single()

  if (!mission) {
    notFound()
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isOwner = user?.id === mission.startups?.hunter_id

  let existingApplication = null
  let applications: any[] = []
  let project: { id: string } | null = null

  const { data: existingProject } = await supabase
    .from('projects')
    .select('id')
    .eq('mission_id', id)
    .maybeSingle()

  project = existingProject

  if (isOwner) {
    const { data } = await supabase
      .from('applications')
      .select('*, users(full_name, email)')
      .eq('mission_id', id)
      .order('applied_at', { ascending: false })

    applications = data || []
  } else if (user) {
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('mission_id', id)
      .eq('builder_id', user.id)
      .maybeSingle()

    existingApplication = data
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-2 flex items-center gap-2">
        {mission.is_paid && (
          <span className="rounded-full bg-accent-bg px-2.5 py-0.5 text-xs font-medium text-accent-text">
            Paid{mission.budget ? ` · $${mission.budget}` : ''}
          </span>
        )}

        <span className="text-xs text-text-muted">
          {mission.startups?.name} · {mission.startups?.industry}
        </span>
      </div>

      <h1 className="mb-1 text-2xl font-semibold">{mission.title}</h1>

      <p className="mb-6 text-sm text-text-muted">
        Duration: {mission.duration}
      </p>
{isOwner && <MissionActions mission={mission} />}
      <div className="mb-6 rounded-xl border border-border bg-bg-surface p-6">
        <h2 className="mb-2 text-sm font-medium">Description</h2>

        <p className="mb-4 text-sm leading-relaxed text-text-primary">
          {mission.description}
        </p>

        <h2 className="mb-2 text-sm font-medium">Required skills</h2>

        <div className="flex flex-wrap gap-2">
          {mission.required_skills?.map((skill: string) => (
            <span
              key={skill}
              className="rounded-md border border-border bg-bg-main px-2 py-1 text-xs text-text-muted"
            >
              {skill}
            </span>
          ))}
        </div>
        <br/>
      </div>

      {project && (
        <a
          href={`/dashboard/projects/${project.id}`}
          className="mb-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg-main"
        >
          Open project room →
        </a>
      )}

      {isOwner ? (
        <>
          <h2 className="mb-3 text-lg font-semibold">
            Applicants ({applications.length})
          </h2>

          <ApplicantsList
            missionId={mission.id}
            applications={applications}
          />
        </>
      ) : (
        <ApplyButton
          missionId={mission.id}
          existingApplication={existingApplication}
        />
      )}
    </div>
  )
}