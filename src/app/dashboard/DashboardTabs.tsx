'use client'

import { useState } from 'react'

export default function DashboardTabs({
  children,
}: {
  children: Record<string, React.ReactNode>
}) {
  const [active, setActive] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Projects' },
    { id: 'missions', label: 'Missions' },
  ]

  return (
    <div>
      <div className="flex gap-6 border-b border-border mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`text-sm pb-2.5 -mb-px transition ${
              active === tab.id
                ? 'text-text-primary border-b-2 border-accent'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {children[active]}
    </div>
  )
}