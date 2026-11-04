'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { logActivity } from '@/lib/logActivity'
import { notify } from '@/lib/notify'

type TaskOption = { id: string; title: string }
type DeliverableOption = {
  id: string
  task_id: string | null
  file_url: string
  status: string
  uploaded_by: string
  previous_version_id: string | null
}

type Props = {
  projectId: string
  tasks: TaskOption[]
  hunterId: string
  deliverables: DeliverableOption[]
}

export default function DeliverableForm({ projectId, tasks, hunterId, deliverables }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileUrl, setFileUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [taskId, setTaskId] = useState('')
  const [previousVersionId, setPreviousVersionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // A reviewed submission can be revised once; the next revision becomes the new version.
  // Only submissions owned by the signed-in builder are passed from page.tsx.
  const availableRevisions = deliverables.filter(
    (item) =>
      item.status === 'changes_requested' &&
      !deliverables.some((version) => version.previous_version_id === item.id)
  )

  function selectPreviousVersion(value: string) {
    setPreviousVersionId(value)
    if (value) {
      const previous = availableRevisions.find((item) => item.id === value)
      setTaskId(previous?.task_id ?? '')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loading || (!file && !fileUrl.trim())) return

    setLoading(true)
    setErrorMessage('')

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) throw new Error('Please sign in to submit a deliverable.')

      const previous = previousVersionId
        ? availableRevisions.find((item) => item.id === previousVersionId)
        : null

      if (previousVersionId && !previous) {
        throw new Error('This version is no longer available for resubmission.')
      }
      if (previous && previous.uploaded_by !== user.id) {
        throw new Error('You can only revise your own deliverables.')
      }

      let finalUrl = fileUrl.trim()

      if (file) {
        const filePath = `${projectId}/${crypto.randomUUID()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('deliverables')
          .upload(filePath, file)
        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('deliverables')
          .getPublicUrl(filePath)
        finalUrl = publicUrlData.publicUrl
      }

      const { error: insertError } = await supabase.from('deliverables').insert({
        project_id: projectId,
        task_id: previous ? previous.task_id : (taskId || null),
        file_url: finalUrl,
        uploaded_by: user.id,
        previous_version_id: previousVersionId || null,
        // status is omitted on purpose: database DEFAULT sets it to 'pending'.
      })
      if (insertError) throw insertError

      setFileUrl('')
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setTaskId('')
      setPreviousVersionId('')
      router.refresh()

      // Notification and activity failures should not turn a saved submission into a failure.
      try {
        if (hunterId) {
          await notify(
            hunterId,
            previous ? 'A revised deliverable was submitted' : 'A new deliverable was submitted',
            `/dashboard/projects/${projectId}`
          )
        }
        await logActivity(
          projectId,
          user.id,
          'deliverable_submitted',
          previous ? 'submitted a revised deliverable' : 'submitted a deliverable'
        )
      } catch (notifyError) {
        console.error('Deliverable saved; notification or activity logging failed:', notifyError)
      }
    } catch (error) {
      console.error('Deliverable submission failed:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit deliverable')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-bg-surface border border-border rounded-xl p-5 mb-6">
      <h3 className="text-sm font-medium mb-3">Submit a deliverable</h3>

      <label htmlFor="previous-deliverable" className="block text-xs text-text-muted mb-1">
        Submission type
      </label>
      <select
        id="previous-deliverable"
        value={previousVersionId}
        onChange={(e) => selectPreviousVersion(e.target.value)}
        disabled={loading}
        className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent mb-3"
      >
        <option value="">New deliverable</option>
        {availableRevisions.map((item) => (
          <option key={item.id} value={item.id}>
            Revise: {tasks.find((task) => task.id === item.task_id)?.title ?? 'Unlinked deliverable'} · {item.id.slice(0, 8)}
          </option>
        ))}
      </select>

      {tasks.length > 0 && (
        <select
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          disabled={loading || Boolean(previousVersionId)}
          className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent mb-3 disabled:opacity-60"
        >
          <option value="">Not linked to a specific task</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>{task.title}</option>
          ))}
        </select>
      )}
      {previousVersionId && (
        <p className="text-xs text-text-muted mb-3">
          The revision keeps the original task and starts as Pending Review.
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        disabled={loading}
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="w-full mb-3 text-sm text-text-muted file:bg-bg-main file:border file:border-border file:rounded-lg file:px-3 file:py-1.5 file:mr-3 file:text-text-primary file:text-xs"
      />
      <p className="text-text-muted text-xs mb-3">— or paste a link instead —</p>
      <div className="flex gap-2 min-w-0">
        <input
          type="url"
          placeholder="https://drive.google.com/... or https://github.com/..."
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          disabled={loading}
          className="min-w-0 flex-1 bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading || (!file && !fileUrl.trim())}
          className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
      {errorMessage && <p role="alert" className="mt-3 text-sm text-red-400">{errorMessage}</p>}
    </form>
  )
}
