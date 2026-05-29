'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GlassCard } from '@/components/glass-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Badge } from '@/components/ui/badge'
import resumeService, { Experience, Education, Skill } from '@/lib/services/resume-service'
import { DEFAULT_TEMPLATE_ID, RESUME_TEMPLATES, resolveTemplateId } from '@/lib/resume-templates'
import { ResumeTemplatePreview } from '@/components/resume-template-preview'
import {
  Plus,
  X,
  Download,
  Save,
  Eye,
  Edit2,
  Zap,
  Trash2,
} from 'lucide-react'

// Helper to format ISO dates to YYYY-MM-DD
const formatDateForInput = (dateString?: string | Date) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  return date.toISOString().split('T')[0]
}

function ResumeEditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { isAuthenticated, loading: authLoading } = useAuth()
  
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  
  const [basicInfo, setBasicInfo] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    summary: 'Experienced software engineer with 5+ years of expertise in full-stack development',
  })

  const [experienceList, setExperienceList] = useState<Experience[]>([])
  const [educationList, setEducationList] = useState<Education[]>([])
  const [skillsList, setSkillsList] = useState<Skill[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>(() =>
    resolveTemplateId(searchParams.get('template') || DEFAULT_TEMPLATE_ID)
  )

  // Suggestions state
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<{ improvements: Array<{ type: string; suggestion: string; impact: string }> }>({ improvements: [] })
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

  // Editing toggle index states
  const [editingExpIndex, setEditingExpIndex] = useState<number | null>(null)
  const [editingEduIndex, setEditingEduIndex] = useState<number | null>(null)

  // Add form toggle states
  const [showAddExp, setShowAddExp] = useState(false)
  const [showAddEdu, setShowAddEdu] = useState(false)

  // Temporary item input states
  const [newExp, setNewExp] = useState<Partial<Experience>>({
    company: '',
    jobTitle: '',
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    description: '',
    location: '',
  })

  const [newEdu, setNewEdu] = useState<Partial<Education>>({
    schoolName: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    currentlyStudying: false,
    description: '',
  })

  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: '',
    proficiency: 'intermediate',
  })

  // Initialize or load resume
  useEffect(() => {
    // Wait for auth to finish loading before making API calls
    if (authLoading) return

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const initializeResume = async () => {
      try {
        const id = searchParams.get('id')
        
        const templateFromUrl = resolveTemplateId(searchParams.get('template'))

        if (id) {
          // Load existing resume
          setResumeId(id)
          const resume = await resumeService.getResume(id)
          if (resume) {
            setBasicInfo({
              ...basicInfo,
              ...(resume.personalInfo || {}),
              summary: resume.personalInfo?.summary || resume.summary || '',
            })
            setSelectedTemplate(
              searchParams.get('template')
                ? templateFromUrl
                : resolveTemplateId(resume.templateId)
            )
            
            if (resume.experience) {
              const formattedExp = resume.experience.map((exp: any) => ({
                ...exp,
                startDate: formatDateForInput(exp.startDate),
                endDate: formatDateForInput(exp.endDate),
              }))
              setExperienceList(formattedExp)
            }
            if (resume.education) {
              const formattedEdu = resume.education.map((edu: any) => ({
                ...edu,
                startDate: formatDateForInput(edu.startDate),
                endDate: formatDateForInput(edu.endDate),
              }))
              setEducationList(formattedEdu)
            }
            if (resume.skills) {
              setSkillsList(resume.skills)
            }
          }
        } else {
          // Create new resume
          const newResume = await resumeService.createResume({
            title: `My Resume - ${new Date().toLocaleDateString()}`,
            personalInfo: basicInfo,
            summary: basicInfo.summary,
            templateId: templateFromUrl,
            status: 'draft',
          })
          setSelectedTemplate(templateFromUrl)
          setResumeId(newResume._id || newResume.id || null)
          toast({
            title: 'Success',
            description: 'New resume created',
            variant: 'default',
          })
        }
      } catch (error) {
        console.error('Error initializing resume:', error)
        toast({
          title: 'Error',
          description: 'Failed to initialize resume',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeResume()
  }, [authLoading, isAuthenticated])

  // Experience handlers
  const handleAddExperience = () => {
    if (!newExp.company || !newExp.jobTitle || !newExp.startDate) {
      toast({
        title: 'Validation Error',
        description: 'Company, Job Title, and Start Date are required.',
        variant: 'destructive',
      })
      return
    }
    setExperienceList([...experienceList, newExp as Experience])
    setNewExp({
      company: '',
      jobTitle: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      description: '',
      location: '',
    })
    setShowAddExp(false)
  }

  const handleUpdateExperience = (index: number, updated: Experience) => {
    if (!updated.company || !updated.jobTitle || !updated.startDate) {
      toast({
        title: 'Validation Error',
        description: 'Company, Job Title, and Start Date are required.',
        variant: 'destructive',
      })
      return
    }
    const newList = [...experienceList]
    newList[index] = updated
    setExperienceList(newList)
    setEditingExpIndex(null)
  }

  const handleDeleteExperience = (index: number) => {
    setExperienceList(experienceList.filter((_, i) => i !== index))
  }

  // Education handlers
  const handleAddEducation = () => {
    if (!newEdu.schoolName || !newEdu.degree || !newEdu.startDate) {
      toast({
        title: 'Validation Error',
        description: 'School Name, Degree, and Start Date are required.',
        variant: 'destructive',
      })
      return
    }
    setEducationList([...educationList, newEdu as Education])
    setNewEdu({
      schoolName: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      currentlyStudying: false,
      description: '',
    })
    setShowAddEdu(false)
  }

  const handleUpdateEducation = (index: number, updated: Education) => {
    if (!updated.schoolName || !updated.degree || !updated.startDate) {
      toast({
        title: 'Validation Error',
        description: 'School Name, Degree, and Start Date are required.',
        variant: 'destructive',
      })
      return
    }
    const newList = [...educationList]
    newList[index] = updated
    setEducationList(newList)
    setEditingEduIndex(null)
  }

  const handleDeleteEducation = (index: number) => {
    setEducationList(educationList.filter((_, i) => i !== index))
  }

  // Skills handlers
  const handleAddSkill = () => {
    if (!newSkill.name) {
      toast({
        title: 'Validation Error',
        description: 'Skill name is required.',
        variant: 'destructive',
      })
      return
    }
    setSkillsList([...skillsList, newSkill as Skill])
    setNewSkill({
      name: '',
      proficiency: 'intermediate',
    })
  }

  const handleDeleteSkill = (index: number) => {
    setSkillsList(skillsList.filter((_, i) => i !== index))
  }

  const handleAiSuggestions = async () => {
    if (!resumeId) return
    try {
      setIsAiLoading(true)
      const content = {
        personalInfo: basicInfo,
        summary: basicInfo.summary,
        experience: experienceList,
        education: educationList,
        skills: skillsList,
      }
      const data = await resumeService.getAiSuggestions(resumeId, content)
      if (data && data.improvements) {
        setSuggestions(data)
      } else if (Array.isArray(data)) {
        setSuggestions({ improvements: data })
      } else {
        setSuggestions({ improvements: [] })
      }
      setIsSuggestionsOpen(true)
    } catch (error) {
      console.error('AI suggestions error:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch AI suggestions',
        variant: 'destructive',
      })
    } finally {
      setIsAiLoading(false)
    }
  }

  const handlePreview = () => {
    setIsPreviewModalOpen(true)
  }

  const handleSave = async () => {
    if (!resumeId) return
    
    try {
      setIsSaving(true)
      await resumeService.updateResume(resumeId, {
        personalInfo: basicInfo,
        summary: basicInfo.summary,
        experience: experienceList,
        education: educationList,
        skills: skillsList,
        templateId: selectedTemplate,
        status: 'draft',
      })
      toast({
        title: 'Success',
        description: 'Resume saved successfully',
        variant: 'default',
      })
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save resume',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!resumeId) {
      toast({
        title: 'Error',
        description: 'Resume not initialized. Please refresh the page.',
        variant: 'destructive',
      })
      return
    }
    
    try {
      setIsDownloading(true)
      await resumeService.downloadPDF(resumeId, `${basicInfo.name}-resume.pdf`)
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
      setIsDownloading(false)
    }
  }

  const templatesList = RESUME_TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    desc: t.description,
    colorClass: t.colorClass,
  }))

  const previewProps = {
    templateId: selectedTemplate,
    basicInfo: {
      name: basicInfo.name,
      email: basicInfo.email,
      phone: basicInfo.phone,
      location: basicInfo.location,
      summary: basicInfo.summary,
    },
    experienceList,
    educationList,
    skillsList,
  }

  const renderActiveTemplate = () => <ResumeTemplatePreview {...previewProps} />

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading resume...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/5">
      {/* Top Action Bar */}
      <div className="sticky top-20 z-30 border-b border-border bg-background/80 backdrop-blur-md px-6 py-4 lg:pl-80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{basicInfo.name}&apos;s Resume</h1>
            <p className="text-xs text-muted-foreground">Editing Draft Resume</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleAiSuggestions}
              disabled={isAiLoading}
            >
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">{isAiLoading ? 'Analyzing...' : 'AI Suggestions'}</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handlePreview}
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
            <Button 
              size="sm" 
              className="gap-2"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 lg:pl-80 lg:pr-6 max-w-7xl mx-auto">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Editor Panel */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="basic" className="w-full">
              <div className="sticky top-32 z-20 bg-background/50 backdrop-blur-sm -mx-6 px-6 py-4 mb-4 border-b border-border">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="sections">Sections</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                </TabsList>
              </div>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4 mt-0">
                <GlassCard>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Personal Information</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={basicInfo.name}
                          onChange={(e) =>
                            setBasicInfo({ ...basicInfo, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={basicInfo.email}
                          onChange={(e) =>
                            setBasicInfo({ ...basicInfo, email: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={basicInfo.phone}
                          onChange={(e) =>
                            setBasicInfo({ ...basicInfo, phone: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={basicInfo.location}
                          onChange={(e) =>
                            setBasicInfo({ ...basicInfo, location: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="summary">Professional Summary</Label>
                      <Textarea
                        id="summary"
                        value={basicInfo.summary}
                        onChange={(e) =>
                          setBasicInfo({ ...basicInfo, summary: e.target.value })
                        }
                        rows={4}
                      />
                    </div>
                  </div>
                </GlassCard>
              </TabsContent>

              {/* Sections Tab */}
              <TabsContent value="sections" className="space-y-6 mt-0">
                {/* Experience Section */}
                <GlassCard className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="text-lg font-semibold">Work Experience</h3>
                    {!showAddExp && (
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowAddExp(true)}>
                        <Plus className="h-4 w-4" /> Add Experience
                      </Button>
                    )}
                  </div>

                  {/* Add Experience Form */}
                  {showAddExp && (
                    <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg space-y-3">
                      <h4 className="font-medium text-sm">Add New Experience</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <Label htmlFor="exp-company">Company *</Label>
                          <Input
                            id="exp-company"
                            value={newExp.company}
                            onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                            placeholder="e.g. Acme Corp"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="exp-title">Job Title *</Label>
                          <Input
                            id="exp-title"
                            value={newExp.jobTitle}
                            onChange={(e) => setNewExp({ ...newExp, jobTitle: e.target.value })}
                            placeholder="e.g. Software Engineer"
                          />
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-1">
                          <Label htmlFor="exp-location">Location</Label>
                          <Input
                            id="exp-location"
                            value={newExp.location}
                            onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
                            placeholder="e.g. San Francisco, CA"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="exp-start">Start Date *</Label>
                          <Input
                            id="exp-start"
                            type="date"
                            value={newExp.startDate}
                            onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="exp-end">End Date</Label>
                          <Input
                            id="exp-end"
                            type="date"
                            value={newExp.currentlyWorking ? '' : newExp.endDate}
                            onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                            disabled={newExp.currentlyWorking}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="exp-current"
                          type="checkbox"
                          checked={newExp.currentlyWorking}
                          onChange={(e) => setNewExp({ ...newExp, currentlyWorking: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="exp-current" className="text-sm font-normal">I currently work here</Label>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="exp-desc">Description</Label>
                        <Textarea
                          id="exp-desc"
                          value={newExp.description}
                          onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                          rows={3}
                          placeholder="Describe your achievements and responsibilities..."
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setShowAddExp(false)
                          setNewExp({ company: '', jobTitle: '', startDate: '', endDate: '', currentlyWorking: false, description: '', location: '' })
                        }}>Cancel</Button>
                        <Button size="sm" onClick={handleAddExperience}>Add</Button>
                      </div>
                    </div>
                  )}

                  {/* Experience List */}
                  <div className="space-y-3">
                    {experienceList.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No experience added yet.</p>
                    ) : (
                      experienceList.map((exp, idx) => (
                        <div key={idx} className="p-4 border border-border rounded-lg space-y-2 bg-secondary/5">
                          {editingExpIndex === idx ? (
                            // Edit Form
                            <div className="space-y-3">
                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-1">
                                  <Label>Company *</Label>
                                  <Input
                                    value={exp.company}
                                    onChange={(e) => {
                                      const newList = [...experienceList]
                                      newList[idx] = { ...exp, company: e.target.value }
                                      setExperienceList(newList)
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>Job Title *</Label>
                                  <Input
                                    value={exp.jobTitle}
                                    onChange={(e) => {
                                      const newList = [...experienceList]
                                      newList[idx] = { ...exp, jobTitle: e.target.value }
                                      setExperienceList(newList)
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="grid gap-3 md:grid-cols-3">
                                <div className="space-y-1">
                                  <Label>Location</Label>
                                  <Input
                                    value={exp.location || ''}
                                    onChange={(e) => {
                                      const newList = [...experienceList]
                                      newList[idx] = { ...exp, location: e.target.value }
                                      setExperienceList(newList)
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>Start Date *</Label>
                                  <Input
                                    type="date"
                                    value={exp.startDate}
                                    onChange={(e) => {
                                      const newList = [...experienceList]
                                      newList[idx] = { ...exp, startDate: e.target.value }
                                      setExperienceList(newList)
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>End Date</Label>
                                  <Input
                                    type="date"
                                    value={exp.currentlyWorking ? '' : exp.endDate || ''}
                                    onChange={(e) => {
                                      const newList = [...experienceList]
                                      newList[idx] = { ...exp, endDate: e.target.value }
                                      setExperienceList(newList)
                                    }}
                                    disabled={exp.currentlyWorking}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={exp.currentlyWorking || false}
                                  onChange={(e) => {
                                    const newList = [...experienceList]
                                    newList[idx] = { ...exp, currentlyWorking: e.target.checked }
                                    setExperienceList(newList)
                                  }}
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label className="text-sm font-normal">I currently work here</Label>
                              </div>
                              <div className="space-y-1">
                                <Label>Description</Label>
                                <Textarea
                                  value={exp.description || ''}
                                  onChange={(e) => {
                                    const newList = [...experienceList]
                                    newList[idx] = { ...exp, description: e.target.value }
                                    setExperienceList(newList)
                                  }}
                                  rows={3}
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" onClick={() => handleUpdateExperience(idx, exp)}>Done</Button>
                              </div>
                            </div>
                          ) : (
                            // Read View
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-sm">{exp.jobTitle} at {exp.company}</h4>
                                {exp.location && <p className="text-xs text-muted-foreground">{exp.location}</p>}
                                <p className="text-xs text-muted-foreground">
                                  {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate || ''}
                                </p>
                                {exp.description && <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{exp.description}</p>}
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingExpIndex(idx)}>
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteExperience(idx)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </GlassCard>

                {/* Education Section */}
                <GlassCard className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="text-lg font-semibold">Education</h3>
                    {!showAddEdu && (
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowAddEdu(true)}>
                        <Plus className="h-4 w-4" /> Add Education
                      </Button>
                    )}
                  </div>

                  {/* Add Education Form */}
                  {showAddEdu && (
                    <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg space-y-3">
                      <h4 className="font-medium text-sm">Add New Education</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <Label htmlFor="edu-school">School Name *</Label>
                          <Input
                            id="edu-school"
                            value={newEdu.schoolName}
                            onChange={(e) => setNewEdu({ ...newEdu, schoolName: e.target.value })}
                            placeholder="e.g. Stanford University"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="edu-degree">Degree *</Label>
                          <Input
                            id="edu-degree"
                            value={newEdu.degree}
                            onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                            placeholder="e.g. Bachelor of Science"
                          />
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-1">
                          <Label htmlFor="edu-field">Field of Study</Label>
                          <Input
                            id="edu-field"
                            value={newEdu.fieldOfStudy}
                            onChange={(e) => setNewEdu({ ...newEdu, fieldOfStudy: e.target.value })}
                            placeholder="e.g. Computer Science"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="edu-start">Start Date *</Label>
                          <Input
                            id="edu-start"
                            type="date"
                            value={newEdu.startDate}
                            onChange={(e) => setNewEdu({ ...newEdu, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="edu-end">End Date</Label>
                          <Input
                            id="edu-end"
                            type="date"
                            value={newEdu.currentlyStudying ? '' : newEdu.endDate}
                            onChange={(e) => setNewEdu({ ...newEdu, endDate: e.target.value })}
                            disabled={newEdu.currentlyStudying}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="edu-current"
                          type="checkbox"
                          checked={newEdu.currentlyStudying}
                          onChange={(e) => setNewEdu({ ...newEdu, currentlyStudying: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="edu-current" className="text-sm font-normal">I currently study here</Label>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="edu-desc">Description</Label>
                        <Textarea
                          id="edu-desc"
                          value={newEdu.description}
                          onChange={(e) => setNewEdu({ ...newEdu, description: e.target.value })}
                          rows={3}
                          placeholder="Describe your courses, achievements..."
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setShowAddEdu(false)
                          setNewEdu({ schoolName: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', currentlyStudying: false, description: '' })
                        }}>Cancel</Button>
                        <Button size="sm" onClick={handleAddEducation}>Add</Button>
                      </div>
                    </div>
                  )}

                  {/* Education List */}
                  <div className="space-y-3">
                    {educationList.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No education added yet.</p>
                    ) : (
                      educationList.map((edu, idx) => (
                        <div key={idx} className="p-4 border border-border rounded-lg space-y-2 bg-secondary/5">
                          {editingEduIndex === idx ? (
                            // Edit Form
                            <div className="space-y-3">
                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-1">
                                  <Label>School Name *</Label>
                                  <Input
                                    value={edu.schoolName}
                                    onChange={(e) => {
                                      const newList = [...educationList]
                                      newList[idx] = { ...edu, schoolName: e.target.value }
                                      setEducationList(newList)
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>Degree *</Label>
                                  <Input
                                    value={edu.degree}
                                    onChange={(e) => {
                                      const newList = [...educationList]
                                      newList[idx] = { ...edu, degree: e.target.value }
                                      setEducationList(newList)
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="grid gap-3 md:grid-cols-3">
                                <div className="space-y-1">
                                  <Label>Field of Study</Label>
                                  <Input
                                    value={edu.fieldOfStudy || ''}
                                    onChange={(e) => {
                                      const newList = [...educationList]
                                      newList[idx] = { ...edu, fieldOfStudy: e.target.value }
                                      setEducationList(newList)
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>Start Date *</Label>
                                  <Input
                                    type="date"
                                    value={edu.startDate}
                                    onChange={(e) => {
                                      const newList = [...educationList]
                                      newList[idx] = { ...edu, startDate: e.target.value }
                                      setEducationList(newList)
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>End Date</Label>
                                  <Input
                                    type="date"
                                    value={edu.currentlyStudying ? '' : edu.endDate || ''}
                                    onChange={(e) => {
                                      const newList = [...educationList]
                                      newList[idx] = { ...edu, endDate: e.target.value }
                                      setEducationList(newList)
                                    }}
                                    disabled={edu.currentlyStudying}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={edu.currentlyStudying || false}
                                  onChange={(e) => {
                                    const newList = [...educationList]
                                    newList[idx] = { ...edu, currentlyStudying: e.target.checked }
                                    setEducationList(newList)
                                  }}
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label className="text-sm font-normal">I currently study here</Label>
                              </div>
                              <div className="space-y-1">
                                <Label>Description</Label>
                                <Textarea
                                  value={edu.description || ''}
                                  onChange={(e) => {
                                    const newList = [...educationList]
                                    newList[idx] = { ...edu, description: e.target.value }
                                    setEducationList(newList)
                                  }}
                                  rows={3}
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" onClick={() => handleUpdateEducation(idx, edu)}>Done</Button>
                              </div>
                            </div>
                          ) : (
                            // Read View
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-sm">{edu.degree} in {edu.fieldOfStudy || 'General'}</h4>
                                <p className="text-xs text-muted-foreground">{edu.schoolName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {edu.startDate} - {edu.currentlyStudying ? 'Present' : edu.endDate || ''}
                                </p>
                                {edu.description && <p className="text-sm text-muted-foreground mt-2">{edu.description}</p>}
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingEduIndex(idx)}>
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteEducation(idx)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </GlassCard>

                {/* Skills Section */}
                <GlassCard className="p-6 space-y-4">
                  <div className="border-b border-border pb-3">
                    <h3 className="text-lg font-semibold">Skills</h3>
                  </div>

                  {/* Add Skill Form Inline */}
                  <div className="flex flex-col sm:flex-row gap-3 items-end p-4 border border-border rounded-lg bg-secondary/5">
                    <div className="space-y-1 w-full sm:flex-1">
                      <Label htmlFor="skill-name">Skill Name</Label>
                      <Input
                        id="skill-name"
                        value={newSkill.name}
                        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                        placeholder="e.g. React.js, Python, Project Management"
                      />
                    </div>
                    <div className="space-y-1 w-full sm:w-48">
                      <Label htmlFor="skill-prof">Proficiency</Label>
                      <select
                        id="skill-prof"
                        value={newSkill.proficiency}
                        onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value as any })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    <Button onClick={handleAddSkill} className="w-full sm:w-auto">Add Skill</Button>
                  </div>

                  {/* Skills Grid */}
                  <div className="flex flex-wrap gap-2">
                    {skillsList.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4 w-full">No skills added yet.</p>
                    ) : (
                      skillsList.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="pl-3 pr-1 py-1 text-sm gap-2">
                          <span>{skill.name}</span>
                          <span className="text-xs text-muted-foreground border-l border-border pl-2 uppercase">{skill.proficiency}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => handleDeleteSkill(idx)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))
                    )}
                  </div>
                </GlassCard>
              </TabsContent>

              {/* Style Tab */}
              <TabsContent value="style" className="space-y-4 mt-0">
                <GlassCard>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Resume Templates</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {templatesList.map((tmpl) => (
                        <button
                          key={tmpl.id}
                          onClick={() => setSelectedTemplate(tmpl.id)}
                          className={`glass rounded-lg p-4 text-left transition-all duration-200 hover:border-primary/20 hover:bg-white/5 border ${
                            selectedTemplate === tmpl.id ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          <div className="h-12 mb-2 rounded bg-secondary/30 flex items-center p-3">
                            <div className={`h-4 w-4 rounded-full ${tmpl.colorClass}`} />
                          </div>
                          <p className="text-sm font-semibold">{tmpl.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{tmpl.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="sticky top-32 h-fit">
            <GlassCard>
              <div className="space-y-4">
                <h3 className="font-semibold">Preview</h3>

                {/* PDF Preview */}
                {renderActiveTemplate()}

                <Button 
                  className="w-full gap-2"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                >
                  <Download className="h-4 w-4" />
                  {isDownloading ? 'Downloading...' : 'Download PDF'}
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* AI Suggestions Modal */}
      {isSuggestionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <GlassCard className="max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">AI Suggestions</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsSuggestionsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {suggestions.improvements && suggestions.improvements.length > 0 ? (
                suggestions.improvements.map((imp, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-secondary/10 border border-border flex items-start gap-3">
                    <Badge variant={imp.impact === 'high' ? 'default' : imp.impact === 'medium' ? 'secondary' : 'outline'} className="capitalize mt-0.5">
                      {imp.impact} Impact
                    </Badge>
                    <div>
                      <p className="font-semibold text-sm capitalize">{imp.type}</p>
                      <p className="text-sm text-muted-foreground mt-1">{imp.suggestion}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No suggestions found. Your resume looks great!
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-2">
              <Button onClick={() => setIsSuggestionsOpen(false)}>Close</Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl w-full bg-slate-900/40 border border-white/10 rounded-xl p-4 sm:p-6 space-y-4 max-h-[90vh] flex flex-col backdrop-blur-md">
            <div className="flex justify-between items-center border-b border-border pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Resume Preview ({templatesList.find(t => t.id === selectedTemplate)?.name})</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsPreviewModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Template Render Container */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-slate-100/5 p-4 rounded-lg flex justify-center">
              <div className="w-full max-w-2xl bg-white rounded-md shadow-2xl h-fit text-left">
                {renderActiveTemplate()}
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-border flex-shrink-0">
              <p className="text-xs text-muted-foreground hidden sm:block">Press Escape or click Close to return to editor</p>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>Close</Button>
                <Button onClick={handleDownloadPDF} disabled={isDownloading} className="gap-2">
                  <Download className="h-4 w-4" />
                  {isDownloading ? 'Downloading...' : 'Download PDF'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ResumePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResumeEditorContent />
    </Suspense>
  )
}
