'use client'

import { useState } from 'react'

const tabs = [
  { id: 'board', label: 'Board' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'files', label: 'Files' },
  { id: 'activity', label: 'Activity' },
  { id: 'chat', label: 'Chat' },
]

export default function ProjectTabs({
  children,
}: {
  children: Record<string, React.ReactNode>
}) {
  const [activeTab, setActiveTab] = useState('board')

  return (
    <div>
      <div className="flex gap-1.5 bg-bg-surface border border-border rounded-xl p-1 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-center py-2 px-2 rounded-lg text-xs font-medium transition ${
              activeTab === tab.id
                ? 'bg-accent-bg text-accent-text'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-bg-surface border border-border rounded-xl p-5 min-h-[200px]">
        {children[activeTab]}
      </div>
    </div>
  )
}