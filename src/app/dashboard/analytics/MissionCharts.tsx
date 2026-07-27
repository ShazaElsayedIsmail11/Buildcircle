'use client'

import {
  BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts'

type Mission = {
  status: string
  is_paid: boolean
  budget: number | null
}

export default function MissionCharts({ missions }: { missions: Mission[] }) {
  const statusCounts = [
    { name: 'Open', count: missions.filter((m) => m.status === 'open').length },
    { name: 'In Progress', count: missions.filter((m) => m.status === 'in_progress').length },
    { name: 'Closed', count: missions.filter((m) => m.status === 'closed').length },
  ]

  const paidCount = missions.filter((m) => m.is_paid).length
  const unpaidCount = missions.length - paidCount

  const paidData = [
    { name: 'Paid', value: paidCount },
    { name: 'Unpaid', value: unpaidCount },
  ]

  const totalBudget = missions.reduce((sum, m) => sum + (m.budget || 0), 0)
return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-bg-surface border border-border rounded-xl p-5">
          <p className="text-2xl font-semibold">{missions.length}</p>
          <p className="text-text-muted text-xs">Total missions</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-5">
          <p className="text-2xl font-semibold">{statusCounts[0].count}</p>
          <p className="text-text-muted text-xs">Currently open</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-5">
          <p className="text-2xl font-semibold text-accent-text">${totalBudget}</p>
          <p className="text-text-muted text-xs">Total budget posted</p>
        </div>
      </div>

      <div className="bg-bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-medium mb-4">Missions by status</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={statusCounts}>
            <XAxis dataKey="name" stroke="#8b949e" fontSize={12} />
            <YAxis stroke="#8b949e" fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
            />
            <Bar dataKey="count" fill="#E85D2C" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-medium mb-4">Paid vs unpaid</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={paidData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
              <Cell fill="#E85D2C" />
              <Cell fill="#30363d" />
            </Pie>
            <Tooltip
              contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
