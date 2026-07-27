'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NewStartup() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('startups')
      .insert({
        hunter_id: user.id,
        name,
        industry,
        description,
        website,
      })
      .select()
      .single()

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push(`/dashboard/startups/${data.id}`)
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-1">Create a startup</h1>
      <p className="text-text-muted mb-6 text-sm">
        Set up your startup profile before posting missions.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-bg-surface border border-border rounded-xl p-6"
      >
        <div className="mb-4">
          <label className="block text-sm text-text-muted mb-1">Startup name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-text-muted mb-1">Industry</label>
          <input
            type="text"
            placeholder="e.g. Fintech, EdTech, SaaS"
            required
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-text-muted mb-1">Description</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent resize-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-text-muted mb-1">Website (optional)</label>
          <input
            type="url"
            placeholder="https://"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition"        >
          {loading ? 'Creating...' : 'Create startup'}
        </button>
      </form>
    </div>
  )
}