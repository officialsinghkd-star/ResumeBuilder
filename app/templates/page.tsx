'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/glass-card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Star,
  Users,
  Zap,
  Check,
  SearchX,
} from 'lucide-react'
import { RESUME_TEMPLATES } from '@/lib/resume-templates'

const templates = RESUME_TEMPLATES

export default function TemplatesPage() {
  const [activeFilter, setActiveFilter] = useState<string>('all')

  // Filter and sort templates based on active filter
  const filteredTemplates = useMemo(() => {
    switch (activeFilter) {
      case 'featured':
        return templates.filter((t) => t.featured)
      case 'ats':
        return templates.filter((t) =>
          t.features.some((f) => f.toLowerCase().includes('ats'))
        )
      case 'popular':
        return [...templates].sort((a, b) => b.uses - a.uses)
      case 'all':
      default:
        return templates
    }
  }, [activeFilter])

  const filterCounts = useMemo(() => ({
    all: templates.length,
    featured: templates.filter((t) => t.featured).length,
    ats: templates.filter((t) => t.features.some((f) => f.toLowerCase().includes('ats'))).length,
    popular: templates.length,
  }), [])

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/5 px-6 py-8 lg:pl-80">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Resume Templates</h1>
          <p className="text-lg text-muted-foreground">
            Choose from professionally designed templates to get started
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={activeFilter === 'all' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveFilter('all')}
          >
            All Templates ({filterCounts.all})
          </Button>
          <Button 
            variant={activeFilter === 'featured' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveFilter('featured')}
          >
            Featured ({filterCounts.featured})
          </Button>
          <Button 
            variant={activeFilter === 'ats' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveFilter('ats')}
          >
            ATS Optimized ({filterCounts.ats})
          </Button>
          <Button 
            variant={activeFilter === 'popular' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveFilter('popular')}
          >
            Most Popular ({filterCounts.popular})
          </Button>
        </div>

        {/* Active filter indicator */}
        {activeFilter !== 'all' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'}
              {activeFilter === 'popular' && ' sorted by most used'}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-6 px-2"
              onClick={() => setActiveFilter('all')}
            >
              Clear filter
            </Button>
          </div>
        )}

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <GlassCard className="text-center py-16">
            <SearchX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No templates found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              No templates match the selected filter
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setActiveFilter('all')}
            >
              Show All Templates
            </Button>
          </GlassCard>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <GlassCard key={template.id} className="flex flex-col">
                {/* Preview */}
                <div className="mb-4 h-48 bg-secondary/20 rounded-lg flex items-stretch relative overflow-hidden border border-border/50">
                  <div className={`absolute inset-0 opacity-90 ${template.colorClass}`} />
                  <div className="relative z-10 flex-1 m-3 mt-10 bg-white/95 rounded shadow-sm p-2 space-y-1.5 text-left">
                    <div className="h-2 w-2/3 bg-gray-300 rounded" />
                    <div className="h-1.5 w-1/2 bg-gray-200 rounded" />
                    <div className="h-1 w-full bg-gray-100 rounded mt-2" />
                    <div className="h-1 w-5/6 bg-gray-100 rounded" />
                    <div className="h-1 w-4/6 bg-gray-100 rounded" />
                  </div>
                  <div className="absolute top-2 left-2 z-10 text-[10px] font-semibold text-white drop-shadow">
                    {template.name}
                  </div>
                  {template.featured && (
                    <Badge className="absolute top-2 right-2 bg-primary">
                      Featured
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span>{template.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{template.uses.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature) => (
                        <Badge
                          key={feature}
                          variant="secondary"
                          className="text-xs py-0.5"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <Button asChild className="w-full mt-4 gap-2">
                  <Link href={`/resumes/editor?template=${template.id}`}>
                    Use Template <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </GlassCard>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <GlassCard className="text-center py-12">
          <h2 className="text-2xl font-semibold">Can&apos;t find the perfect template?</h2>
          <p className="mt-2 text-muted-foreground">
            We&apos;re adding new templates regularly. Check back soon!
          </p>
          <Button asChild variant="outline" className="mt-6 gap-2">
            <Link href="/feedback">
              <Zap className="h-4 w-4" />
              Send Feedback
            </Link>
          </Button>
        </GlassCard>
      </div>
    </div>
  )
}
