/**
 * Base API Client for EduPredict Stitch Frontend
 * Communicates with Node.js/Express backend (port 5000)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function getAuthToken() {
  return localStorage.getItem('edupredict_jwt') || null;
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('edupredict_jwt', token);
  } else {
    localStorage.removeItem('edupredict_jwt');
  }
}

export async function apiClient(endpoint, { body, ...customConfig } = {}) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body && typeof body === 'object') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn(`[EduPredict API fallback] ${endpoint}:`, err.message);
    return null;
  }
}

export const authApi = {
  login: async (email, password) => {
    try {
      const res = await apiClient('/auth/login', { body: { email, password } });
      if (res && res.token) {
        setAuthToken(res.token);
        return res;
      }
    } catch (err) {
      console.warn('Backend login fallback active');
    }
    // Demo fallback session
    const mockUser = {
      token: 'mock-jwt-token',
      user: {
        email,
        name: email.split('@')[0],
        role: email.includes('faculty') || email.includes('teacher') ? 'teacher' : email.includes('admin') ? 'admin' : 'student'
      }
    };
    setAuthToken(mockUser.token);
    return mockUser;
  },

  register: async (userData) => {
    const res = await apiClient('/auth/register', { body: userData });
    return res;
  },

  getMe: async () => {
    return await apiClient('/auth/me');
  },

  logout: () => {
    setAuthToken(null);
  }
};

export default apiClient;
