import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { LanguageProvider } from './i18n/LanguageContext';

// Pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import CourseDetail from './pages/CourseDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Exam from './pages/Exam';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

const App = () => {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/catalog" element={<PublicLayout><Catalog /></PublicLayout>} />
            <Route path="/courses/:id" element={<PublicLayout><CourseDetail /></PublicLayout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Navbar />
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/lessons/:id" element={
              <ProtectedRoute>
                <Navbar />
                <div className="container" style={{ paddingTop: '100px' }}>
                  <h1>Lesson (Coming Soon)</h1>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/exams/:id" element={
              <ProtectedRoute>
                <Exam />
              </ProtectedRoute>
            } />
            <Route path="/results/:id" element={
              <ProtectedRoute>
                <Navbar />
                <div className="container" style={{ paddingTop: '100px' }}>
                  <h1>Results (Coming Soon)</h1>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#111',
                color: '#F5F0E8',
                border: '1px solid rgba(245,200,66,.20)',
                fontFamily: "'Cairo', sans-serif",
              },
              success: {
                iconTheme: { primary: '#F5C842', secondary: '#111' },
              },
              error: {
                iconTheme: { primary: '#F87171', secondary: '#111' },
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </LanguageProvider>
  );
};

export default App;
