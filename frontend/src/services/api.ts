import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

// Employees
export const getEmployees = (params?: any) => api.get('/employees', { params });
export const getEmployee = (id: number) => api.get(`/employees/${id}`);
export const getMyProfile = () => api.get('/employees/me');
export const createEmployee = (data: any) => api.post('/employees', data);
export const updateEmployee = (id: number, data: any) => api.put(`/employees/${id}`, data);
export const deactivateEmployee = (id: number) => api.delete(`/employees/${id}`);

// Timesheets
export const getTimesheets = (params?: any) => api.get('/timesheets', { params });
export const submitTimesheet = (data: any) => api.post('/timesheets/submit', data);
export const approveTimesheet = (id: number, data: any) => api.put(`/timesheets/${id}/approve`, data);
export const deleteTimesheet = (id: number) => api.delete(`/timesheets/${id}`);

// Payroll
export const getSalaryComponents = (empId: number) => api.get(`/payroll/components/${empId}`);
export const setSalaryComponents = (data: any) => api.post('/payroll/components', data);
export const generatePayroll = (data: any) => api.post('/payroll/generate', data);
export const getSalaryRecords = (params?: any) => api.get('/payroll/records', { params });
export const downloadSlip = (recordId: number) =>
  api.get(`/payroll/slip/${recordId}`, { responseType: 'blob' });

// Holidays
export const getHolidays = (params?: any) => api.get('/holidays', { params });
export const createHoliday = (data: any) => api.post('/holidays', data);
export const deleteHoliday = (id: number) => api.delete(`/holidays/${id}`);

// Documents
export const getDocuments = (params?: any) => api.get('/documents', { params });
export const uploadDocument = (formData: FormData) =>
  api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const downloadDocument = (id: number) =>
  api.get(`/documents/${id}/download`, { responseType: 'blob' });
export const deleteDocument = (id: number) => api.delete(`/documents/${id}`);

// Dashboard
export const getAdminDashboard = () => api.get('/dashboard/admin');
export const getEmployeeDashboard = () => api.get('/dashboard/employee');
