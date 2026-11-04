
type Task = {
  id: string
  status: string
  due_date: string | null
}

type Milestone = {
  id: string
  title: string
  status: string
  due_date: string | null
}

type SquadMember = {
  builder_id: string
  users: { full_name: string } | null
}

type Props = {
  tasks: Task[]
  milestones: Milestone[]
  squadMembers: SquadMember[]
  hunterName: string
}

export default function ProjectOverview({
  tasks,
  milestones,
  squadMembers,
  hunterName,
}: Props) {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  const doneTasks = tasks.filter(
    (task) => task.status === 'done'
  ).length

  const progress =
    tasks.length === 0
      ? 0
      : Math.round((doneTasks / tasks.length) * 100)

  const overdueTasks = tasks.filter(
    (task) =>
      task.status !== 'done' &&
      task.due_date !== null &&
      task.due_date < today
  ).length

  const nextMilestone = milestones
    .filter(
      (milestone) =>
        milestone.status !== 'completed' &&
        milestone.due_date !== null
    )
    .sort((a, b) =>
      a.due_date!.localeCompare(b.due_date!)
    )[0]

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-bg-main p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Project progress</h2>
          <span className="font-semibold text-accent-text">
            {progress}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-text-muted">
          {doneTasks} of {tasks.length} tasks completed
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Total tasks', value: tasks.length },
          { label: 'Completed', value: doneTasks },
          { label: 'Overdue', value: overdueTasks },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-bg-main p-4"
          >
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="mt-1 text-xs text-text-muted">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-bg-main p-5">
        <h2 className="mb-3 font-semibold">Next milestone</h2>

        {nextMilestone ? (
          <>
            <p className="text-sm">{nextMilestone.title}</p>
            <p className="mt-1 text-xs text-text-muted">
              Due: {nextMilestone.due_date}
            </p>
          </>
        ) : (
          <p className="text-sm text-text-muted">
            No upcoming milestones
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-bg-main p-5">
        <h2 className="mb-3 font-semibold">
          Team ({squadMembers.length + 1})
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">{hunterName}</span>
            <span className="text-xs text-accent-text">Hunter</span>
          </div>

          {squadMembers.map((member) => (
            <div
              key={member.builder_id}
              className="flex items-center justify-between"
            >
              <span className="text-sm">
                {member.users?.full_name ?? 'Unknown builder'}
              </span>
              <span className="text-xs text-text-muted">Builder</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
