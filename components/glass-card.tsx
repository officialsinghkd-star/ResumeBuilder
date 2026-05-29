import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass rounded-xl p-6 backdrop-blur-xl',
        hover && 'transition-all duration-300 hover:border-primary/20 hover:bg-white/3',
        className
      )}
    >
      {children}
    </div>
  )
}
