'use client'

import { useState } from 'react'
import AccountSection from './AccountSection'
import SecuritySection from './SecuritySection'
import DangerZoneSection from './DangerZoneSection'

const sections = [
  { id: 'account', label: 'Account' },
  { id: 'security', label: 'Security' },
  { id: 'danger', label: 'Danger zone' },
]

export default function SettingsLayout({ profile }: { profile: any }) {
  const [active, setActive] = useState('account')

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      <div className="flex gap-6">
        <div className="w-40 shrink-0 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActive(section.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                active === section.id
                  ? 'bg-accent-bg text-accent-text'
                  : section.id === 'danger'
                  ? 'text-red-400 hover:bg-bg-surface'
                  : 'text-text-muted hover:bg-bg-surface hover:text-text-primary'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-bg-surface border border-border rounded-xl p-6">
          {active === 'account' && <AccountSection profile={profile} />}
          {active === 'security' && <SecuritySection />}
          {active === 'danger' && <DangerZoneSection />}
        </div>
      </div>
    </div>
  )
}