'use client'

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null

  const point = payload[0].payload

  return (
    <div className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-xs">
      <p className="text-text-muted mb-1">{point.date}</p>
      <p className="text-accent-text font-medium">{point.count} activity</p>
    </div>
  )
}

export default function TrendChart({
  data,
  label,
}: {
  data: { date: string; count: number }[]
  label: string
}) {
  return (
    <div className="border border-border rounded-xl p-4 mb-4">
      <p className="text-text-muted text-xs mb-2">{label}</p>
      <ResponsiveContainer width="100%" height={90}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="count"
            stroke="#E85D2C"
            strokeWidth={2}
            dot={false}
          />
          <Tooltip content={<CustomTooltip />} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}