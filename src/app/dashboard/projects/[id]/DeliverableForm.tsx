'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { logActivity } from '@/lib/logActivity'
type TaskOption = { id: string; title: string }

export default function DeliverableForm({
  projectId,
  tasks,
}: {
  projectId: string
  tasks: TaskOption[]
}) {  const router = useRouter()
  const [fileUrl, setFileUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [taskId, setTaskId] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    let finalUrl = fileUrl

    if (file) {
      const filePath = `${projectId}/${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('deliverables')
        .upload(filePath, file)

      if (uploadError) {
        setLoading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('deliverables')
        .getPublicUrl(filePath)

      finalUrl = publicUrlData.publicUrl
    }

   await supabase.from('deliverables').insert({
      project_id: projectId,
      task_id: taskId || null,
      file_url: finalUrl,
      uploaded_by: user.id,
    })
await logActivity(projectId, user.id, 'deliverable_submitted', 'submitted a deliverable')
    setFileUrl('')
    setFile(null)
    setTaskId('')
    setLoading(false)
    router.refresh()
  }

   return (
    <form onSubmit={handleSubmit} className="bg-bg-surface border border-border rounded-xl p-5 mb-6">
     <label className="block text-sm text-text-muted mb-2">Submit a deliverable</label>

      {tasks.length > 0 && (
        <select
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent mb-3"
        >
          <option value="">Not linked to a specific task</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      )}

      <div className="mb-3">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-text-muted file:bg-bg-main file:border file:border-border file:rounded-lg file:px-3 file:py-1.5 file:mr-3 file:text-text-primary file:text-xs"
        />
      </div>

      <p className="text-text-muted text-xs mb-3">— or paste a link instead —</p>

      <div className="flex gap-2">
        <input
          type="url"
          placeholder="https://drive.google.com/... or https://github.com/..."
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          className="flex-1 bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading || (!file && !fileUrl)}
          className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  )
}