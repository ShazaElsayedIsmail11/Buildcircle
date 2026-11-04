import { supabase } from './supabase'

export async function notify(userId: string, message: string, link?: string) {
  await supabase.from('notifications').insert({
    user_id: userId,
    message,
    link: link || null,
  })
}