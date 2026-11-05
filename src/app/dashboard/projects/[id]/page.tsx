import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'

import AddTaskForm from './AddTaskForm'
import ProjectChat from './ProjectChat'
import DeliverableForm from './DeliverableForm'
import ReviewForm from './ReviewForm'
import CompleteProjectButton from './CompleteProjectButton'
import Milestones from './Milestones'
import KanbanBoard from './KanbanBoard'
import ActivityTimeline from './ActivityTimeline'
import ProjectTabs from './ProjectTabs'
import CompletionReport from './CompletionReport'
import ProjectOverview from './ProjectOverview'
import { EmptyState } from '@/app/EmptyState'
import DeliverableReview from './DeliverableReview'
export default async function ProjectRoom({
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

        setAll() {
          // Cookies cannot be updated directly inside this Server Component.
        },
      },
    }
  )

  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      missions(
        title,
        description,
        startups(
          name,
          hunter_id
        )
      )
    `)
    .eq('id', id)
    .single()

  if (!project) {
    notFound()
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: true })

  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', id)
    .order('due_date', { ascending: true })
const { data: squadMembers, error: membersError } = await supabase
  .from('squad_members')
  .select('builder_id, users(full_name)')
  .eq('squad_id', project.squad_id)

const formattedSquadMembers = (squadMembers || []).map((member) => {
  const user = member.users as
    | { full_name: string }
    | { full_name: string }[]
    | null

  return {
    builder_id: member.builder_id,
    users: Array.isArray(user) ? user[0] ?? null : user,
  }
})

  const { data: messages } = await supabase
    .from('messages')
    .select('*, users(full_name, role)')
    .eq('project_id', id)
    .order('created_at', { ascending: true })

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  let currentProfile: { role: string } | null = null

  if (currentUser) {
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    currentProfile = data
  }

  const isHunter = currentProfile?.role === 'hunter'

  const { data: deliverables } = await supabase
    .from('deliverables')
    .select('*, users(full_name), tasks(title)')
    .eq('project_id', id)
    .order('uploaded_at', { ascending: false })

  const { data: activities } = await supabase
    .from('activity_log')
    .select('*, users(full_name)')
    .eq('project_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  const hunterId = project.missions?.startups?.hunter_id
const { data: hunterProfile } = hunterId
  ? await supabase
      .from('users')
      .select('full_name')
      .eq('id', hunterId)
      .single()
  : { data: null }
  const allMemberIds = Array.from(
    new Set(
      [
        ...(squadMembers?.map((member) => member.builder_id) || []),
        hunterId,
      ].filter(
        (memberId): memberId is string =>
          Boolean(memberId) && memberId !== currentUser?.id
      )
    )
  )

  const isCompleted = project.status === 'completed'

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">
        {project.missions?.title}
      </h1>

      <p className="mb-6 text-text-muted">Project room</p>

      {isCompleted ? (
        <div>
          <div className="mb-6 inline-block rounded-lg border border-accent bg-accent-bg px-4 py-2 text-sm text-accent-text">
            ✓ This project is completed
          </div>

          <CompletionReport
            tasks={tasks || []}
            milestones={milestones || []}
            deliverables={deliverables || []}
            createdAt={project.created_at}
            completedAt={project.completed_at}
          />
        </div>
      ) : (
        isHunter && (
          <CompleteProjectButton
            projectId={project.id}
            missionId={project.mission_id}
            memberIds={allMemberIds}
          />
        )
      )}
<ProjectTabs>
  {{
    overview: (
      <ProjectOverview
        tasks={tasks || []}
        milestones={milestones || []}
        squadMembers={formattedSquadMembers}
        hunterName={hunterProfile?.full_name || 'Unknown hunter'}
      />
    ),

    board: (
      <>
        {isHunter && project.status !== 'completed' && (
          <AddTaskForm
            projectId={project.id}
           squadMembers={formattedSquadMembers}
          />
        )}

        <KanbanBoard
  tasks={tasks || []}
squadMembers={formattedSquadMembers}
  isHunter={isHunter}
  currentUserId={currentUser?.id || ''}
  isCompleted={isCompleted}
/>
      </>
    ),

    milestones: (
      <Milestones
        projectId={project.id}
        milestones={milestones || []}
        isHunter={isHunter}
      />
    ),

    files: (
      <>
        {!isHunter && project.status !== 'completed' && (
          <div className="mb-4">
           <DeliverableForm
  hunterId={hunterId}
  projectId={project.id}
  tasks={tasks || []}
  deliverables={(deliverables || []).filter(
    (item) => item.uploaded_by === currentUser?.id
  )}
/>
          </div>
        )}

        {!deliverables?.length ? (
          <EmptyState
            icon="📦"
            title="No deliverables yet"
            subtitle="Submitted work will appear here."
          />
        ) : (
          <div className="space-y-3">
            {deliverables.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-bg-main p-4"
              >
                <p className="mb-1 text-xs text-text-muted">
                  {item.users?.full_name || 'Unknown user'}
                  {item.tasks?.title && ` · ${item.tasks.title}`}
                </p>

                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-sm text-accent-text hover:underline"
                >
                  {item.file_url} ↗
                </a>
                <p className="mt-2 text-xs text-text-muted">
  Status: {item.status.replaceAll('_', ' ')}
</p>

{item.review_comment && (
  <p className="mt-2 text-sm text-text-muted">
    Hunter feedback: {item.review_comment}
  </p>
)}

{isHunter && !isCompleted && item.status === 'pending' && (
<DeliverableReview
  deliverableId={item.id}
  projectId={project.id}
  builderId={item.uploaded_by}
/>
)}
              </div>
            ))}
          </div>
        )}
      </>
    ),

    activity: (
      <ActivityTimeline activities={activities || []} />
    ),

    chat: (
      <ProjectChat
        otherMemberIds={allMemberIds}
        projectId={project.id}
        messages={messages || []}
        currentUserId={currentUser?.id || ''}
      />
    ),
  }}
</ProjectTabs>

      {isHunter &&
        !isCompleted &&
        squadMembers &&
        squadMembers.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">
              Review the work
            </h2>

            <ReviewForm
              projectId={project.id}
              squadMembers={formattedSquadMembers}
              missionTitle={project.missions?.title || ''}
              startupName={project.missions?.startups?.name || ''}
            />
          </div>
        )}
    </div>
  )
}