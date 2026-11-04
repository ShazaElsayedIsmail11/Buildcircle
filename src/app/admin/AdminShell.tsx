'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { label: 'Overview', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Startups', href: '/admin/startups' },
    { label: 'Reports', href: '/admin/reports' },
    { label: 'Missions', href: '/admin/missions' }
  ]

  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex">
      <aside className="w-64 border-r border-border flex flex-col p-5">
        <div className="mb-8">
          <p className="text-lg font-semibold">buildcircle</p>
          <span className="text-xs text-red-400 bg-red-950 px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-bg-surface hover:text-text-primary transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="text-left text-sm text-red-400 hover:text-red-300"
        >
          Log out
        </button>
      </aside>

      <main className="flex-1 p-8 min-w-0">{children}</main>
    </div>
  )
}