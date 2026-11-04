'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { EmptyState } from '@/app/EmptyState'

type Mission = {
  id: string
  title: string
  description: string
  required_skills: string[]
  is_paid: boolean
  is_featured: boolean
  created_at: string
  startups: { name: string; industry: string } | null
}
export default function ExploreFilters({ missions }: { missions: Mission[] }) {
  const [paidOnly, setPaidOnly] = useState(false)
  const [skillFilter, setSkillFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const filtered = useMemo(() => {
    let result = [...missions]

    if (paidOnly) {
      result = result.filter((m) => m.is_paid)
    }

    if (skillFilter.trim()) {
      const query = skillFilter.toLowerCase()
      result = result.filter((m) =>
        m.required_skills?.some((s) => s.toLowerCase().includes(query))
      )
    }

    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB
    })

    return result
  }, [missions, paidOnly, skillFilter, sortBy])

const featured = missions.filter((m: any) => m.is_featured)

  return (
    <div>
      {featured.length > 0 && (
        <div className="mb-6">
          <p className="text-text-muted text-xs mb-3">⭐ Featured missions</p>
          <div className="grid gap-3">
            {featured.map((m) => (
              <Link
                key={m.id}
                href={`/dashboard/missions/${m.id}`}
                className="bg-accent-bg border border-accent rounded-xl p-4 hover:-translate-y-0.5 transition block"
              >
                <p className="text-accent-text text-sm font-medium">{m.title}</p>
                <p className="text-text-muted text-xs">{m.startups?.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Filter by skill..."
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
        />

        <label className="flex items-center gap-2 text-sm text-text-muted bg-bg-surface border border-border rounded-lg px-3 py-2">
          <input
            type="checkbox"
            checked={paidOnly}
            onChange={(e) => setPaidOnly(e.target.checked)}
            className="accent-[var(--color-accent)]"
          />
          Paid only
        </label>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No missions match your filters"
          subtitle="Try adjusting your filters."
        />
      )}

      <div className="grid gap-4">
        {filtered.map((mission) => (
          <Link
            key={mission.id}
            href={`/dashboard/missions/${mission.id}`}
            className="bg-bg-surface border border-border rounded-xl p-5 hover:border-accent hover:-translate-y-0.5 transition block"
          >
            <div className="flex items-center gap-2 mb-2">
              {mission.is_paid && (
                <span className="bg-accent-bg text-accent-text text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Paid
                </span>
              )}
              <span className="text-text-muted text-xs">
                {mission.startups?.name} · {mission.startups?.industry}
              </span>
            </div>
            <h2 className="text-base font-medium mb-1">{mission.title}</h2>
            <p className="text-text-muted text-sm mb-3 line-clamp-2">
              {mission.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {mission.required_skills?.map((skill) => (
                <span
                  key={skill}
                  className="bg-bg-main border border-border text-text-muted text-xs px-2 py-1 rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}