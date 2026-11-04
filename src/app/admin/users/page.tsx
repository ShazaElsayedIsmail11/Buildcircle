import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export default async function AdminUsers() {
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

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Users ({users?.length || 0})</h1>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-surface">
              <th className="text-left px-4 py-3 text-text-muted font-medium">Name</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Email</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Role</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">{u.full_name}</td>
                <td className="px-4 py-3 text-text-muted">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      u.role === 'admin'
                        ? 'bg-red-950 text-red-400'
                        : u.role === 'hunter'
                        ? 'bg-accent-bg text-accent-text'
                        : 'bg-bg-main border border-border text-text-muted'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {new Date(u.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}