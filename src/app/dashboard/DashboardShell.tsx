'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ThemeToggle from '@/app/ThemeToggle'
type Profile = {
  id: string
  full_name: string
  role: 'hunter' | 'builder' | 'admin'
  email: string
} | null

export default function DashboardShell({
  user,
  children,
  unreadMessagesCount,
    unreadNotificationsCount,
}: {
  user: Profile
  children: React.ReactNode
  unreadMessagesCount: number
    unreadNotificationsCount: number
}) {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems =
    user?.role === 'hunter'
      ? [
          { label: 'Overview', href: '/dashboard' },
          { label: 'My Startups', href: '/dashboard/startups' },
          { label: 'Missions', href: '/dashboard/missions' },
          { label: 'Messages', href: '/dashboard/messages' },
           { label: 'Community', href: '/dashboard/community' },
                      { label: 'Groups', href: '/dashboard/groups' },

           { label: 'Analytics', href: '/dashboard/analytics' },
           { label: 'Settings', href: '/dashboard/settings' }
        ]
      : [
          { label: 'Overview', href: '/dashboard' },       
             { label: 'My Profile', href: '/dashboard/profile' },

          { label: 'Explore Startups', href: '/dashboard/explore-startups' },
          { label: 'Explore Missions', href: '/dashboard/explore' },
            { label: 'My Applications', href: '/dashboard/applications' },
            { label: 'Saved', href: '/dashboard/saved' },
          { label: 'My Projects', href: '/dashboard/projects' },
          { label: 'Messages', href: '/dashboard/messages' },
           { label: 'Community', href: '/dashboard/community' },
           { label: 'Groups', href: '/dashboard/groups' },
           { label: 'Settings', href: '/dashboard/settings' }
        ]

  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col p-5">
        <div className="mb-8">
          <p className="text-lg font-semibold">buildcircle</p>
          <span className="text-xs text-accent-text bg-accent-bg px-2 py-0.5 rounded-full capitalize">
            {user?.role}
          </span>
       
<div className="flex items-center gap-2">
          <ThemeToggle />
           <Link href="/dashboard/notifications" className="relative inline-block">
  <span className="text-lg">🔔</span>
  
  {unreadNotificationsCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-accent text-bg-main text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
      {unreadNotificationsCount}
    </span>
  )}
</Link>
        </div>
        </div>

       <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-bg-surface hover:text-text-primary transition"
            >
             {item.label}
              {item.label === 'Messages' && unreadMessagesCount > 0 && (
                <span className="bg-accent text-bg-main text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center ml-auto">
                  {unreadMessagesCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium truncate">{user?.full_name}</p>
          <p className="text-xs text-text-muted truncate mb-3">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-400 hover:text-red-300"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
{/* Main content */}
      <main className="flex-1 p-8 min-w-0">{children}</main>    </div>
  )
}