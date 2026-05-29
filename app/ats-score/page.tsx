'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/stat-card'
import { GlassCard } from '@/components/glass-card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import resumeService, { Resume } from '@/lib/services/resume-service'
import {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap,
  FileText,
  ArrowRight,
  Download,
} from 'lucide-react'

type Improvement = {
  type: string
  suggestion: string
  impact: 'high' | 'medium' | 'low' | string
}

function ratingFor(score: number) {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Fair'
  return 'Needs work'
}

export default function ATSScorePage() {
  const { toast } = useToast()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [improvements, setImprovements] = useState<Improvement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadResumes() {
      try {
        const params = new URLSearchParams(window.location.search)
        const requestedId = params.get('resumeId') || ''
        const result = await resumeService.getUserResumes(1, 50)
        if (cancelled) return

        const list = result.data || []
        setResumes(list)
        setSelectedResumeId(
          requestedId && list.some((resume) => resume._id === requestedId)
            ? requestedId
            : list[0]?._id || ''
        )
      } catch (error) {
        toast({
          title: 'Unable to load resumes',
          description: error instanceof Error ? error.message : 'Please try again.',
          variant: 'destructive',
        })
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadResumes()
    return () => {
      cancelled = true
    }
  }, [toast])

  const selectedResume = useMemo(
    () => resumes.find((resume) => resume._id === selectedResumeId),
    [resumes, selectedResumeId]
  )

  const metrics = useMemo(() => {
    const resume = selectedResume
    if (!resume) return []

    return [
      {
        category: 'Contact & Summary',
        score: Math.min(
          100,
          (resume.personalInfo?.email ? 25 : 0) +
            (resume.personalInfo?.phone ? 25 : 0) +
            (resume.personalInfo?.location ? 20 : 0) +
            (resume.personalInfo?.summary || resume.summary ? 30 : 0)
        ),
        items: [
          { label: 'Email is present', status: resume.personalInfo?.email ? 'pass' : 'warning' },
          { label: 'Phone is present', status: resume.personalInfo?.phone ? 'pass' : 'warning' },
          { label: 'Summary is present', status: resume.personalInfo?.summary || resume.summary ? 'pass' : 'warning' },
        ],
      },
      {
        category: 'Experience',
        score: resume.experience?.length ? 85 : 30,
        items: [
          { label: 'Work history added', status: resume.experience?.length ? 'pass' : 'warning' },
          { label: 'Achievement descriptions', status: resume.experience?.some((item) => item.description) ? 'pass' : 'warning' },
        ],
      },
      {
        category: 'Education & Skills',
        score: Math.min(100, (resume.education?.length ? 45 : 0) + Math.min((resume.skills?.length || 0) * 12, 55)),
        items: [
          { label: 'Education section', status: resume.education?.length ? 'pass' : 'warning' },
          { label: 'Relevant skills listed', status: (resume.skills?.length || 0) >= 4 ? 'pass' : 'warning' },
        ],
      },
    ]
  }, [selectedResume])

  const overallScore =
    score ??
    (metrics.length
      ? Math.round(metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length)
      : 0)

  const handleAnalyze = async () => {
    if (!selectedResumeId || !selectedResume) return

    try {
      setIsAnalyzing(true)
      const [scoreResult, suggestionsResult] = await Promise.all([
        resumeService.scoreResume(selectedResumeId),
        resumeService.getAiSuggestions(selectedResumeId, selectedResume),
      ])

      setScore(scoreResult.score)
      setImprovements(suggestionsResult?.improvements || [])
      toast({
        title: 'Analysis complete',
        description: `ATS score updated to ${scoreResult.score}/100.`,
      })
    } catch (error) {
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleExportReport = () => {
    const body = [
      `ATS Score Report: ${selectedResume?.title || 'Resume'}`,
      `Score: ${overallScore}/100`,
      '',
      ...improvements.map((item) => `- [${item.impact}] ${item.suggestion}`),
    ].join('\n')

    const blob = new Blob([body], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'ats-score-report.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/5 px-6 py-8 lg:pl-80">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">ATS Compatibility Score</h1>
          <p className="text-lg text-muted-foreground">
            Analyze a real saved resume using the backend scoring and AI suggestion routes.
          </p>
        </div>

        <GlassCard>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium" htmlFor="resume-select">
                Resume
              </label>
              <select
                id="resume-select"
                value={selectedResumeId}
                onChange={(event) => {
                  setSelectedResumeId(event.target.value)
                  setScore(null)
                  setImprovements([])
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isLoading || resumes.length === 0}
              >
                {resumes.map((resume) => (
                  <option key={resume._id} value={resume._id}>
                    {resume.title}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleAnalyze} disabled={!selectedResumeId || isAnalyzing}>
              <Zap className="h-4 w-4 mr-2" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
            </Button>
          </div>
        </GlassCard>

        {resumes.length === 0 && !isLoading ? (
          <GlassCard className="text-center">
            <p className="text-muted-foreground">Create a resume before running ATS analysis.</p>
            <Button asChild className="mt-4">
              <Link href="/resumes/create">Create Resume</Link>
            </Button>
          </GlassCard>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              <GlassCard className="lg:col-span-2">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Overall Score</h2>
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
                    <div className="space-y-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-bold text-primary">{overallScore}</span>
                        <span className="text-2xl text-muted-foreground">/100</span>
                      </div>
                      <p className="text-xl font-semibold text-accent">{ratingFor(overallScore)}</p>
                    </div>
                    <Progress value={overallScore} className="h-3 flex-1" />
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold mb-4">Recommendations</h3>
                    <div className="space-y-3">
                      {(improvements.length ? improvements : [
                        {
                          type: 'general',
                          suggestion: 'Run analysis to generate backend-powered recommendations.',
                          impact: 'medium',
                        },
                      ]).slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/10 border border-border/50">
                          <TrendingUp className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm capitalize">{item.type}</p>
                            <p className="text-xs text-muted-foreground mt-1">{item.suggestion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>

              <div className="space-y-4">
                <StatCard label="Score" value={`${overallScore}%`} icon={TrendingUp} description={ratingFor(overallScore)} />
                <StatCard label="Resume" value={selectedResume ? '1' : '0'} icon={FileText} description={selectedResume?.title || 'None selected'} />
                <Button asChild className="w-full gap-2">
                  <Link href={selectedResumeId ? `/resumes/editor?id=${selectedResumeId}` : '/resumes/create'}>
                    <Zap className="h-4 w-4" />
                    Improve Score
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Detailed Analysis</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {metrics.map((metric) => (
                  <GlassCard key={metric.category}>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">{metric.category}</h3>
                        <p className="text-2xl font-bold text-primary mt-1">{metric.score}%</p>
                      </div>
                      <div className="space-y-2">
                        {metric.items.map((item) => (
                          <div key={item.label} className="flex items-center gap-2 text-sm">
                            {item.status === 'pass' ? (
                              <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            )}
                            <span className="text-muted-foreground">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

            <GlassCard className="text-center">
              <h2 className="text-xl font-semibold">Export Your ATS Score</h2>
              <p className="mt-2 text-muted-foreground">
                Download a text report with the latest score and recommendations.
              </p>
              <div className="flex items-center gap-3 mt-6 justify-center">
                <Button variant="outline" onClick={handleExportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button asChild>
                  <Link href="/feedback">
                    Send Feedback <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </GlassCard>
          </>
        )}
      </div>
    </div>
  )
}
