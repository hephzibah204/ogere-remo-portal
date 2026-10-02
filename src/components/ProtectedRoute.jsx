import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--gold)', fontFamily: "'Cinzel', serif" }}>Verifying Clearance...</div>
      </div>
    );
  }

  if (!user) {
    // Not logged in, redirect to signin with a return url
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user.role);
    if (!hasRole) {
      // Logged in but insufficient permissions
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
