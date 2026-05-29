import apiClient from '../api-client';
import { Resume } from './resume-service';

export interface ShareLink {
  token: string;
  resumeId: string;
  isActive: boolean;
  expiresAt?: string;
  viewCount: number;
}

class ShareService {
  async createShareLink(resumeId: string): Promise<ShareLink> {
    const response = await apiClient.post<{ shareLink: ShareLink }>(
      `/share/resumes/${resumeId}/share`,
      { expiresIn: 'never' }
    );
    return response.shareLink;
  }

  async getSharedResume(token: string): Promise<{ resume: Resume; shareLink: ShareLink }> {
    return apiClient.get(`/share/share/${token}`);
  }
}

export const shareService = new ShareService();
export default shareService;
