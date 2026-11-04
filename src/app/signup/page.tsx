'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SignUp() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'hunter' | 'builder'>('builder')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
const [signupSuccess, setSignupSuccess] = useState(false)
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    if (data.session) {
      router.push('/dashboard')
    } else {
      setSignupSuccess(true)
    }
  }
  
  

  if (signupSuccess) {
    return (
      <main className="min-h-screen bg-bg-main text-text-primary flex items-center justify-center px-4">
        <div className="bg-bg-surface border border-accent rounded-xl p-8 w-full max-w-md text-center">
          <div className="text-3xl mb-3">📧</div>
          <h1 className="text-xl font-semibold mb-2">Check your email</h1>
          <p className="text-text-muted text-sm">
            We sent a confirmation link to <span className="text-text-primary">{email}</span>.
            Click it to activate your account, then log in.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg-main text-text-primary flex items-center justify-center px-4">
      <form
        onSubmit={handleSignUp}
        className="bg-bg-surface border border-border rounded-xl p-8 w-full max-w-md "
      >
        <h1 className="text-2xl font-semibold mb-1">Create your account</h1>
        <p className="text-text-muted mb-6 text-sm">
          Join buildcircle as a Hunter or a Builder
        </p>

        {/* Role selection */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setRole('builder')}
            className={`rounded-lg p-3 text-sm font-medium border transition ${
              role === 'builder'
                ? 'bg-accent-bg border-accent text-accent-text'
                : 'border-border text-text-muted'
            }`}
          >
            Builder
          </button>
          <button
            type="button"
            onClick={() => setRole('hunter')}
            className={`rounded-lg p-3 text-sm font-medium border transition ${
              role === 'hunter'
                ? 'bg-accent-bg border-accent text-accent-text'
                : 'border-border text-text-muted'
            }`}
          >
            Hunter
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-text-muted mb-1">Full name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

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
            minLength={6}
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
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-text-muted text-sm mt-4 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-accent-text">
            Log in
          </Link>
        </p>
      </form>
    </main>
  )
}