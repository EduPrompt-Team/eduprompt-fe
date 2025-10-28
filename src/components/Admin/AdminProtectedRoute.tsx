import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/api';
import { checkIsAdmin } from '@/utils/auth';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Component to protect admin routes - only allows access for Admin role
 */
const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      // User not logged in, redirect to login
      navigate('/login');
      return;
    }

    if (!checkIsAdmin(user)) {
      // User is not admin, redirect to home
      alert('Bạn không có quyền truy cập trang quản trị!');
      navigate('/home');
    }
  }, [navigate]);

  // Don't render children if not admin or not logged in
  if (!user || !checkIsAdmin(user)) {
    return null;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;

