'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext, DragEndEvent, useDroppable, useDraggable,
} from '@dnd-kit/core'
import { supabase } from '@/lib/supabase'

type Task = {
  id: string
  title: string
  status: string
  priority: string
  assignee_id: string | null
  description: string | null
  due_date: string | null
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-950 text-red-400',
  medium: 'bg-accent-bg text-accent-text',
  low: 'bg-bg-main border border-border text-text-muted',
}

function DraggableCard({ task, canDrag }: { task: Task; canDrag: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
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
      className="bg-bg-surface border border-border rounded-lg p-3 flex gap-2"
    >
      {canDrag && (
        <div
          {...listeners}
          {...attributes}
          className="text-text-muted cursor-grab active:cursor-grabbing select-none pt-0.5"
        >
          ⋮⋮
        </div>
      )}
      <div className="flex-1">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize inline-block mb-2 ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </span>
        <p className="text-sm font-medium">{task.title}</p>
        {task.description && (
          <p className="text-xs text-text-muted mt-1">{task.description}</p>
        )}
        {task.due_date && (
          <p className="text-xs text-text-muted mt-1">Due {task.due_date}</p>
        )}
      </div>
    </div>
  )
}

function DroppableColumn({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`bg-bg-surface border rounded-xl p-3 min-h-[200px] transition ${
        isOver ? 'border-accent' : 'border-border'
      }`}
    >
      <h3 className="text-sm font-medium mb-3 px-1">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

export default function KanbanBoard({
  tasks,
  isHunter,
  currentUserId,
}: {
  tasks: Task[]
  isHunter: boolean
  currentUserId: string
}) {
  const router = useRouter()
  const columns = [
    { id: 'todo', title: 'Todo' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ]

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as string

    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    router.refresh()
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <p className="text-text-muted text-xs mb-3">
        ⋮⋮ Drag tasks between columns to update their status
      </p>
      <div className="grid grid-cols-3 gap-4">
        {columns.map((column) => (
          <DroppableColumn key={column.id} id={column.id} title={column.title}>
            {tasks
              .filter((t) => t.status === column.id)
              .map((task) => (
                <DraggableCard
                  key={task.id}
                  task={task}
                  canDrag={isHunter || task.assignee_id === currentUserId}
                />
              ))}
          </DroppableColumn>
        ))}
      </div>
    </DndContext>
  )
}