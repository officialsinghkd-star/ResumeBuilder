// Analytics API service
import apiClient from '../api-client';

export interface AnalyticsEvent {
  action: string;
  metadata?: Record<string, any>;
  resumeId?: string;
}

export interface DashboardAnalytics {
  totalResumes: number;
  totalViews: number;
  totalDownloads: number;
  averageScore: number;
  recentActivity: any[];
  topResumes: any[];
  analytics?: any[];
}

export interface ResumeAnalytics {
  resumeId: string;
  viewCount: number;
  downloadCount: number;
  lastViewed?: string;
  viewHistory: any[];
}

class AnalyticsService {
  // Get dashboard analytics
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const result = await apiClient.get<DashboardAnalytics | { analytics: any[] }>(
      '/analytics/dashboard'
    );
    return result as DashboardAnalytics;
  }

  // Get resume-specific analytics
  async getResumeAnalytics(resumeId: string): Promise<ResumeAnalytics> {
    return apiClient.get<ResumeAnalytics>(`/analytics/resumes/${resumeId}`);
  }

  // Track custom event
  async trackEvent(event: AnalyticsEvent): Promise<{ success: boolean }> {
    return apiClient.post('/analytics/track', event);
  }

  // Track page view
  async trackPageView(page: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      action: 'page_view',
      metadata: { page, ...metadata },
    });
  }

  // Track resume view
  async trackResumeView(resumeId: string): Promise<void> {
    await this.trackEvent({
      action: 'resume_view',
      resumeId,
    });
  }

  // Track resume download
  async trackResumeDownload(resumeId: string): Promise<void> {
    await this.trackEvent({
      action: 'resume_download',
      resumeId,
    });
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
