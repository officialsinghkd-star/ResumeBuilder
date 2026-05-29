'use client'

import { Badge } from '@/components/ui/badge'
import type { Education, Experience, Skill } from '@/lib/services/resume-service'
import { resolveTemplateId } from '@/lib/resume-templates'

export interface ResumePreviewData {
  name: string
  email: string
  phone?: string
  location?: string
  summary?: string
}

interface ResumeTemplatePreviewProps {
  templateId: string
  basicInfo: ResumePreviewData
  experienceList: Experience[]
  educationList: Education[]
  skillsList: Skill[]
  className?: string
}

const skillWidth = (p: string) =>
  p === 'expert' ? '100%' : p === 'intermediate' ? '70%' : '35%'

export function ResumeTemplatePreview({
  templateId,
  basicInfo,
  experienceList,
  educationList,
  skillsList,
  className = '',
}: ResumeTemplatePreviewProps) {
  const id = resolveTemplateId(templateId)
  const headline = experienceList[0]?.jobTitle || 'Professional'
  const wrap = `bg-white rounded-lg shadow-md text-left max-h-[60vh] overflow-y-auto ${className}`

  const contactRow = (
    accent: string,
    divider = '•'
  ) => (
    <p className={`text-[10px] mt-1 flex flex-wrap gap-x-2 gap-y-1 ${accent}`}>
      <span>{basicInfo.email}</span>
      {basicInfo.phone && <span>{divider} {basicInfo.phone}</span>}
      {basicInfo.location && <span>{divider} {basicInfo.location}</span>}
    </p>
  )

  /* ——— Professional Teal ——— */
  if (id === 'professional-teal') {
    return (
      <div className={`${wrap} font-sans`}>
        <div className="bg-linear-to-r from-teal-600 to-teal-800 text-white px-6 py-5 rounded-t-lg">
          <h2 className="text-xl font-bold tracking-tight">{basicInfo.name}</h2>
          <p className="text-teal-100 text-xs font-medium mt-0.5">{headline}</p>
          {contactRow('text-teal-50', '|')}
        </div>
        <div className="p-5 space-y-4 text-gray-800">
          {basicInfo.summary && (
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-teal-700 border-l-4 border-teal-600 pl-2 mb-1.5">
                Profile
              </h3>
              <p className="text-[11px] leading-relaxed text-gray-600">{basicInfo.summary}</p>
            </section>
          )}
          {experienceList.length > 0 && (
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-teal-700 border-l-4 border-teal-600 pl-2 mb-2">
                Experience
              </h3>
              <div className="space-y-3">
                {experienceList.map((exp, idx) => (
                  <div key={idx} className="text-[11px]">
                    <div className="flex justify-between gap-2 font-semibold text-gray-900">
                      <span>{exp.jobTitle}</span>
                      <span className="text-[9px] text-gray-500 font-normal shrink-0">
                        {exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate || ''}
                      </span>
                    </div>
                    <p className="text-teal-700 text-[10px] font-medium">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                    {exp.description && <p className="text-gray-600 mt-1 leading-relaxed whitespace-pre-line">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
          {educationList.length > 0 && (
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-teal-700 border-l-4 border-teal-600 pl-2 mb-2">
                Education
              </h3>
              {educationList.map((edu, idx) => (
                <div key={idx} className="text-[11px] mb-2">
                  <div className="flex justify-between font-semibold">
                    <span>{edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}</span>
                    <span className="text-[9px] text-gray-500 font-normal">
                      {edu.startDate} – {edu.currentlyStudying ? 'Present' : edu.endDate || ''}
                    </span>
                  </div>
                  <p className="text-gray-600 text-[10px]">{edu.schoolName}</p>
                </div>
              ))}
            </section>
          )}
          {skillsList.length > 0 && (
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-teal-700 border-l-4 border-teal-600 pl-2 mb-2">
                Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skillsList.map((s, i) => (
                  <span key={i} className="text-[9px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full font-medium capitalize">
                    {s.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    )
  }

  /* ——— Corporate Navy ——— */
  if (id === 'corporate-navy') {
    return (
      <div className={`${wrap} font-sans flex flex-col md:flex-row`}>
        <aside className="md:w-[32%] bg-blue-950 text-white p-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold leading-tight">{basicInfo.name}</h2>
            <p className="text-blue-200 text-[10px] mt-1">{headline}</p>
          </div>
          <div className="text-[10px] space-y-1.5 border-t border-blue-800 pt-3">
            <p className="text-blue-300 text-[9px] font-bold uppercase tracking-wider">Contact</p>
            <p className="break-all">{basicInfo.email}</p>
            {basicInfo.phone && <p>{basicInfo.phone}</p>}
            {basicInfo.location && <p>{basicInfo.location}</p>}
          </div>
          {skillsList.length > 0 && (
            <div className="border-t border-blue-800 pt-3">
              <p className="text-blue-300 text-[9px] font-bold uppercase tracking-wider mb-2">Expertise</p>
              <ul className="text-[10px] space-y-1 text-blue-50">
                {skillsList.map((s, i) => (
                  <li key={i} className="flex justify-between gap-1">
                    <span>{s.name}</span>
                    <span className="text-blue-300 capitalize text-[8px]">{s.proficiency}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
        <main className="md:w-[68%] p-5 space-y-4 text-gray-800">
          {basicInfo.summary && (
            <section>
              <h3 className="text-[10px] font-bold text-blue-900 uppercase tracking-wider border-b-2 border-blue-900 pb-0.5 mb-2">
                Professional Summary
              </h3>
              <p className="text-[11px] leading-relaxed text-gray-600">{basicInfo.summary}</p>
            </section>
          )}
          {experienceList.length > 0 && (
            <section>
              <h3 className="text-[10px] font-bold text-blue-900 uppercase tracking-wider border-b-2 border-blue-900 pb-0.5 mb-3">
                Experience
              </h3>
              <div className="space-y-3 border-l-2 border-blue-200 pl-3 ml-1">
                {experienceList.map((exp, idx) => (
                  <div key={idx} className="relative text-[11px]">
                    <span className="absolute -left-[13px] top-1 w-2 h-2 rounded-full bg-blue-900" />
                    <div className="flex justify-between font-semibold text-gray-900">
                      <span>{exp.jobTitle}</span>
                      <span className="text-[9px] text-gray-500 font-normal">
                        {exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate || ''}
                      </span>
                    </div>
                    <p className="text-blue-800 text-[10px] font-medium">{exp.company}</p>
                    {exp.description && <p className="text-gray-600 mt-1 leading-relaxed whitespace-pre-line">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
          {educationList.length > 0 && (
            <section>
              <h3 className="text-[10px] font-bold text-blue-900 uppercase tracking-wider border-b-2 border-blue-900 pb-0.5 mb-2">
                Education
              </h3>
              {educationList.map((edu, idx) => (
                <div key={idx} className="text-[11px] mb-2">
                  <p className="font-semibold">{edu.degree} — {edu.schoolName}</p>
                  <p className="text-[9px] text-gray-500">
                    {edu.startDate} – {edu.currentlyStudying ? 'Present' : edu.endDate || ''}
                  </p>
                </div>
              ))}
            </section>
          )}
        </main>
      </div>
    )
  }

  /* ——— Tech Sidebar ——— */
  if (id === 'tech-sidebar') {
    return (
      <div className={`${wrap} font-sans flex flex-col md:flex-row`}>
        <aside className="md:w-[34%] bg-zinc-900 text-zinc-100 p-5 space-y-4">
          <h2 className="text-lg font-bold text-white font-mono tracking-tight">{basicInfo.name}</h2>
          <p className="text-emerald-400 text-[10px] font-mono">{headline}</p>
          <div className="text-[10px] space-y-1 font-mono text-zinc-400 border-t border-zinc-700 pt-3">
            <p><span className="text-zinc-500">email</span> {basicInfo.email}</p>
            {basicInfo.phone && <p><span className="text-zinc-500">tel</span> {basicInfo.phone}</p>}
            {basicInfo.location && <p><span className="text-zinc-500">loc</span> {basicInfo.location}</p>}
          </div>
          {skillsList.length > 0 && (
            <div className="border-t border-zinc-700 pt-3">
              <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-2">Stack</p>
              <div className="flex flex-wrap gap-1">
                {skillsList.map((s, i) => (
                  <span key={i} className="text-[8px] font-mono bg-zinc-800 border border-zinc-600 text-emerald-300 px-1.5 py-0.5 rounded">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
        <main className="md:w-[66%] p-5 space-y-4 text-gray-800 bg-zinc-50">
          {basicInfo.summary && (
            <section>
              <h3 className="text-[10px] font-bold uppercase text-zinc-900 tracking-wider mb-1">About</h3>
              <p className="text-[11px] leading-relaxed text-gray-600">{basicInfo.summary}</p>
            </section>
          )}
          {experienceList.length > 0 && (
            <section>
              <h3 className="text-[10px] font-bold uppercase text-zinc-900 tracking-wider mb-2">Experience</h3>
              {experienceList.map((exp, idx) => (
                <div key={idx} className="text-[11px] mb-3 pb-3 border-b border-zinc-200 last:border-0">
                  <div className="flex justify-between font-semibold">
                    <span>{exp.jobTitle}</span>
                    <span className="text-[9px] text-gray-500 font-mono">
                      {exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate || ''}
                    </span>
                  </div>
                  <p className="text-emerald-700 text-[10px] font-medium">{exp.company}</p>
                  {exp.description && <p className="text-gray-600 mt-1 text-[10px] leading-relaxed whitespace-pre-line">{exp.description}</p>}
                </div>
              ))}
            </section>
          )}
          {educationList.length > 0 && (
            <section>
              <h3 className="text-[10px] font-bold uppercase text-zinc-900 tracking-wider mb-2">Education</h3>
              {educationList.map((edu, idx) => (
                <div key={idx} className="text-[11px] mb-2">
                  <p className="font-semibold">{edu.degree}</p>
                  <p className="text-[10px] text-gray-500">{edu.schoolName}</p>
                </div>
              ))}
            </section>
          )}
        </main>
      </div>
    )
  }

  /* ——— Clean Linear ——— */
  if (id === 'clean-linear') {
    return (
      <div className={`${wrap} font-sans p-6 space-y-5`}>
        <header className="border-b-2 border-violet-600 pb-3">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{basicInfo.name}</h2>
          <p className="text-sm text-violet-700 font-medium mt-0.5">{headline}</p>
          {contactRow('text-gray-500')}
        </header>
        {basicInfo.summary && (
          <section>
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Summary</h3>
            <p className="text-[11px] text-gray-700 leading-relaxed">{basicInfo.summary}</p>
          </section>
        )}
        {experienceList.length > 0 && (
          <section>
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Experience</h3>
            <div className="space-y-3">
              {experienceList.map((exp, idx) => (
                <div key={idx} className="text-[11px] grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5">
                  <span className="font-bold text-gray-900 col-span-1">{exp.jobTitle}</span>
                  <span className="text-[9px] text-gray-400 col-span-1 text-right row-span-2">
                    {exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate || ''}
                  </span>
                  <span className="text-violet-700 text-[10px] col-span-1">{exp.company}</span>
                  {exp.description && (
                    <p className="col-span-2 text-gray-600 text-[10px] leading-relaxed whitespace-pre-line mt-1">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        {educationList.length > 0 && (
          <section>
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Education</h3>
            {educationList.map((edu, idx) => (
              <div key={idx} className="text-[11px] mb-2 flex justify-between">
                <span><strong>{edu.degree}</strong> · {edu.schoolName}</span>
                <span className="text-[9px] text-gray-400">
                  {edu.startDate} – {edu.currentlyStudying ? 'Present' : edu.endDate || ''}
                </span>
              </div>
            ))}
          </section>
        )}
        {skillsList.length > 0 && (
          <section>
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Skills</h3>
            <p className="text-[11px] text-gray-700">{skillsList.map((s) => s.name).join('  ·  ')}</p>
          </section>
        )}
      </div>
    )
  }

  /* ——— Creative Split (existing, kept) ——— */
  if (id === 'creative-split') {
    return (
      <div className={`${wrap} font-sans flex flex-col md:flex-row`}>
        <div className="bg-indigo-900 text-white p-5 md:w-[35%] space-y-5">
          <div>
            <h2 className="text-lg font-bold leading-tight">{basicInfo.name}</h2>
            <p className="text-[10px] text-indigo-200">{headline}</p>
          </div>
          <div className="space-y-2 text-[11px] border-t border-indigo-800 pt-3">
            <p className="break-all">{basicInfo.email}</p>
            {basicInfo.phone && <p>{basicInfo.phone}</p>}
            {basicInfo.location && <p>{basicInfo.location}</p>}
          </div>
          {skillsList.length > 0 && (
            <div className="space-y-2 border-t border-indigo-800 pt-3">
              {skillsList.map((skill, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span>{skill.name}</span>
                    <span className="opacity-75 uppercase text-[8px]">{skill.proficiency}</span>
                  </div>
                  <div className="h-1 bg-indigo-950 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: skillWidth(skill.proficiency) }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-5 md:w-[65%] space-y-4 text-gray-800">
          {basicInfo.summary && <p className="text-[11px] text-gray-700 leading-relaxed">{basicInfo.summary}</p>}
          {experienceList.map((exp, idx) => (
            <div key={idx} className="text-[11px]">
              <div className="flex justify-between font-semibold">
                <span>{exp.jobTitle}</span>
                <span className="text-[9px] text-gray-500">{exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate || ''}</span>
              </div>
              <p className="text-indigo-600 text-[10px]">{exp.company}</p>
              {exp.description && <p className="text-gray-600 mt-1 whitespace-pre-line text-[10px]">{exp.description}</p>}
            </div>
          ))}
          {educationList.map((edu, idx) => (
            <div key={idx} className="text-[11px]">
              <p className="font-semibold">{edu.degree} — {edu.schoolName}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ——— Bold Executive ——— */
  if (id === 'bold-executive') {
    return (
      <div className={`${wrap} font-sans p-0 space-y-0`}>
        <div className="bg-slate-800 text-white px-6 py-5 flex flex-col md:flex-row justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider">{basicInfo.name}</h2>
            <p className="text-slate-300 text-xs mt-1">{headline}</p>
          </div>
          <div className="text-[10px] text-slate-300 md:text-right space-y-0.5">
            <p>{basicInfo.email}</p>
            {basicInfo.phone && <p>{basicInfo.phone}</p>}
            {basicInfo.location && <p>{basicInfo.location}</p>}
          </div>
        </div>
        <div className="p-5 space-y-4">
          {basicInfo.summary && (
            <section>
              <h3 className="bg-slate-100 text-slate-800 px-2 py-1 text-[10px] font-bold uppercase mb-2">Executive Summary</h3>
              <p className="text-[11px] text-gray-700 leading-relaxed">{basicInfo.summary}</p>
            </section>
          )}
          {experienceList.length > 0 && (
            <section>
              <h3 className="bg-slate-100 text-slate-800 px-2 py-1 text-[10px] font-bold uppercase mb-2">Experience</h3>
              {experienceList.map((exp, idx) => (
                <div key={idx} className="text-[11px] mb-2">
                  <div className="flex justify-between font-semibold">
                    <span>{exp.jobTitle} · {exp.company}</span>
                    <span className="text-[9px] text-gray-500">{exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate || ''}</span>
                  </div>
                  {exp.description && <p className="text-gray-600 mt-1 whitespace-pre-line">{exp.description}</p>}
                </div>
              ))}
            </section>
          )}
          {skillsList.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {skillsList.map((s, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] capitalize">{s.name}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ——— Minimalist ——— */
  if (id === 'minimalist') {
    return (
      <div className={`${wrap} font-serif text-center p-6 space-y-4`}>
        <h2 className="text-2xl uppercase tracking-wide text-gray-900">{basicInfo.name}</h2>
        <p className="text-xs text-gray-500 font-sans">{[basicInfo.email, basicInfo.phone, basicInfo.location].filter(Boolean).join(' · ')}</p>
        {basicInfo.summary && <p className="text-xs italic text-gray-700 max-w-md mx-auto leading-relaxed">{basicInfo.summary}</p>}
        <div className="text-left text-xs space-y-4 font-sans">
          {experienceList.map((exp, idx) => (
            <div key={idx}>
              <div className="flex justify-between font-semibold">
                <span>{exp.jobTitle}</span>
                <span className="text-gray-500 text-[10px]">{exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate || ''}</span>
              </div>
              <p className="italic text-gray-600">{exp.company}</p>
              {exp.description && <p className="text-gray-700 mt-1 whitespace-pre-line">{exp.description}</p>}
            </div>
          ))}
          {educationList.map((edu, idx) => (
            <div key={idx}>
              <p className="font-semibold">{edu.degree} — {edu.schoolName}</p>
            </div>
          ))}
          {skillsList.length > 0 && (
            <p className="text-center text-gray-700">{skillsList.map((s) => s.name).join(' · ')}</p>
          )}
        </div>
      </div>
    )
  }

  /* ——— Modern Blue (refreshed) ——— */
  return (
    <div className={`${wrap} font-sans p-6 space-y-4`}>
      <div className="flex justify-between items-end border-b border-gray-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{basicInfo.name}</h2>
          <p className="text-blue-600 text-xs font-semibold mt-0.5">{headline}</p>
        </div>
        <div className="text-[9px] text-gray-500 text-right">
          <p>{basicInfo.email}</p>
          {basicInfo.phone && <p>{basicInfo.phone}</p>}
          {basicInfo.location && <p>{basicInfo.location}</p>}
        </div>
      </div>
      {basicInfo.summary && <p className="text-[11px] text-gray-600 leading-relaxed bg-blue-50/50 p-3 rounded-md border border-blue-100">{basicInfo.summary}</p>}
      {experienceList.map((exp, idx) => (
        <div key={idx} className="text-[11px] border-l-2 border-blue-500 pl-3">
          <div className="flex justify-between font-semibold">
            <span>{exp.jobTitle}</span>
            <span className="text-[9px] text-gray-500">{exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate || ''}</span>
          </div>
          <p className="text-blue-700 text-[10px]">{exp.company}</p>
          {exp.description && <p className="text-gray-600 mt-1 whitespace-pre-line">{exp.description}</p>}
        </div>
      ))}
      {educationList.map((edu, idx) => (
        <div key={idx} className="text-[11px]">
          <p className="font-semibold">{edu.degree} · {edu.schoolName}</p>
        </div>
      ))}
      {skillsList.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skillsList.map((s, i) => (
            <span key={i} className="text-[9px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">{s.name}</span>
          ))}
        </div>
      )}
    </div>
  )
}
