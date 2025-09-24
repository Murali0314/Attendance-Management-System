import axios from 'axios';

// Create a new Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add a request interceptor to attach the token from local storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Attach the token in the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const Auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

export const Students = {
  add: (data) => api.post('/students/add', data),
  list: (params) => api.get('/students', { params }),
  update: (id, data) => api.put(`/students/${id}`, data),
  remove: (id) => api.delete(`/students/${id}`),
};

export const Attendance = {
  save: (data) => api.post('/attendance/save', data),
  get: (params) => api.get('/attendance', { params }),
};

export const Admin = {
  students: (params) => api.get('/admin/students', { params }),
  teachers: () => api.get('/admin/teachers'),
  updateTeacher: (id, data) => api.put(`/admin/teachers/${id}`, data),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
};
