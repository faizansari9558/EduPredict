/**
 * Base API Client for EduPredict Stitch Frontend
 * Communicates with Node.js/Express backend (port 5000)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
  const headers = {};
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (!isFormData) headers['Content-Type'] = 'application/json';

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

  if (body && typeof body === 'object' && !isFormData) {
    config.body = JSON.stringify(body);
  } else if (isFormData) {
    config.body = body;
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
    throw err;
  }
}

export const authApi = {
  checkUniversityRecord: body => apiClient('/auth/check-record', {body}),
  verifyOtp: body => apiClient('/auth/verify-otp', {body}),
  login: async (email,password) => { const res=await apiClient('/auth/login',{body:{email,password}}); setAuthToken(res.token); return res; },
  register: async body => { const res=await apiClient('/auth/register',{body}); setAuthToken(res.token); return res; },
  requestPasswordReset: email => apiClient('/auth/forgot-password', { body: { email } }),
  getMe: () => apiClient('/auth/me'),
  logout: () => setAuthToken(null)
};

export const adminApi = {
  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/admin/users${query ? `?${query}` : ''}`;
    return await apiClient(endpoint);
  },
  createUser: async (userData) => {
    return await apiClient('/admin/users', { body: userData });
  },
  bulkImportUsers: async (usersOrFile) => {
    if (usersOrFile instanceof File) {
      return await apiClient('/admin/users/bulk', { body: usersOrFile });
    }
    return await apiClient('/admin/users/bulk', { body: { users: usersOrFile } });
  }
};

export default apiClient;
