'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FileText,
  LayoutDashboard,
  Palette,
  BarChart3,
  Settings,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: FileText,
    label: 'My Resumes',
    href: '/resumes',
  },
  {
    icon: Palette,
    label: 'Templates',
    href: '/templates',
  },
  {
    icon: BarChart3,
    label: 'ATS Score',
    href: '/ats-score',
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/settings',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-30 hidden w-64 border-r border-border bg-sidebar/50 backdrop-blur-lg lg:flex flex-col h-screen pt-20">
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-border p-4">
        <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary/50 hover:text-foreground w-full">
          <HelpCircle className="h-5 w-5" />
          <span>Help & Support</span>
        </button>
      </div>
    </aside>
  )
}
