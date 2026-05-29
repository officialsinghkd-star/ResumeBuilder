import apiClient from '../api-client';

export interface FeedbackPayload {
  name: string;
  email: string;
  type: 'suggestion' | 'bug' | 'template' | 'other';
  message: string;
}

class FeedbackService {
  async submitFeedback(payload: FeedbackPayload) {
    return apiClient.post('/feedback', payload);
  }
}

export const feedbackService = new FeedbackService();
export default feedbackService;
