import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('bedu_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('bedu_token');
      localStorage.removeItem('bedu_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser   = (data) => API.post('/auth/login', data);
export const getMe       = ()     => API.get('/auth/me');

// Courses
export const getAllCourses   = (level) => API.get('/courses', { params: level ? { level } : {} });
export const getCourseById   = (id)    => API.get(`/courses/${id}`);
export const getMyCourses    = ()      => API.get('/courses/my');
export const createCourse    = (data)  => API.post('/courses', data);
export const updateCourse    = (id, d) => API.put(`/courses/${id}`, d);
export const deleteCourse    = (id)    => API.delete(`/courses/${id}`);
export const enrollCourse    = (cId)   => API.post('/courses/enroll', { courseId: cId });
export const getEnrolled     = ()      => API.get('/courses/enrolled');

// Lessons
export const getLessonsByCourse = (cId) => API.get(`/lessons/course/${cId}`);
export const getLessonById      = (id)  => API.get(`/lessons/${id}`);
export const createLesson       = (d)   => API.post('/lessons', d);
export const updateLesson       = (id, d) => API.put(`/lessons/${id}`, d);
export const deleteLesson       = (id)  => API.delete(`/lessons/${id}`);

// Exams
export const getExamsByCourse = (cId) => API.get(`/exams/course/${cId}`);
export const takeExam         = (id)  => API.get(`/exams/${id}/take`);
export const submitExam       = (d)   => API.post('/exams/submit', d);
export const getMyResults     = ()    => API.get('/exams/my-results');
export const getResult        = (id)  => API.get(`/exams/results/${id}`);
export const getStudentResults = (sId) => API.get(`/exams/student/${sId}/results`);
export const createExam       = (d)   => API.post('/exams', d);

// Admin
export const adminGetStats       = ()      => API.get('/admin/stats');
export const adminGetUsers       = (role, search) => API.get('/admin/users', { params: { role, search } });
export const adminToggleUser     = (id)    => API.put(`/admin/users/${id}/toggle`);
export const adminDeleteUser     = (id)    => API.delete(`/admin/users/${id}`);
export const adminGetCourses     = ()      => API.get('/admin/courses');
export const adminToggleCourse   = (id)    => API.put(`/admin/courses/${id}/toggle`);
export const adminDeleteCourse   = (id)    => API.delete(`/admin/courses/${id}`);
export const adminGetSubmissions = ()      => API.get('/admin/submissions');
export const adminMakeAdmin      = (id)    => API.post(`/admin/make-admin/${id}`);

export default API;

