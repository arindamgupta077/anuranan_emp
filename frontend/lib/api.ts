import axios from 'axios';
import { supabase } from './supabaseClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, sign out
      await supabase.auth.signOut();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API methods
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const tasksAPI = {
  list: (params?: any) => api.get('/tasks', { params }),
  get: (id: number) => api.get(`/tasks/${id}`),
  create: (data: any) => api.post('/tasks', data),
  updateStatus: (id: number, status: string) =>
    api.patch(`/tasks/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/tasks/${id}`),
};

export const selfTasksAPI = {
  list: (params?: any) => api.get('/self-tasks', { params }),
  create: (data: any) => api.post('/self-tasks', data),
  update: (id: number, data: any) => api.patch(`/self-tasks/${id}`, data),
  delete: (id: number) => api.delete(`/self-tasks/${id}`),
};

export const leavesAPI = {
  list: (params?: any) => api.get('/leaves', { params }),
  create: (data: any) => api.post('/leaves', data),
  update: (id: number, data: any) => api.patch(`/leaves/${id}`, data),
  delete: (id: number) => api.delete(`/leaves/${id}`),
  updateStatus: (id: number, status: 'APPROVED' | 'REJECTED') => 
    api.patch(`/leaves/${id}/status`, { status }),
};

export const adminAPI = {
  listEmployees: (params?: any) => api.get('/admin/employees', { params }),
  getRoles: () => api.get('/admin/roles'),
  createEmployee: (data: any) => api.post('/admin/employees', data),
  updateEmployee: (id: string, data: any) =>
    api.patch(`/admin/employees/${id}`, data),
  deleteEmployee: (id: string) => api.delete(`/admin/employees/${id}`),
  resetPassword: (id: string, newPassword: string) =>
    api.post(`/admin/employees/${id}/reset-password`, { new_password: newPassword }),
  createRecurringTask: (data: any) => api.post('/admin/recurring-tasks', data),
};

export const reportsAPI = {
  getPerformance: (params?: any) => api.get('/reports/performance', { params }),
  getTasksSummary: (params?: any) => api.get('/reports/tasks-summary', { params }),
  getRecurringTasks: () => api.get('/reports/recurring-tasks'),
  getLeavesSummary: (params?: any) => api.get('/reports/leaves-summary', { params }),
  getDashboard: () => api.get('/reports/dashboard'),
};
