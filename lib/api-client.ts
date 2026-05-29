// API configuration and base instance
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// API instance class
class APIClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = this.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    }
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax';
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const payload = await response.json();
    const data = payload.data ?? payload;
    if (!data.accessToken || !data.refreshToken) return false;

    this.setTokens(data.accessToken, data.refreshToken);
    if (data.user && typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return true;
  }

  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: Record<string, any>
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: this.getHeaders(),
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    try {
      let response = await fetch(url, options);

      let responseData: Record<string, unknown> = {};
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        try {
          responseData = (await response.json()) as Record<string, unknown>;
        } catch {
          responseData = {};
        }
      }

      const apiMessage =
        typeof responseData.message === 'string'
          ? responseData.message
          : undefined;

      // Handle 401 - Unauthorized
      if (response.status === 401) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          const retryOptions: RequestInit = {
            ...options,
            headers: this.getHeaders(),
          };
          response = await fetch(url, retryOptions);

          const retryContentType = response.headers.get('content-type') ?? '';
          responseData = {};
          if (retryContentType.includes('application/json')) {
            try {
              responseData = (await response.json()) as Record<string, unknown>;
            } catch {
              responseData = {};
            }
          }

          if (response.ok) {
            return (responseData.data ?? responseData) as T;
          }
        }

        this.clearTokens();
        throw new Error(apiMessage || 'Unauthorized - Please login');
      }

      if (!response.ok) {
        throw new Error(apiMessage || `HTTP Error: ${response.status}`);
      }

      return (responseData.data ?? responseData) as T;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(
          'Cannot reach the API server. Start the backend (port 5000) and MongoDB, then try again.'
        );
      }
      throw error;
    }
  }

  // Convenience methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, data?: Record<string, any>): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  async put<T>(endpoint: string, data?: Record<string, any>): Promise<T> {
    return this.request<T>('PUT', endpoint, data);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }

  async patch<T>(endpoint: string, data?: Record<string, any>): Promise<T> {
    return this.request<T>('PATCH', endpoint, data);
  }
}

// Export single instance
export const apiClient = new APIClient(API_CONFIG.baseURL, API_CONFIG.timeout);

export default apiClient;
