'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GlassCard } from '@/components/glass-card'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, MessageSquare, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import feedbackService from '@/lib/services/feedback-service'

export default function FeedbackPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'suggestion',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSubmitting(true)
      await feedbackService.submitFeedback({
        name: formData.name,
        email: formData.email,
        type: formData.type as 'suggestion' | 'bug' | 'template' | 'other',
        message: formData.message,
      })
      
      toast({
        title: 'Feedback Sent',
        description: 'Thank you for helping us improve!',
        variant: 'default',
      })
      setIsSubmitted(true)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send feedback. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/5 px-6 py-12 lg:pl-80 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Back Link */}
        <Link 
          href="/templates" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Templates
        </Link>

        <GlassCard className="p-6 md:p-8 space-y-6">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-2">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold">Send Feedback</h1>
                <p className="text-sm text-muted-foreground">
                  We value your input! Share your thoughts or report a bug.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="type">Feedback Type</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="suggestion">Feature Suggestion</option>
                    <option value="bug">Report a Bug</option>
                    <option value="template">Request a Template</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what you think..."
                    rows={4}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                </Button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Thank You!</h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Your feedback has been submitted successfully. We appreciate your help in building a better Resume Builder!
              </p>
              <Button asChild className="mt-4 w-full">
                <Link href="/templates">Return to Templates</Link>
              </Button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
