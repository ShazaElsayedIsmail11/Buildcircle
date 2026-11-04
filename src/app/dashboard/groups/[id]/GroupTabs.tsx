'use client'

import { useState } from 'react'

export default function GroupTabs({
  children,
}: {
  children: Record<string, React.ReactNode>
}) {
  const [active, setActive] = useState('posts')

  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'chat', label: 'Chat' },
  ]

  return (
    <div>
      <div className="flex gap-1.5 bg-bg-surface border border-border rounded-xl p-1 mb-5 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              active === tab.id
                ? 'bg-accent-bg text-accent-text'
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