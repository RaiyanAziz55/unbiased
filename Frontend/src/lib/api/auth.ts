const API_BASE_URL = 'http://localhost:8001';

export interface AuthResponse {
  message: string;
  user_id: string;
  username?: string;
}

export interface AuthError {
  detail: string;
}

export const authApi = {
  async signup(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error: AuthError = await response.json();
      throw new Error(error.detail || 'Signup failed');
    }

    return response.json();
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error: AuthError = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  },

  // Session management
  saveSession(userId: string, username: string) {
    localStorage.setItem('user_id', userId);
    localStorage.setItem('username', username);
  },

  getSession() {
    const userId = localStorage.getItem('user_id');
    const username = localStorage.getItem('username');
    return userId && username ? { userId, username } : null;
  },

  clearSession() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
  },

  isAuthenticated() {
    return !!localStorage.getItem('user_id');
  },
};
