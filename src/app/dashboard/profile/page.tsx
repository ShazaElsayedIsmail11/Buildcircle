import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import ProfileForm from './ProfileForm'

export default async function MyProfile() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, full_name, bio, avatar_url')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return <p className="text-red-400 text-sm">Could not load your profile. Please refresh and try again.</p>
  }

  const { data: builderProfile, error: builderError } = await supabase
    .from('builder_profiles')
    .select('skills, github_url, portfolio_links')
    .eq('user_id', user.id)
    .maybeSingle()

  if (builderError) {
    return <p className="text-red-400 text-sm">Could not load builder details. Please refresh and try again.</p>
  }

  return (
    <div className="max-w-3xl mx-auto">
      <ProfileForm profile={profile} builderProfile={builderProfile} />
    </div>
  )
}
