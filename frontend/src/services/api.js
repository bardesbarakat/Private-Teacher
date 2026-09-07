import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API = axios.create({
  baseURL: API_BASE_URL,
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

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

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

export const getStudentStats = ()      => API.get('/student/stats');

// Curriculum (Instructor)
export const getCourseCurriculum = (cId, includeDrafts) => API.get(`/curriculum/course/${cId}`, { params: { includeDrafts } });
export const createTrack       = (d)   => API.post('/curriculum/tracks', d);
export const createChapter     = (d)   => API.post('/curriculum/chapters', d);
export const updateChapter     = (id, d) => API.put(`/curriculum/chapters/${id}`, d);
export const deleteChapter     = (id)  => API.delete(`/curriculum/chapters/${id}`);
export const createLesson      = (d)   => API.post('/curriculum/lessons', d);
export const updateLesson      = (id, d) => API.put(`/curriculum/lessons/${id}`, d);
export const deleteLesson      = (id)  => API.delete(`/curriculum/lessons/${id}`);

export const seedOfficialCurriculum = (cId) => API.post(`/curriculum/course/${cId}/seed-official`);
export const addResource = (d) => API.post('/curriculum/resources', d);
export const deleteResource = (id) => API.delete(`/curriculum/resources/${id}`);

// Lesson Access Codes
export const generateLessonCodes = (lessonId, count) => API.post(`/teacher/lessons/${lessonId}/generate-codes`, { count });
export const getLessonCodes = (lessonId) => API.get(`/teacher/lessons/${lessonId}/codes`);
export const redeemLessonCode = (code) => API.post('/student/lessons/redeem-code', { code });

// Exams
export const getExamsByCourse = (cId) => API.get(`/exams/course/${cId}`);
export const getExamDetail    = (id)  => API.get(`/exams/${id}`);
export const submitExam       = (id, d)   => API.post(`/exams/${id}/submit`, d);
export const getMyResults     = ()    => API.get('/exams/results/me');
export const getResult        = (id)  => API.get(`/exams/results/${id}`);
export const getStudentResults = (sId) => API.get(`/exams/student/${sId}/results`);
export const createExam       = (d)   => API.post('/exams', d);
export const updateExam       = (id, d) => API.put(`/exams/${id}`, d);
export const deleteExam       = (id)  => API.delete(`/exams/${id}`);

// Admin
export const adminGetStats         = ()        => API.get('/admin/stats');
export const adminGetUsers         = (role, search) => API.get('/admin/users', { params: { role, search } });
export const adminToggleUser       = (id)      => API.put(`/admin/users/${id}/toggle`);
export const adminDeleteUser       = (id)      => API.delete(`/admin/users/${id}`);
export const adminMakeAdmin        = (id)      => API.post(`/admin/make-admin/${id}`);
export const adminGetPendingTeachers = ()      => API.get('/admin/pending-teachers');
export const adminApproveTeacher   = (id)      => API.put(`/admin/teachers/${id}/approve`);
export const adminRejectTeacher    = (id)      => API.put(`/admin/teachers/${id}/reject`);
export const adminGetTeachers      = ()        => API.get('/admin/teachers');
export const adminGetCourses       = ()        => API.get('/admin/courses');
export const adminToggleCourse     = (id)      => API.put(`/admin/courses/${id}/toggle`);
export const adminDeleteCourse     = (id)      => API.delete(`/admin/courses/${id}`);
export const adminCreateCourse     = (data)    => API.post('/admin/courses', data);
export const adminUpdateCourse     = (id, data)=> API.put(`/admin/courses/${id}/edit`, data);
export const adminGetSubmissions   = ()        => API.get('/admin/submissions');

export default API;
