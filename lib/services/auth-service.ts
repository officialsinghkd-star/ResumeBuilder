// Authentication API service
import apiClient from '../api-client';

export interface AuthResponse {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    bio?: string;
    profileImage?: string;
    role: 'user' | 'admin' | 'premium_user';
    status: 'active' | 'inactive' | 'suspended';
    emailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    if (response.accessToken && response.refreshToken) {
      this.storeTokens(response.accessToken, response.refreshToken);
    }
    
    return response;
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.accessToken && response.refreshToken) {
      this.storeTokens(response.accessToken, response.refreshToken);
    }
    
    return response;
  }

  // Get current user profile
  async getProfile(): Promise<AuthResponse['user']> {
    const data = await apiClient.get<{ user: AuthResponse['user'] } | AuthResponse['user']>(
      '/auth/profile'
    );
    if (data && typeof data === 'object' && 'user' in data && data.user) {
      return data.user;
    }
    return data as AuthResponse['user'];
  }

  // Update user profile
  async updateProfile(data: ProfileUpdateData): Promise<AuthResponse['user']> {
    const result = await apiClient.put<{ user: AuthResponse['user'] } | AuthResponse['user']>(
      '/auth/profile',
      data
    );
    if (result && typeof result === 'object' && 'user' in result && result.user) {
      return result.user;
    }
    return result as AuthResponse['user'];
  }

  // Change password
  async changePassword(data: PasswordChangeData) {
    return apiClient.post('/auth/change-password', data);
  }

  async forgotPassword(email: string) {
    return apiClient.post('/auth/forgot-password', { email });
  }

  // Verify token
  async verifyToken() {
    return apiClient.get('/auth/verify');
  }

  // Logout
  async logout() {
    try {
      await apiClient.post('/auth/logout', {});
    } finally {
      this.clearSession();
    }
  }

  /** Clear local session without calling the API (e.g. expired token). */
  clearSession(): void {
    this.clearTokens();
  }

  // Token management
  private storeTokens(accessToken: string, refreshToken: string): void {
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

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('accessToken');
  }

  // Get stored access token
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  // Get stored user data
  getStoredUser() {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Store user data
  storeUser(user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
}

export const authService = new AuthService();
export default authService;
