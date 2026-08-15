import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
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

      {/* Fallback — أي مسار خطأ يرجع للصفحة الرئيسية */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1a3028',
              color: '#EAF2EE',
              border: '1px solid rgba(52,211,153,.25)',
              fontFamily: 'Cairo, sans-serif',
              direction: 'rtl',
            },
            success: { iconTheme: { primary: '#34D399', secondary: '#04130C' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}