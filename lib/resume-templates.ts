/**
 * Canonical resume templates — must match editor preview IDs and PDFService templateId values.
 */
export interface ResumeTemplate {
  id: string
  name: string
  description: string
  rating: number
  uses: number
  featured: boolean
  features: string[]
  colorClass: string
}

export const DEFAULT_TEMPLATE_ID = 'professional-teal'

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: 'professional-teal',
    name: 'Professional Teal',
    description: '2025-ready layout with gradient header and ATS-friendly structure',
    rating: 4.9,
    uses: 3420,
    featured: true,
    features: ['ATS Optimized', 'Gradient Header', 'Modern Sections'],
    colorClass: 'bg-teal-600',
  },
  {
    id: 'corporate-navy',
    name: 'Corporate Navy',
    description: 'Two-column corporate design with timeline experience',
    rating: 4.9,
    uses: 2890,
    featured: true,
    features: ['Two Column', 'Timeline', 'Executive Ready'],
    colorClass: 'bg-blue-900',
  },
  {
    id: 'tech-sidebar',
    name: 'Tech Sidebar',
    description: 'Dark sidebar profile built for engineers and product roles',
    rating: 4.8,
    uses: 2156,
    featured: true,
    features: ['Skills Highlight', 'Two Column', 'Tech Focused'],
    colorClass: 'bg-zinc-800',
  },
  {
    id: 'clean-linear',
    name: 'Clean Linear',
    description: 'Minimal Swiss-style layout with accent rules and strong typography',
    rating: 4.8,
    uses: 1987,
    featured: false,
    features: ['ATS Optimized', 'Single Column', 'Ultra Clean'],
    colorClass: 'bg-violet-600',
  },
  {
    id: 'bold-executive',
    name: 'Bold Executive',
    description: 'Leadership-focused header with competency blocks',
    rating: 4.9,
    uses: 1543,
    featured: true,
    features: ['Executive Summary', 'Premium Look', 'ATS Optimized'],
    colorClass: 'bg-slate-800',
  },
  {
    id: 'creative-split',
    name: 'Creative Split',
    description: 'Color sidebar with skill meters and balanced content flow',
    rating: 4.7,
    uses: 987,
    featured: false,
    features: ['Skill Meters', 'Two Column', 'Visual Layout'],
    colorClass: 'bg-indigo-600',
  },
  {
    id: 'minimalist',
    name: 'Elegant Minimalist',
    description: 'Refined serif typography for law, finance, and consulting',
    rating: 4.8,
    uses: 1765,
    featured: false,
    features: ['Serif Typography', 'Single Column', 'Classic'],
    colorClass: 'bg-stone-700 font-serif',
  },
  {
    id: 'modern-blue',
    name: 'Contemporary Blue',
    description: 'Updated single-column layout with crisp section hierarchy',
    rating: 4.7,
    uses: 1247,
    featured: false,
    features: ['ATS Optimized', 'Clean Layout', 'Single Column'],
    colorClass: 'bg-blue-600',
  },
]

/** Maps legacy numeric IDs from /templates links to real template slugs. */
const LEGACY_TEMPLATE_ID_MAP: Record<string, string> = {
  '1': 'professional-teal',
  '2': 'corporate-navy',
  '3': 'minimalist',
  '4': 'creative-split',
  '5': 'tech-sidebar',
  '6': 'bold-executive',
}

const VALID_IDS = new Set(RESUME_TEMPLATES.map((t) => t.id))

export function resolveTemplateId(raw?: string | null): string {
  if (!raw?.trim()) return DEFAULT_TEMPLATE_ID
  const trimmed = raw.trim()
  const legacy = LEGACY_TEMPLATE_ID_MAP[trimmed]
  if (legacy) return legacy
  if (VALID_IDS.has(trimmed)) return trimmed
  return DEFAULT_TEMPLATE_ID
}

export function getTemplateById(id: string): ResumeTemplate | undefined {
  return RESUME_TEMPLATES.find((t) => t.id === resolveTemplateId(id))
}
