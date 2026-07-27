type ReportProps = {
  tasks: { status: string }[]
  milestones: { status: string }[]
  deliverables: unknown[]
  createdAt: string
  completedAt: string | null
}

export default function CompletionReport({
  tasks,
  milestones,
  deliverables,
  createdAt,
  completedAt,
}: ReportProps) {
  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const completedMilestones = milestones.filter((m) => m.status === 'completed').length

  const start = new Date(createdAt)
  const end = completedAt ? new Date(completedAt) : new Date()
  const durationDays = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="bg-bg-surface border border-accent rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">📋 Completion report</h2>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <p className="text-2xl font-semibold text-accent-text">{doneTasks}/{tasks.length}</p>
          <p className="text-text-muted text-xs">Tasks completed</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-accent-text">
            {completedMilestones}/{milestones.length}
          </p>
          <p className="text-text-muted text-xs">Milestones reached</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-accent-text">{deliverables.length}</p>
          <p className="text-text-muted text-xs">Deliverables submitted</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-accent-text">{durationDays}</p>
          <p className="text-text-muted text-xs">Days to complete</p>
        </div>
      </div>
    </div>
  )
}