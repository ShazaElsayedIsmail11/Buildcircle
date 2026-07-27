import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import EditMissionForm from './EditMissionForm'

export default async function EditMission({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  const { data: mission } = await supabase
    .from('missions')
    .select('*')
    .eq('id', id)
    .single()

  if (!mission) notFound()

  return (
    <Suspense fallback={<p className="text-text-muted text-sm">Loading...</p>}>
      <EditMissionForm mission={mission} />
    </Suspense>
  )
}