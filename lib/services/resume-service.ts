// Resume API service
import apiClient from '../api-client';

export interface PersonalInfo {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  summary?: string;
}

export interface Experience {
  company: string;
  jobTitle: string;
  startDate?: string;
  endDate?: string;
  currentlyWorking?: boolean;
  description?: string;
  location?: string;
}

export interface Education {
  schoolName: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  currentlyStudying?: boolean;
  description?: string;
}

export interface Skill {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'expert';
  endorsements?: number;
}

export interface Certification {
  name: string;
  issuer?: string;
  date?: string;
  credentialUrl?: string;
}

export interface Project {
  name: string;
  description?: string;
  url?: string;
  technologies?: string[];
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface Resume {
  _id: string;
  id?: string;
  userId: string;
  title: string;
  templateId?: string;
  personalInfo: PersonalInfo;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: Skill[];
  certifications?: Certification[];
  projects?: Project[];
  socialLinks?: SocialLink[];
  score?: number;
  viewCount?: number;
  downloadCount?: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CreateResumeData {
  title: string;
  templateId?: string;
  personalInfo: PersonalInfo;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: Skill[];
  certifications?: Certification[];
  projects?: Project[];
  socialLinks?: SocialLink[];
  status?: 'draft' | 'published';
}

export interface UpdateResumeData {
  title?: string;
  templateId?: string;
  personalInfo?: Partial<PersonalInfo>;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: Skill[];
  certifications?: Certification[];
  projects?: Project[];
  socialLinks?: SocialLink[];
  status?: 'draft' | 'published' | 'archived';
}

export interface PaginatedResumes {
  data: Resume[];
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

class ResumeService {
  // Create new resume
  async createResume(data: CreateResumeData): Promise<Resume> {
    const response = await apiClient.post<{ resume: Resume }>('/resumes', data);
    return response.resume;
  }

  // Get all user resumes
  async getUserResumes(page: number = 1, limit: number = 20): Promise<PaginatedResumes> {
    return apiClient.get<PaginatedResumes>(`/resumes?page=${page}&limit=${limit}`);
  }

  // Get single resume by ID
  async getResume(resumeId: string): Promise<Resume> {
    const response = await apiClient.get<{ resume: Resume }>(`/resumes/${resumeId}`);
    return response.resume;
  }

  // Update resume
  async updateResume(resumeId: string, data: UpdateResumeData): Promise<Resume> {
    const response = await apiClient.put<{ resume: Resume }>(`/resumes/${resumeId}`, data);
    return response.resume;
  }

  // Delete resume
  async deleteResume(resumeId: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/resumes/${resumeId}`);
  }

  // Score resume (0-100)
  async scoreResume(resumeId: string): Promise<{ score: number; feedback?: string }> {
    return apiClient.post(`/resumes/${resumeId}/score`, {});
  }

  // Generate PDF
  async generatePDF(resumeId: string): Promise<Blob> {
    const headers = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/resumes/${resumeId}/pdf`,
      { 
        method: 'POST',
        headers 
      }
    );

    const contentType = response.headers.get('content-type') ?? '';

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`PDF generation failed: ${response.status} - ${errorData}`);
    }

    if (!contentType.includes('application/pdf')) {
      const body = await response.text();
      throw new Error(
        body || 'Server did not return a PDF. Ensure the backend is running and Chrome/Edge is installed.'
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Blob([arrayBuffer], { type: 'application/pdf' });
  }

  // Download PDF
  async downloadPDF(resumeId: string, fileName: string = 'resume.pdf'): Promise<void> {
    const blob = await this.generatePDF(resumeId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Get AI Suggestions
  async getAiSuggestions(resumeId: string, content: any): Promise<any> {
    const headers = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json',
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/ai/suggestions/resume`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ resumeContent: JSON.stringify(content) }),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch AI suggestions');
    }
    const result = await response.json();
    return result.data?.suggestions || result.suggestions;
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }
}

export const resumeService = new ResumeService();
export default resumeService;
