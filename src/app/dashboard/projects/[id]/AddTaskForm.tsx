'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/app/Toast'
import { logActivity } from '@/lib/logActivity'
type SquadMember = {
  builder_id: string
  users: { full_name: string } | null
}

export default function AddTaskForm({
  projectId,
  squadMembers,
}: {
  projectId: string
  squadMembers: SquadMember[]
}) {
  const router = useRouter()
  const showToast = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await supabase.from('tasks').insert({
      project_id: projectId,
      title,
      description,
      priority,
      due_date: dueDate || null,
      assignee_id: assigneeId || null,
    })
const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await logActivity(projectId, user.id, 'task_added', `added a new task: "${title}"`)
    }
 setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate('')
    setLoading(false)
    showToast('Task added successfully')
    router.refresh()
  }

  return (
    <form onSubmit={handleAdd} className="bg-bg-surface border border-border rounded-xl p-4 mb-6">
      <input
        type="text"
        required
        placeholder="Task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent mb-2"
      />

      <textarea
        placeholder="Description (optional)"
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent resize-none mb-2"
      />

      <div className="flex gap-2 mb-2">
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className="flex-1 bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">Assign to...</option>
          {squadMembers.map((member) => (
            <option key={member.builder_id} value={member.builder_id}>
              {member.users?.full_name}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add task'}
      </button>
    </form>
  )
}