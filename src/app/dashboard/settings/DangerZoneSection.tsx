'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DangerZoneSection() {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
const [error,setError]=useState("")
async function handleDelete() {
  setLoading(true)
  setError('')

  try {
    const response = await fetch('/api/account', {
      method: 'DELETE',
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to delete account')
    }

    await supabase.auth.signOut()

    router.push('/')
    router.refresh()
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : 'Something went wrong'
    )
  } finally {
    setLoading(false)
  }
}
  return (
    <div>
      <p className="text-base font-medium mb-1 text-red-400">Danger zone</p>
      <p className="text-text-muted text-xs mb-5">
        Deleting your account is permanent and can&apos;t be undone.
      </p>

      <button
        onClick={() => setShowConfirm(true)}
        className="border border-red-900 text-red-400 rounded-lg px-4 py-2 text-sm font-medium"
      >
        Delete account
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-bg-surface border border-border rounded-2xl p-6 max-w-sm w-[90%]">
            <p className="text-text-primary text-base font-medium mb-2">Delete your account?</p>
            <p className="text-text-muted text-sm mb-5 leading-relaxed">
              This will permanently delete your account and all associated data. This can&apos;t be undone.
            </p>
            {error && (
  <p className="text-red-400 text-sm mb-4">
    {error}
  </p>
)}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="border border-border text-text-muted text-sm px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-900 text-red-100 text-sm font-medium px-4 py-2 rounded-lg"
              >
                {loading ? 'Deleting...' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}