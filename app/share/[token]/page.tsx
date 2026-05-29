'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { GlassCard } from '@/components/glass-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import shareService from '@/lib/services/share-service'
import { Resume } from '@/lib/services/resume-service'

export default function SharedResumePage() {
  const params = useParams<{ token: string }>()
  const [resume, setResume] = useState<Resume | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadSharedResume() {
      try {
        const result = await shareService.getSharedResume(params.token)
        if (!cancelled) setResume(result.resume)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Shared resume not found')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadSharedResume()
    return () => {
      cancelled = true
    }
  }, [params.token])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading shared resume...</p>
      </div>
    )
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <GlassCard className="max-w-md text-center p-8">
          <h1 className="text-2xl font-bold">Shared resume unavailable</h1>
          <p className="mt-3 text-muted-foreground">{error}</p>
          <Button asChild className="mt-6">
            <Link href="/">Go home</Link>
          </Button>
        </GlassCard>
      </div>
    )
  }

  const personal = resume.personalInfo || {}
  const fullName = personal.name || [personal.firstName, personal.lastName].filter(Boolean).join(' ')

  return (
    <main className="min-h-screen bg-muted/30 px-6 py-10">
      <article className="mx-auto max-w-3xl bg-background px-8 py-10 shadow-sm">
        <header className="border-b pb-6 text-center">
          <h1 className="text-3xl font-bold">{fullName || resume.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {[personal.email, personal.phone, personal.location, personal.website].filter(Boolean).join(' | ')}
          </p>
        </header>

        {(personal.summary || resume.summary) && (
          <section className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide">Summary</h2>
            <p className="mt-2 text-sm leading-6">{personal.summary || resume.summary}</p>
          </section>
        )}

        {!!resume.experience?.length && (
          <section className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide">Experience</h2>
            <div className="mt-3 space-y-4">
              {resume.experience.map((item, index) => (
                <div key={`${item.company}-${index}`}>
                  <h3 className="font-semibold">{item.jobTitle} at {item.company}</h3>
                  {item.description && <p className="mt-1 text-sm leading-6">{item.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {!!resume.education?.length && (
          <section className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide">Education</h2>
            <div className="mt-3 space-y-3">
              {resume.education.map((item, index) => (
                <div key={`${item.schoolName}-${index}`} className="text-sm">
                  <strong>{item.degree}</strong>, {item.schoolName}
                </div>
              ))}
            </div>
          </section>
        )}

        {!!resume.skills?.length && (
          <section className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide">Skills</h2>
            <p className="mt-2 text-sm">{resume.skills.map((skill) => skill.name).join(', ')}</p>
          </section>
        )}
      </article>
    </main>
  )
}
