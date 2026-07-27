import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'
import AddTaskForm from './AddTaskForm'
import TaskCard from './TaskCard'
import ProjectChat from './ProjectChat'
import DeliverableForm from './DeliverableForm'
import ReviewForm from './ReviewForm'
import CompleteProjectButton from './CompleteProjectButton'
import Milestones from './Milestones'
import { EmptyState } from '@/app/EmptyState'
import KanbanBoard from './KanbanBoard'
import ActivityTimeline from './ActivityTimeline'
import ProjectTabs from './ProjectTabs'
import CompletionReport from './CompletionReport'
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
        setAll() {},
      },
    }
  )

    
const { data: project } = await supabase
    .from('projects')
    .select('*, missions(title, description, startups(name))')
    .eq('id', id)
    .single()

  if (!project) notFound()
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

const { data: squadMembers } = await supabase
    .from('squad_members')
    .select('builder_id, users(full_name)')
    .eq('squad_id', project.squad_id)

  const { data: messages } = await supabase
    .from('messages')
    .select('*, users(full_name, role)')
    .eq('project_id', id)
    .order('created_at', { ascending: true })

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  const { data: currentProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentUser?.id)
    .single()

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
return (
  <div>
    <h1 className="text-2xl font-semibold mb-1">
      {project.missions?.title}
    </h1>

    <p className="text-text-muted mb-6">Project room</p>

    {project.status === 'completed' ? (
      <div>
        <div className="bg-accent-bg border border-accent text-accent-text text-sm rounded-lg px-4 py-2 mb-6 inline-block">
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
        />
      )
    )}

    <ProjectTabs
      children={{
        board: (
          <>
            {isHunter && project.status !== 'completed' && (
              <AddTaskForm
                projectId={project.id}
                squadMembers={squadMembers || []}
              />
            )}

            <KanbanBoard
              tasks={tasks || []}
              isHunter={isHunter}
              currentUserId={currentUser?.id || ''}
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
                  projectId={project.id}
                  tasks={tasks || []}
                />
              </div>
            )}

            {(!deliverables || deliverables.length === 0) && (
              <EmptyState
                icon="📦"
                title="No deliverables yet"
                subtitle="Submitted work will appear here."
              />
            )}

            <div className="space-y-3">
              {deliverables?.map((item) => (
                <div
                  key={item.id}
                  className="bg-bg-main border border-border rounded-xl p-4"
                >
                  <p className="text-xs text-text-muted mb-1">
                    {item.users?.full_name}
                    {item.tasks?.title && ` · ${item.tasks.title}`}
                  </p>

                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent-text text-sm break-all"
                  >
                    {item.file_url} ↗
                  </a>
                </div>
              ))}
            </div>
          </>
        ),

        activity: (
          <ActivityTimeline activities={activities || []} />
        ),

        chat: (
          <ProjectChat
            projectId={project.id}
            messages={messages || []}
            currentUserId={currentUser?.id || ''}
          />
        ),
      }}
    />

    {isHunter && squadMembers && squadMembers.length > 0 && (
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">
          Review the work
        </h2>

        <ReviewForm
          projectId={project.id}
          squadMembers={squadMembers}
          missionTitle={project.missions?.title || ''}
          startupName={project.missions?.startups?.name || ''}
        />
      </div>
    )}
  </div>
)
} 