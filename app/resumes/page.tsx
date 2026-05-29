'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/glass-card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import resumeService, { Resume } from '@/lib/services/resume-service'
import shareService from '@/lib/services/share-service'
import {
  Plus,
  Eye,
  Download,
  Trash2,
  Copy,
  Share2,
  FileText,
  ArrowRight,
} from 'lucide-react'

export default function ResumesPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // Load resumes on mount
  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const loadResumes = async () => {
      try {
        const data = await resumeService.getUserResumes(1, 20)
        setResumes(data.data || [])
      } catch (error) {
        console.error('Failed to load resumes:', error)
        toast({
          title: 'Error',
          description: 'Failed to load resumes',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadResumes()
  }, [authLoading, isAuthenticated])

  const handlePreview = (resumeId: string) => {
    router.push(`/resumes/editor?id=${resumeId}`)
  }

  const handleShare = async (resumeId: string) => {
    try {
      const shareLink = await shareService.createShareLink(resumeId)
      const url = `${window.location.origin}/share/${shareLink.token}`
      await navigator.clipboard.writeText(url)
      toast({
        title: 'Share link copied',
        description: url,
      })
    } catch (error) {
      toast({
        title: 'Share failed',
        description: error instanceof Error ? error.message : 'Could not create share link',
        variant: 'destructive',
      })
    }
  }

  const handleDownload = async (resumeId: string, resumeName: string) => {
    try {
      setDownloadingId(resumeId)
      await resumeService.downloadPDF(resumeId, `${resumeName}.pdf`)
      toast({
        title: 'Success',
        description: 'Resume downloaded successfully',
        variant: 'default',
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Failed to download PDF',
        variant: 'destructive',
      })
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDuplicate = async (resumeId: string, resumeName: string) => {
    try {
      const resume = await resumeService.getResume(resumeId)
      if (resume) {
        const newResume = await resumeService.createResume({
          title: `${resumeName} (Copy)`,
          personalInfo: resume.personalInfo,
          summary: resume.summary,
          experience: resume.experience,
          education: resume.education,
          skills: resume.skills,
          status: 'draft',
        })
        setResumes([...resumes, newResume])
        toast({
          title: 'Success',
          description: 'Resume duplicated successfully',
          variant: 'default',
        })
      }
    } catch (error) {
      console.error('Duplicate error:', error)
      toast({
        title: 'Error',
        description: 'Failed to duplicate resume',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (resumeId: string, resumeName: string) => {
    const confirmed = window.confirm(`Delete "${resumeName}"? This action cannot be undone.`)
    if (!confirmed) return

    try {
      await resumeService.deleteResume(resumeId)
      setResumes(resumes.filter(r => (r._id || r.id) !== resumeId))
      toast({
        title: 'Success',
        description: 'Resume deleted successfully',
        variant: 'default',
      })
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete resume',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/5 px-6 py-8 lg:pl-80 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading resumes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/5 px-6 py-8 lg:pl-80">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold">My Resumes</h1>
            <p className="mt-2 text-muted-foreground">
              Create, edit, and manage all your resumes in one place
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/resumes/create">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Resume</span>
            </Link>
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            All Resumes
          </Button>
          <Button variant="ghost" size="sm">
            Active
          </Button>
          <Button variant="ghost" size="sm">
            Drafts
          </Button>
          <Button variant="ghost" size="sm">
            Archived
          </Button>
        </div>

        {/* Resumes List */}
        {resumes.length === 0 ? (
          <GlassCard className="text-center py-12">
            <div className="space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No resumes yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first resume to get started
                </p>
              </div>
              <Button asChild>
                <Link href="/resumes/create" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Resume
                </Link>
              </Button>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => {
              const resumeId = resume._id || resume.id || ''
              if (!resumeId) return null
              return (
                <GlassCard
                  key={resumeId}
                  className="flex items-center justify-between p-6"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                      <FileText className="h-6 w-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{resume.title}</h3>
                        <Badge
                          variant={
                            resume.status === 'published'
                              ? 'default'
                              : resume.status === 'draft'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        {resume.templateId && <span>{resume.templateId}</span>}
                        {resume.score && (
                          <>
                            <span>•</span>
                            <span>ATS Score: {resume.score}%</span>
                          </>
                        )}
                        {resume.viewCount !== undefined && (
                          <>
                            <span>•</span>
                            <span>{resume.viewCount} views</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Preview"
                      onClick={() => handlePreview(resumeId)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="Download"
                      onClick={() => handleDownload(resumeId, resume.title)}
                      disabled={downloadingId === resumeId}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="Duplicate"
                      onClick={() => handleDuplicate(resumeId, resume.title)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Share"
                      onClick={() => handleShare(resumeId)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      title="Delete"
                      onClick={() => handleDelete(resumeId, resume.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      asChild
                    >
                      <Link href={`/resumes/editor?id=${resumeId}`} className="gap-1">
                        Edit
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </GlassCard>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
