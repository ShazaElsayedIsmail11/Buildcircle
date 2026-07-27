type Activity = {
  id: string
  description: string
  created_at: string
  users: { full_name: string } | null
}

export default function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Activity</h2>
      <div className="relative pl-6">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-5">
          {activities.map((a) => (
            <div key={a.id} className="relative">
              <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-accent border-2 border-bg-main" />

              <p className="text-sm">
                <span className="text-text-primary font-medium">{a.users?.full_name}</span>{' '}
                <span className="text-text-muted">{a.description}</span>
              </p>
              <p className="text-text-muted text-xs mt-0.5">
                {new Date(a.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}