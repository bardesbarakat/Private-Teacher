import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner--lg" />
        <span>جارٍ التحقق...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const dashboardPath = role === 'Teacher' ? '/teacher' : role === 'Parent' ? '/parent' : '/student';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
}
