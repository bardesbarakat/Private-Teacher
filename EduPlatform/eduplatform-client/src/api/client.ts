import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const apiClient = axios.create({
  baseURL: 'http://localhost:5166/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock APIs for UI development
export const authApi = {
  login: async (data: any) => {
    // Mock successful login
    return new Promise(resolve => setTimeout(() => resolve({ 
      data: { token: 'mock-token', user: { id: '1', firstName: 'طالب', lastName: 'تجريبي', email: data.email, role: 'student' } } 
    }), 1000));
  },
  register: async (data: any) => {
    return new Promise(resolve => setTimeout(() => resolve({
      data: { token: 'mock-token', user: { id: '1', firstName: data.firstName, lastName: data.lastName, email: data.email, role: 'student' } }
    }), 1000));
  }
};

export const coursesApi = {
  getAll: async () => {
    return new Promise(resolve => setTimeout(() => resolve({
      data: [
        {
          id: '1',
          title: 'أساسيات البرمجة بلغة بايثون',
          shortDescription: 'تعلم بايثون من الصفر حتى الاحتراف مع مشاريع عملية وتطبيقات حقيقية.',
          category: 'programming',
          level: 'مبتدئ',
          isFree: true,
          price: 0,
          lessonsCount: 24,
          enrollmentsCount: 1250,
          features: ['شهادة معتمدة', 'مشاريع عملية', 'دعم فني', 'وصول مدى الحياة']
        },
        {
          id: '2',
          title: 'الذكاء الاصطناعي وتعلم الآلة',
          shortDescription: 'مقدمة شاملة في خوارزميات الذكاء الاصطناعي وبناء نماذج تعلم الآلة.',
          category: 'ai',
          level: 'متوسط',
          isFree: false,
          price: 1500,
          lessonsCount: 45,
          enrollmentsCount: 840,
          features: ['تطبيقات حقيقية', 'مشاريع تخرج', 'دعم فني', 'شهادة معتمدة']
        },
        {
          id: '3',
          title: 'تطوير واجهات المستخدم',
          shortDescription: 'احترف HTML, CSS, JavaScript و React لبناء تطبيقات ويب حديثة.',
          category: 'web',
          level: 'مبتدئ',
          isFree: false,
          price: 900,
          lessonsCount: 32,
          enrollmentsCount: 2100,
          features: ['تصميم متجاوب', 'مكتبات حديثة', 'مشاريع تفاعلية', 'دعم فني']
        }
      ]
    }), 500));
  },
  getById: async (id: string) => {
    return new Promise(resolve => setTimeout(() => resolve({
      data: {
        id,
        title: 'أساسيات البرمجة بلغة بايثون',
        shortDescription: 'تعلم بايثون من الصفر حتى الاحتراف مع مشاريع عملية وتطبيقات حقيقية.',
        description: 'في هذا الكورس، ستتعلم كل ما تحتاجه للبدء في عالم البرمجة باستخدام لغة بايثون. سنبدأ بالأساسيات وننتقل تدريجياً إلى المفاهيم المتقدمة.',
        category: 'programming',
        level: 'مبتدئ',
        isFree: true,
        price: 0,
        lessonsCount: 24,
        enrollmentsCount: 1250,
        features: ['شهادة معتمدة', 'مشاريع عملية', 'دعم فني', 'وصول مدى الحياة'],
        chapters: [
          { id: 'c1', title: 'مقدمة في بايثون', lessons: [{id: 'l1', title: 'تثبيت بيئة العمل'}, {id: 'l2', title: 'أول برنامج لك'}] },
          { id: 'c2', title: 'المتغيرات والبيانات', lessons: [{id: 'l3', title: 'أنواع البيانات'}, {id: 'l4', title: 'العمليات الحسابية'}] }
        ],
        instructor: { name: 'أحمد محمد', title: 'مهندس برمجيات أول', image: 'https://i.pravatar.cc/150?u=1' }
      }
    }), 500));
  },
  enroll: async (id: string) => {
    return new Promise(resolve => setTimeout(() => resolve({ data: { success: true } }), 800));
  }
};

export const lessonsApi = {
  getById: async (id: string) => {
    return new Promise(resolve => setTimeout(() => resolve({ data: { id, title: 'درس تجريبي', videoUrl: '...' } }), 500));
  }
};

export const examsApi = {
  getById: async (id: string) => {
    return new Promise(resolve => setTimeout(() => resolve({
      data: {
        id,
        title: 'اختبار بايثون النهائي',
        timeLimitMinutes: 30,
        questions: [
          { id: 'q1', text: 'ما هي الكلمة المفتاحية لتعريف دالة في بايثون؟', choices: ['func', 'def', 'function', 'define'] },
          { id: 'q2', text: 'ما هو ناتج 3 ** 2 في بايثون؟', choices: ['6', '9', '12', 'Error'] },
          { id: 'q3', text: 'أي من التالي يُستخدم لإنشاء قائمة في بايثون؟', choices: ['()', '{}', '[]', '<>'] }
        ]
      }
    }), 500));
  },
  submit: async (id: string, answers: any) => {
    return new Promise(resolve => setTimeout(() => resolve({
      data: {
        id: 'r1',
        score: 85,
        grade: 'جيد جداً',
        correctCount: 17,
        totalCount: 20
      }
    }), 1000));
  }
};

export const studentApi = {
  dashboard: async () => {
    return new Promise(resolve => setTimeout(() => resolve({
      data: {
        stats: { enrolledCourses: 3, lastExamScore: 92, studyHours: 45, upcomingTasks: 2 },
        enrolledCourses: [
          { id: '1', title: 'أساسيات البرمجة بلغة بايثون', progress: 65, nextLessonId: 'l4' },
          { id: '2', title: 'الذكاء الاصطناعي وتعلم الآلة', progress: 12, nextLessonId: 'l1' }
        ],
        upcomingExams: [
          { id: 'e1', title: 'اختبار بايثون النهائي', date: '2026-08-10', courseId: '1' }
        ]
      }
    }), 600));
  }
};

export default apiClient;
