'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function Header() {
  const router = useRouter()
  const { logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      // The logout function in useAuth should handle token removal and redirection.
      // As a fallback, we can manually clear and push.
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Force clear local storage and redirect even if API call fails
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      router.push('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-primary to-accent" />
          <span className="text-lg font-semibold">ResumeBuilder</span>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={handleSignOut}
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isLoggingOut ? 'Signing out...' : 'Sign Out'}
            </span>
          </Button>
        </div>
      </div>
    </header>
  )
}
