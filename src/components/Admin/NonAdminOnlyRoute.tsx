import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/api';
import { checkIsAdmin } from '@/utils/auth';

interface NonAdminOnlyRouteProps {
  children: React.ReactNode;
}

// Restrict access for admin accounts; allow only non-admin (roleId=2/User)
const NonAdminOnlyRoute: React.FC<NonAdminOnlyRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    const u = getCurrentUser();
    if (u && checkIsAdmin(u)) {
      // Admin should not access user routes
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  if (user && checkIsAdmin(user)) return null;

  return <>{children}</>;
};

export default NonAdminOnlyRoute;


