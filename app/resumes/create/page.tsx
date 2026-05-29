'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/glass-card'
import { AlertCircle, ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'
import resumeService from '@/lib/services/resume-service'
import { useAuth } from '@/hooks/use-auth'

export default function CreateResumePage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  const [error, setError] = useState('')

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      router.push('/login?redirect=/resumes/create')
      return
    }

    let cancelled = false

    async function createResume() {
      try {
        const params = new URLSearchParams(window.location.search)
        const template = params.get('template') || 'professional-teal'
        const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
        const resume = await resumeService.createResume({
          title: `My Resume - ${new Date().toLocaleDateString()}`,
          templateId: template,
          personalInfo: {
            name: fullName || 'Your Name',
            email: user?.email || 'you@example.com',
            phone: user?.phone || '',
            location: '',
            website: '',
          },
          summary: '',
          experience: [],
          education: [],
          skills: [],
          status: 'draft',
        })

        if (!cancelled) {
          router.replace(`/resumes/editor?id=${resume._id}`)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not create resume')
        }
      }
    }

    createResume()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, loading, router, user])

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/5 px-6 py-8 lg:pl-80">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/resumes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Creating New Resume</h1>
        </div>

        <GlassCard className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              {error ? (
                <AlertCircle className="h-6 w-6 text-destructive" />
              ) : (
                <FileText className="h-6 w-6 text-primary" />
              )}
            </div>
          </div>
          <h2 className="text-lg font-semibold mb-2">
            {error ? 'Creation failed' : 'Preparing your resume...'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {error || 'Creating a saved draft and opening it in the editor.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild variant="outline">
              <Link href="/resumes">Back to Resumes</Link>
            </Button>
            {error && (
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
