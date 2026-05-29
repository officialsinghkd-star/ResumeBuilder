'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/glass-card'
import {
  FileText,
  Sparkles,
  BarChart3,
  Download,
  Share2,
  Zap,
  ArrowRight,
} from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Multiple Templates',
    description: 'Choose from professionally designed resume templates',
  },
  {
    icon: Sparkles,
    title: 'AI Suggestions',
    description: 'Get intelligent recommendations to improve your resume',
  },
  {
    icon: BarChart3,
    title: 'ATS Optimization',
    description: 'Ensure your resume passes ATS systems with scoring',
  },
  {
    icon: Download,
    title: 'Easy Export',
    description: 'Download as PDF, Word, or share directly online',
  },
  {
    icon: Share2,
    title: 'Easy Sharing',
    description: 'Share your resume with a unique link or QR code',
  },
  {
    icon: Zap,
    title: 'Real-Time Preview',
    description: 'See changes instantly as you edit your resume',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-b from-background via-background to-secondary/5">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-primary to-accent" />
            <span className="text-lg font-semibold">ResumeBuilder</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Button asChild size="sm" className="gap-2">
              <Link href="/signup">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 py-24 text-center">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 top-1/2 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <h1 className="text-balance text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          Build Your Perfect{' '}
          <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            Resume
          </span>
        </h1>
        
        <p className="text-pretty mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Create a professional resume in minutes with our AI-powered builder. Get
          real-time feedback, ATS optimization, and beautiful templates.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" asChild className="gap-2">
            <Link href="/signup">
              Start Building <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#features">
              Learn More
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything You Need
          </h2>
          <p className="mt-4 text-muted-foreground">
            Powerful features to create and optimize your resume
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <GlassCard key={feature.title}>
                <div className="space-y-4">
                  <div className="inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <GlassCard className="text-center">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mt-4 text-muted-foreground">
            Join thousands of job seekers who have built better resumes with ResumeBuilder
          </p>
          <Button size="lg" asChild className="mt-8 gap-2">
            <Link href="/signup">
              Create Your Resume Now <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 ResumeBuilder. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
