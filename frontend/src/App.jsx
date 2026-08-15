import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import Courses from './pages/Courses';
import AdminDashboard from './pages/AdminDashboard';
import PendingApproval from './pages/PendingApproval';

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();

  // التوجيه التلقائي حسب صلاحية المستخدم (شامل دور الأدمن)
  const dashboardRedirect = isAuthenticated
    ? (role === 'Admin' ? '/admin' : role === 'Teacher' ? '/teacher' : role === 'Parent' ? '/parent' : '/student')
    : '/login';

  return (
    <Routes>
      <Route path="/" element={<><Navbar /><Home /></>} />
      <Route path="/courses" element={<><Navbar /><Courses /></>} />

      {/* Auth pages — إعادة التوجيه لو المستخدم مسجل دخول بالفعل */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={dashboardRedirect} replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={dashboardRedirect} replace /> : <Register />} />

      {/* Protected dashboards — اللوحات المحمية بصلاحياتها */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['Student']}>
          <><Navbar /><StudentDashboard /></>
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
    </ThemeProvider>
  );
}