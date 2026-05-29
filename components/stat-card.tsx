import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  description?: string
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  description,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`glass group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:border-primary/20 hover:bg-white/3 ${className}`}
    >
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="mt-2 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        
        <div className="rounded-lg bg-primary/10 p-3 text-primary transition-all duration-300 group-hover:bg-primary/20">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
