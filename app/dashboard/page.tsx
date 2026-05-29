'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/glass-card'
import { StatCard } from '@/components/stat-card'
import { useAuth } from '@/hooks/use-auth'
import resumeService, { Resume } from '@/lib/services/resume-service'
import analyticsService from '@/lib/services/analytics-service'
import {
  FileText,
  Plus,
  Eye,
  Download,
  Star,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'

function formatUpdated(date: string) {
  const updated = new Date(date)
  if (Number.isNaN(updated.getTime())) return 'recently'
  const diffHours = Math.max(1, Math.round((Date.now() - updated.getTime()) / 36e5))
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.round(diffHours / 24)}d ago`
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [analytics, setAnalytics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      try {
        setIsLoading(true)
        const [resumeResult, analyticsResult] = await Promise.all([
          resumeService.getUserResumes(1, 5),
          analyticsService.getDashboardAnalytics().catch(() => null),
        ])

        if (cancelled) return
        setResumes(resumeResult.data || [])
        const rawAnalytics = analyticsResult as any
        setAnalytics(rawAnalytics?.analytics || rawAnalytics?.recentActivity || [])
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Dashboard load failed')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadDashboard()
    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(() => {
    const totalViews = resumes.reduce((sum, resume) => sum + (resume.viewCount || 0), 0)
    const totalDownloads = resumes.reduce((sum, resume) => sum + (resume.downloadCount || 0), 0)
    const scored = resumes.filter((resume) => typeof resume.score === 'number')
    const averageScore = scored.length
      ? Math.round(scored.reduce((sum, resume) => sum + (resume.score || 0), 0) / scored.length)
      : 0

    return {
      totalResumes: resumes.length,
      activeResumes: resumes.filter((resume) => resume.status !== 'archived').length,
      totalViews,
      totalDownloads,
      averageScore,
    }
  }, [resumes])

  const handleDownload = async (resume: Resume) => {
    await resumeService.downloadPDF(
      resume._id,
      `${resume.title || 'resume'}.pdf`
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/5 px-6 py-8 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.firstName || 'there'}!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Your live resume workspace and activity overview.
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/resumes/create">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Resume</span>
            </Link>
          </Button>
        </div>

        {error && (
          <GlassCard className="border-destructive/40 text-destructive">
            {error}
          </GlassCard>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Resumes"
            value={isLoading ? '...' : String(stats.totalResumes)}
            icon={FileText}
            description={`${stats.activeResumes} active resumes`}
          />
          <StatCard
            label="Profile Views"
            value={isLoading ? '...' : String(stats.totalViews)}
            icon={Eye}
            description="All-time resume views"
          />
          <StatCard
            label="Downloads"
            value={isLoading ? '...' : String(stats.totalDownloads)}
            icon={Download}
            description="Generated PDF downloads"
          />
          <StatCard
            label="Avg ATS Score"
            value={isLoading ? '...' : `${stats.averageScore}%`}
            icon={TrendingUp}
            description={stats.averageScore >= 85 ? 'Excellent' : 'Keep improving'}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Resumes</h2>
              <Link href="/resumes" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {!isLoading && resumes.length === 0 && (
                <GlassCard className="text-center">
                  <p className="text-sm text-muted-foreground">No resumes yet.</p>
                  <Button asChild className="mt-4">
                    <Link href="/resumes/create">Create your first resume</Link>
                  </Button>
                </GlassCard>
              )}

              {resumes.map((resume) => (
                <GlassCard key={resume._id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{resume.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {resume.templateId || 'default'} - Updated {formatUpdated(resume.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/resumes/editor?id=${resume._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(resume)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Quick Actions</h2>

            <div className="space-y-3">
              <GlassCard>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Improve ATS Score</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Score a resume and get focused suggestions.
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full gap-2">
                    <Link href={resumes[0]?._id ? `/ats-score?resumeId=${resumes[0]._id}` : '/ats-score'}>
                      Start <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">AI Suggestions</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Open the editor and generate content improvements.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => router.push(resumes[0]?._id ? `/resumes/editor?id=${resumes[0]._id}` : '/resumes/create')}
                  >
                    Generate <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Activity</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {analytics.length} tracked events from the API.
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full gap-2">
                    <Link href="/resumes">
                      Explore <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
