import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import StudentHome from './pages/StudentHome';
import StudentProfile from './pages/StudentProfile';
import PlaceholderPage from './pages/PlaceholderPage';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import Courses from './pages/Courses';
import AdminDashboard from './pages/AdminDashboard';
import PendingApproval from './pages/PendingApproval';
import LearningTheater from './features/learning/LearningTheater';
import StudentLayout from './components/StudentLayout';

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();

  // التوجيه التلقائي حسب صلاحية المستخدم (شامل دور الأدمن)
  const dashboardRedirect = isAuthenticated
    ? (role === 'Admin' ? '/admin' : role === 'Teacher' ? '/teacher' : role === 'Parent' ? '/parent' : '/dashboard')
    : '/login';

  return (
    <Routes>
      <Route path="/" element={<><Navbar /><Home /></>} />
      <Route path="/courses" element={<><Navbar /><Courses /></>} />

      {/* Auth pages — إعادة التوجيه لو المستخدم مسجل دخول بالفعل */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={dashboardRedirect} replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={dashboardRedirect} replace /> : <Register />} />

      {/* Protected dashboards — اللوحات المحمية بصلاحياتها */}
      {/* Student App Shell */}
      <Route element={<ProtectedRoute allowedRoles={['Student']}><StudentLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<StudentHome />} />
        <Route path="/course-materials" element={<StudentDashboard />} />
        <Route path="/profile" element={<StudentProfile />} />
        
        {/* Placeholder Routes */}
        <Route path="/sessions" element={<PlaceholderPage icon="📅" titleEn="Sessions" titleAr="الجلسات" subEn="Manage your upcoming live sessions and meetings." subAr="إدارة الجلسات والاجتماعات المباشرة القادمة." descEn="Welcome to the Sessions page. Here you can view your schedule, upcoming meetings, and join live rooms assigned by your instructor." descAr="مرحباً بك في صفحة الجلسات. هنا يمكنك عرض جدولك والانضمام للغرف الحية المحددة من معلمك." />} />
        <Route path="/exams" element={<PlaceholderPage icon="📝" titleEn="Exams" titleAr="الاختبارات" subEn="View upcoming tests and past results." subAr="عرض الاختبارات القادمة والنتائج السابقة." descEn="Welcome to the Exams page. Here you can view your upcoming tests, deadlines, and review past results." descAr="مرحباً بك في صفحة الاختبارات. هنا يمكنك رؤية الاختبارات القادمة، المواعيد النهائية، ومراجعة نتائجك السابقة." />} />
        <Route path="/projects" element={<PlaceholderPage icon="🚀" titleEn="Projects" titleAr="المشاريع" subEn="Submit assignments and track project grades." subAr="تسليم الواجبات ومتابعة درجات المشاريع." descEn="Welcome to the Projects page. Here you can submit your assignments, track your progress, and view feedback." descAr="مرحباً بك في صفحة المشاريع. هنا يمكنك تسليم مهامك، متابعة تقدمك، وعرض ملاحظات المعلم." />} />
        <Route path="/resources" element={<PlaceholderPage icon="📂" titleEn="Resources" titleAr="المصادر" subEn="Download extra materials and reading books." subAr="تحميل المواد الإضافية والكتب المقالية." descEn="Welcome to the Resources page. Download external links, PDFs, and reading materials provided for extra knowledge." descAr="مرحباً بك في صفحة المصادر. قم بتنزيل الروابط الخارجية وملفات الـ PDF والمواد الإضافية للمعرفة." />} />
        <Route path="/faqs" element={<PlaceholderPage icon="❓" titleEn="FAQS" titleAr="الأسئلة الشائعة" subEn="Find answers to common questions." subAr="ابحث عن إجابات للأسئلة المتداولة." descEn="Welcome to the FAQS page. Find guides and answers to the most commonly asked questions about using the platform." descAr="مرحباً بك في الأسئلة الشائعة. ابحث عن أدلة وإجابات للأسئلة الأكثر شيوعاً حول استخدام المنصة." />} />
      </Route>
      
      {/* Retain old /student route pointing to dashboard for backward compatibility during transition */}
      <Route path="/student" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="/course-materials/:courseId" element={
        <ProtectedRoute allowedRoles={['Student']}>
          <LearningTheater />
        </ProtectedRoute>
      } />
      {/* Map old learn URL to new for backward compatibility */}
      <Route path="/learn/:courseId" element={
        <ProtectedRoute allowedRoles={['Student']}>
          <LearningTheater />
        </ProtectedRoute>
      } />
      
      <Route path="/teacher" element={
        <ProtectedRoute allowedRoles={['Teacher']}>
          <><Navbar /><TeacherDashboard /></>
        </ProtectedRoute>
      } />
      
      <Route path="/parent" element={
        <ProtectedRoute allowedRoles={['Parent']}>
          <><Navbar /><ParentDashboard /></>
        </ProtectedRoute>
      } />

      {/* لوحة تحكم الأدمن (محمية ومؤمنة بالكامل) */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <><Navbar /><AdminDashboard /></>
        </ProtectedRoute>
      } />

      {/* حسابات قيد المراجعة */}
      <Route path="/pending-approval" element={<PendingApproval />} />

      {/* Fallback — أي مسار خطأ يرجع للصفحة الرئيسية */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: 'var(--bg-0)',
                  color: 'var(--text)',
                  border: '1px solid var(--mint-line)',
                  fontFamily: 'Cairo, sans-serif',
                  direction: 'rtl',
                },
                success: { iconTheme: { primary: 'var(--mint)', secondary: 'var(--bg-0)' } },
                error:   { iconTheme: { primary: 'var(--danger-solid)', secondary: 'var(--text-ink)' } },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}