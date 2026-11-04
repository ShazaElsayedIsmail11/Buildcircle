'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DndContext, type DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { supabase } from '@/lib/supabase'
import { Pencil, Trash2, X } from 'lucide-react'

type Task = {
  id: string
  title: string
  status: string
  priority: string
  assignee_id: string | null
  description: string | null
  due_date: string | null
}

type SquadMember = {
  builder_id: string
  users: { full_name: string } | null
}

const columns = [
  { id: 'todo', title: 'Todo' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Ready for Review' },
  { id: 'done', title: 'Done' },
]

const priorityColors: Record<string, string> = {
  high: 'bg-red-950 text-red-400',
  medium: 'bg-accent-bg text-accent-text',
  low: 'bg-bg-main border border-border text-text-muted',
}

function DraggableCard({
  task,
  canDrag,
  assigneeName,
  onOpen,
}: {
  task: Task
  canDrag: boolean
  assigneeName: string
  onOpen: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: !canDrag,
  })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 10 }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex min-w-0 gap-2 rounded-lg border border-border bg-bg-surface p-3 ${isDragging ? 'relative opacity-80' : ''}`}
    >
      {canDrag && (
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="shrink-0 cursor-grab touch-none select-none self-start pt-0.5 text-text-muted active:cursor-grabbing"
          aria-label={`Drag ${task.title}`}
          title="Drag to change status"
        >
          ⋮⋮
        </button>
      )}
      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 text-left"
        title="Open task details"
      >
        <span className={`mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityColors[task.priority] ?? priorityColors.medium}`}>
          {task.priority}
        </span>
        <p className="break-words text-sm font-medium">{task.title}</p>
        <p className="mt-1 text-xs text-text-muted">{assigneeName}</p>
        {task.due_date && (
          <p className="mt-1 text-xs text-text-muted">Due {task.due_date}</p>
        )}
      </button>
    </div>
  )
}

function DroppableColumn({
  id,
  title,
  count,
  children,
}: {
  id: string
  title: string
  count: number
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] min-w-0 rounded-xl border bg-bg-surface p-3 transition ${isOver ? 'border-accent' : 'border-border'}`}
    >
      <h3 className="mb-3 px-1 text-sm font-medium">{title} ({count})</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

