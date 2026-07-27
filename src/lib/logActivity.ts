import { supabase } from './supabase'

export async function logActivity(
  projectId: string,
  actorId: string,
  actionType: string,
  description: string
) {
  await supabase.from('activity_log').insert({
    project_id: projectId,
    actor_id: actorId,
    action_type: actionType,
    description,
  })
}