'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError('Invalid email or password')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-bg-main text-text-primary flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="bg-bg-surface border border-border rounded-xl p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
        <p className="text-text-muted mb-6 text-sm">
          Log in to your buildcircle account
        </p>

        <div className="mb-4">
          <label className="block text-sm text-text-muted mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-text-muted mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-bg-main rounded-lg py-2.5 font-medium text-sm disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p className="text-text-muted text-sm mt-4 text-center">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-accent-text">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  )
}