export default function KanbanBoard({
  tasks,
  squadMembers,
  isHunter,
  currentUserId,
  isCompleted,
}: {
  tasks: Task[]
  squadMembers: SquadMember[]
  isHunter: boolean
  currentUserId: string
  isCompleted: boolean
}) {
  const router = useRouter()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [assigneeId, setAssigneeId] = useState('')

  const canManage = isHunter && !isCompleted
  const canChangeSelectedStatus = selectedTask !== null && !isCompleted && (
    isHunter || selectedTask.assignee_id === currentUserId
  )

  function canMoveTask(task: Task, nextStatus: string) {
    if (isCompleted || task.status === nextStatus) return false

    if (isHunter) {
      // Only the Hunter can approve a task, and only after review.
      return nextStatus !== 'done' || task.status === 'review'
    }

    if (task.assignee_id !== currentUserId) return false
    return (
      (task.status === 'todo' && nextStatus === 'in_progress') ||
      (task.status === 'in_progress' && nextStatus === 'review')
    )
  }

  function getAssigneeName(id: string | null) {
    if (!id) return 'Unassigned'
    return squadMembers.find((member) => member.builder_id === id)?.users?.full_name ?? 'Unknown builder'
  }

  function openTask(task: Task) {
    setSelectedTask(task)
    setTitle(task.title)
    setDescription(task.description ?? '')
    setPriority(task.priority)
    setDueDate(task.due_date ?? '')
    setAssigneeId(task.assignee_id ?? '')
    setEditing(false)
    setConfirmDelete(false)
    setErrorMessage('')
  }

  function closeTask() {
    if (saving) return
    setSelectedTask(null)
    setEditing(false)
    setConfirmDelete(false)
    setErrorMessage('')
  }

  async function updateStatus(task: Task, newStatus: string) {
    if (!columns.some((column) => column.id === newStatus)) return
    if (!canMoveTask(task, newStatus)) return

    setSaving(true)
    setErrorMessage('')
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id)
        .select('id')
        .single()
      if (error) throw error
      setSelectedTask((current) => current?.id === task.id ? { ...current, status: newStatus } : current)
      router.refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    if (saving || !event.over) return
    const task = tasks.find((item) => item.id === String(event.active.id))
    if (!task) return
    const nextStatus = String(event.over.id)
    if (!canMoveTask(task, nextStatus)) {
      if (task.status !== nextStatus) {
        setErrorMessage('This status change is not allowed for your role or task state')
      }
      return
    }
    await updateStatus(task, nextStatus)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTask || !canManage || !title.trim()) return
    setSaving(true)
    setErrorMessage('')
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: title.trim(),
          description: description.trim(),
          priority,
          due_date: dueDate || null,
          assignee_id: assigneeId || null,
        })
        .eq('id', selectedTask.id)
        .select('id')
        .single()
      if (error) throw error
      setSelectedTask(null)
      setEditing(false)
      router.refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save task')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!selectedTask || !canManage) return
    setSaving(true)
    setErrorMessage('')
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', selectedTask.id)
        .select('id')
        .single()
      if (error) throw error
      setSelectedTask(null)
      setConfirmDelete(false)
      router.refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete task')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <DndContext onDragEnd={handleDragEnd}>
        <p className="mb-3 text-xs text-text-muted">
          Open a card for details. Builders send assigned tasks for review; the Hunter approves them.
        </p>
        {errorMessage && !selectedTask && (
          <p role="alert" className="mb-3 text-sm text-red-400">{errorMessage}</p>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.id)
            return (
              <DroppableColumn key={column.id} id={column.id} title={column.title} count={columnTasks.length}>
                {columnTasks.map((task) => (
                  <DraggableCard
                    key={task.id}
                    task={task}
                    canDrag={!saving && columns.some((column) => canMoveTask(task, column.id))}
                    assigneeName={getAssigneeName(task.assignee_id)}
                    onOpen={() => openTask(task)}
                  />
                ))}
              </DroppableColumn>
            )
          })}
        </div>
      </DndContext>

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) closeTask() }}>
          <div role="dialog" aria-modal="true" aria-label="Task details" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-bg-surface p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Task details</h2>
              <button type="button" onClick={closeTask} disabled={saving} aria-label="Close task details" className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>

            {errorMessage && <p role="alert" className="mb-3 text-sm text-red-400">{errorMessage}</p>}

            {editing && canManage ? (
              <form onSubmit={handleSave} className="space-y-3">
                <label className="block text-sm">Title
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-bg-main px-3 py-2" />
                </label>
                <label className="block text-sm">Description
                  <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-bg-main px-3 py-2" />
                </label>
                <label className="block text-sm">Assignee
                  <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-bg-main px-3 py-2">
                    <option value="">Unassigned</option>
                    {squadMembers.map((member) => <option key={member.builder_id} value={member.builder_id}>{member.users?.full_name ?? 'Builder'}</option>)}
                  </select>
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block text-sm">Priority
                    <select value={priority} onChange={(e) => setPriority(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-bg-main px-3 py-2">
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                    </select>
                  </label>
                  <label className="block text-sm">Due date
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-bg-main px-3 py-2" />
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => { setEditing(false); setErrorMessage('') }} disabled={saving} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
                  <button type="submit" disabled={saving || !title.trim()} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg-main disabled:opacity-50">{saving ? 'Saving...' : 'Save changes'}</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="break-words font-semibold">{selectedTask.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-text-muted">{selectedTask.description || 'No description'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-text-muted">Assignee</p><p>{getAssigneeName(selectedTask.assignee_id)}</p></div>
                  <div><p className="text-xs text-text-muted">Priority</p><p className="capitalize">{selectedTask.priority}</p></div>
                  <div><p className="text-xs text-text-muted">Due date</p><p>{selectedTask.due_date || 'Not set'}</p></div>
                  <div><p className="text-xs text-text-muted">Status</p><p className="capitalize">{selectedTask.status.replace('_', ' ')}</p></div>
                </div>
                {canChangeSelectedStatus && (
                  <div>
                    <p className="mb-2 text-xs text-text-muted">Change status</p>
                    <div className="flex flex-wrap gap-2">
                      {columns.filter((column) => canMoveTask(selectedTask, column.id)).map((column) => (
                        <button
                          key={column.id}
                          type="button"
                          disabled={saving || selectedTask.status === column.id}
                          onClick={() => void updateStatus(selectedTask, column.id)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs disabled:opacity-40"
                        >
                          {column.title}
                        </button>
                      ))}
                    </div>
                    {columns.every((column) => !canMoveTask(selectedTask, column.id)) && (
                      <p className="text-xs text-text-muted">No status changes available.</p>
                    )}
                  </div>
                )}
                {canManage && (
                  <div className="flex gap-3 border-t border-border pt-4">
                    <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-1 text-sm text-accent-text"><Pencil size={15} /> Edit task</button>
                    <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-1 text-sm text-red-400"><Trash2 size={15} /> Delete</button>
                  </div>
                )}
                {confirmDelete && canManage && (
                  <div className="rounded-lg border border-red-400/40 p-3">
                    <p className="mb-3 text-sm">Delete this task permanently?</p>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setConfirmDelete(false)} disabled={saving} className="rounded-lg border border-border px-3 py-1.5 text-sm">Cancel</button>
                      <button type="button" onClick={() => void handleDelete()} disabled={saving} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50">{saving ? 'Deleting...' : 'Delete task'}</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
