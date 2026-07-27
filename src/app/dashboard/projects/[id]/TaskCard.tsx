'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Task = {
  id: string
  title: string
  status: string
  assignee_id: string | null
  description: string | null
  priority: string
  due_date: string | null
}

export default function TaskCard({
  task,
  isHunter,
  currentUserId,
}: {
  task: Task
  isHunter: boolean
  currentUserId: string
}) {
  const router = useRouter()
const [showConfirm, setShowConfirm] = useState(false)
const isAssignee = task.assignee_id === currentUserId
const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(task.title)
  async function handleStatusChange(newStatus: string) {
    await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id)

    router.refresh()
  }
async function handleDelete() {
    await supabase.from('tasks').delete().eq('id', task.id)
    router.refresh()
  }
  async function handleEdit() {
    await supabase
      .from('tasks')
      .update({ title: editedTitle })
      .eq('id', task.id)

    setIsEditing(false)
    router.refresh()
  }
 const priorityColors: Record<string, string> = {
    high: 'bg-red-950 text-red-400',
    medium: 'bg-accent-bg text-accent-text',
    low: 'bg-bg-main border border-border text-text-muted',
  }

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </span>
        {task.due_date && (
          <span className="text-xs text-text-muted">Due {task.due_date}</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="text-sm bg-bg-main border border-border rounded-md px-2 py-1 outline-none focus:border-accent flex-1 mr-2"
          />
       ) : (
          <div>
            <p className="text-sm font-medium">{task.title}</p>
            {task.description && (
              <p className="text-xs text-text-muted mt-1">{task.description}</p>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted capitalize">{task.status}</span>

          {isHunter && !isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-text-muted hover:text-text-primary"
              >
                Edit
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </>
          )}

          {isEditing && (
            <button
              onClick={handleEdit}
              className="text-xs text-accent-text"
            >
              Save
            </button>
          )}
        </div>
      </div>

      {isAssignee && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => handleStatusChange('todo')}
            className="text-xs border border-border rounded-md px-2 py-1 text-text-muted"
          >
            Todo
          </button>
          <button
            onClick={() => handleStatusChange('in_progress')}
            className="text-xs border border-border rounded-md px-2 py-1 text-text-muted"
          >
            In Progress
          </button>
          <button
            onClick={() => handleStatusChange('done')}
            className="text-xs border border-border rounded-md px-2 py-1 text-text-muted"
          >
            Done
          </button>
        </div>
      )}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-bg-surface border border-border rounded-2xl p-6 max-w-sm w-[90%]">
            <p className="text-text-primary text-base font-medium mb-2">
              Delete this task?
            </p>
            <p className="text-text-muted text-sm mb-5 leading-relaxed">
              This action can&apos;t be undone. The task will be permanently
              removed from the project.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="border border-border text-text-muted text-sm px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition"              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
