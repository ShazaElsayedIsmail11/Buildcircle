import { supabase } from './supabase'

export async function getOrCreateConversation(userId: string, otherUserId: string) {
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .or(
      `and(user_a.eq.${userId},user_b.eq.${otherUserId}),and(user_a.eq.${otherUserId},user_b.eq.${userId})`
    )
    .maybeSingle()

  if (existing) return existing.id

  const { data: created } = await supabase
    .from('conversations')
    .insert({ user_a: userId, user_b: otherUserId })
    .select()
    .single()

  return created?.id
}